import { adminFetch } from '../../services/admin-fetch';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

interface Product {
  _id?: string;
  badge: string;
  name: string;
  subtitle: string;
  image: string;
  url: string;
  buttonText: string;
  position: number;
  active: boolean;
}
const blank = (): Product => ({
  badge:'', name:'', subtitle:'', image:'', url:'',
  buttonText:'Ver producto', position:1, active:true
});
@Component({
  imports:[FormsModule,ButtonModule,DialogModule,TableModule,InputTextModule,
    SelectModule,InputNumberModule,CheckboxModule,TagModule,ProgressSpinnerModule],
  templateUrl:'./products.html',
  styleUrl:'./products.scss'
})
export class Products {
  rows = signal<Product[]>([]);
  loading = signal(false);
  saving = signal(false);
  error = signal('');
  query = signal('');
  state = signal<boolean|null>(null);
  visible = false;
  deleting = false;
  draft = blank();
  previewFailed = false;
  states = [{label:'Todos los estados',value:null},{label:'Activos',value:true},{label:'Inactivos',value:false}];
  filtered = computed(() => this.rows().filter(row =>
    (this.state() === null || row.active === this.state()) &&
    [row.name,row.badge].join(' ').toLocaleLowerCase().includes(this.query().trim().toLocaleLowerCase())
  ));
  private api = '/admin/products';

  constructor() { void this.load(); }

  async load() {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    try {
      const res = await adminFetch(this.api, {cache:'no-store'});
      if (!res.ok) throw Error('No se pudieron cargar los productos.');
      this.rows.set(await res.json());
    } catch (error) {
      this.error.set((error as Error).message);
    } finally { this.loading.set(false); }
  }

  edit(row?: Product, deleting = false) {
    this.error.set('');
    this.draft = row ? {...blank(),...row} : blank();
    this.deleting = deleting;
    this.previewFailed = false;
    this.visible = true;
  }

  async save() {
    if (this.saving()) return;
    this.saving.set(true);
    this.error.set('');
    try {
      const res = await adminFetch(this.api + (this.draft._id ? '/' + this.draft._id : ''), {
        method:this.deleting ? 'DELETE' : this.draft._id ? 'PUT' : 'POST',
        headers:{'Content-Type':'application/json'},
        body:this.deleting ? undefined : JSON.stringify(this.draft)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw Error(data?.error || 'No se pudo guardar el cambio.');
      }
      this.visible = false;
      await this.load();
    } catch (error) {
      this.error.set((error as Error).message);
    } finally { this.saving.set(false); }
  }
}
