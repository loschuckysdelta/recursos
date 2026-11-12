import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-menu-bar',
  imports: [MenubarModule],
  templateUrl: './menu-bar.html',
})
export class MenuBar {
  items: MenuItem[] = [
    {label:'Colección', icon:'pi pi-list', command:()=>this.router.navigateByUrl('/')},
    {label:'Categorías', icon:'pi pi-tags', command:()=>this.router.navigateByUrl('/category')},
    {label:'Usuarios', icon:'pi pi-users', command:()=>this.router.navigateByUrl('/usuarios')},
    {label:'Botones', icon:'pi pi-external-link', command:()=>this.router.navigateByUrl('/botones')},
    {label:'Productos',icon:'pi pi-shopping-bag',command:()=>this.router.navigateByUrl('/productos')},
  ];

  constructor(private router: Router) {}
}
