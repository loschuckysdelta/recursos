import { Component, signal, OnInit } from '@angular/core';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { PrimeNGModule } from '../../utils/prime-ng.module';
interface Visitor {
  _id: string;
  name: string;
  email: string;
  picture: string;
  gender: string | null;
  birthDate: string;
  active: boolean;
  createdAt: string;
  lastLoginAt: string;
}
@Component({
  standalone: true,
  imports: [CommonModule, PrimeNGModule, DatePickerModule, TagModule],
  templateUrl: './user.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  users = signal<Visitor[]>([]);
  loading = signal(false);
  saving = signal(false);
  status = signal('');
  formError = signal('');
  total = signal(0);
  first = signal(0);
  modal = false;
  draft: Visitor | null = null;
  deleting: Visitor | null = null;
  today = new Date();
  minBirthDate = new Date(1900, 0, 1);
  birthDate: Date | null = null;
  genders = ['Femenino', 'Masculino', 'No binario', 'Prefiero no indicar'];
  pageSize = signal(25);
  query = '';
  state = '';
  states = [
    { label: 'Todos los estados', value: '' },
    { label: 'Activos', value: 'active' },
    { label: 'Desactivados', value: 'inactive' },
  ];
  private filters = { q: '', state: '' };
  private request = 0;
  ngOnInit() {
    void this.load(1);
  }
  search() {
    this.filters = { q: this.query.trim(), state: this.state };
    void this.load(1);
  }
  clear() {
    this.query = '';
    this.state = '';
    this.search();
  }
  paginate(first: number, rows: number) {
    const changed = rows !== this.pageSize();
    this.pageSize.set(rows);
    void this.load(changed ? 1 : Math.floor(first / rows) + 1);
  }
  async load(page: number) {
    const request = ++this.request;
    this.loading.set(true);
    this.status.set('');
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(this.pageSize()),
        ...this.filters,
      });
      const res = await fetch('/api/admin/users?' + params, { cache: 'no-store' });
      if (!res.ok) throw Error();
      const data = await res.json();
      if (request !== this.request) return;
      if (page > 1 && data.users.length === 0) {
        void this.load(page - 1);
        return;
      }
      this.users.set(data.users);
      this.total.set(data.total);
      this.first.set((page - 1) * this.pageSize());
    } catch {
      if (request === this.request) this.status.set('No se pudo cargar la lista.');
    } finally {
      if (request === this.request) this.loading.set(false);
    }
  }
  edit(user: Visitor) {
    this.draft = {
      ...user,
      gender: user.gender || '',
      birthDate: user.birthDate || '',
      active: user.active !== false,
    };
    this.draft.gender = user.gender || null;
    this.birthDate = user.birthDate ? new Date(user.birthDate + 'T00:00:00') : null;
    this.formError.set('');
    this.modal = true;
  }
  async save() {
    if (!this.draft || this.saving()) return;
    const date = this.birthDate;
    this.draft.birthDate = date
      ? [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, '0'),
          String(date.getDate()).padStart(2, '0'),
        ].join('-')
      : '';
    this.draft.gender = this.draft.gender || '';
    await this.mutate(this.draft._id, 'PATCH', this.draft);
  }
  async remove() {
    if (!this.deleting || this.saving()) return;
    await this.mutate(this.deleting._id, 'DELETE');
  }
  private async mutate(id: string, method: string, body?: Visitor) {
    this.saving.set(true);
    this.formError.set('');
    try {
      const res = await fetch('/api/admin/users/' + id, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw Error(data?.error || 'No se pudo guardar el cambio.');
      }
      this.modal = false;
      this.deleting = null;
      await this.load(this.first() / this.pageSize() + 1);
    } catch (error) {
      this.formError.set(error instanceof Error ? error.message : 'Error al guardar.');
    } finally {
      this.saving.set(false);
    }
  }
}
