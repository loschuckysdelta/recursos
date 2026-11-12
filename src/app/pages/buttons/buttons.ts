import { adminFetch } from '../../services/admin-fetch';
import { Component, signal, computed } from '@angular/core';
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

interface Entry { key?:string; _id?:string; name:string; image:string; url:string; views:string[]; position:number; active:boolean }
const blank = ():Entry => ({key:'',name:'',image:'',url:'',views:['catalog'],position:1,active:true});
@Component({
  imports:[FormsModule,ButtonModule,DialogModule,TableModule,InputTextModule,SelectModule,InputNumberModule,CheckboxModule,TagModule,ProgressSpinnerModule],
  templateUrl:'./buttons.html',
  styleUrl:'./buttons.scss'
})
export class Buttons {
  rows=signal<Entry[]>([]); busy=signal(false); error=signal(''); visible=false; draft=blank(); selection='catalog';
  query=signal('');
  state=signal<boolean|null>(null);
  filtered=computed(()=>this.rows().filter(row=>
    (this.state()===null || row.active===this.state()) &&
    (row.name+' '+(row.key || '')).toLocaleLowerCase().includes(this.query().trim().toLocaleLowerCase())
  ));
  states=[{label:'Todos los estados',value:null},{label:'Activos',value:true},{label:'Inactivos',value:false}];
  views=[{label:'Catálogo',value:'catalog'},{label:'Detalle',value:'detail'},{label:'Ambas vistas',value:'both'}];
  deleting=false;
  private api='/admin/floating-buttons';
  constructor(){void this.load();}
  async load(){ this.busy.set(true); this.error.set('');
    try { const res=await adminFetch(this.api); if(!res.ok) throw Error('No se pudo cargar la lista.'); this.rows.set(await res.json()); }
    catch(e){this.error.set((e as Error).message);} finally{this.busy.set(false);}
  }
  edit(row?:Entry){this.error.set('');this.deleting=false;this.draft=row?{...row}:blank();this.selection=this.draft.views.length===2?'both':this.draft.views[0];this.visible=true;}
  async write(remove=false){
    if(this.busy()) return;
    this.busy.set(true);this.error.set('');
    try {
      const row=this.draft;row.views=this.selection==='both'?['catalog','detail']:[this.selection];
      const res=await adminFetch(this.api+(row._id?'/'+row._id:''),{method:remove?'DELETE':row._id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:remove?undefined:JSON.stringify(row)});
      if(!res.ok) throw Error((await res.json().catch(()=>null))?.error || 'No se pudo guardar el cambio.');
      this.visible=false;this.deleting=false;await this.load();
    } catch(e){this.error.set((e as Error).message);} finally{this.busy.set(false);}
  }
}
