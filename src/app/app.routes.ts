// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {path:'productos',loadComponent:()=>import('./pages/products/products').then(m=>m.Products)},
  { path:'botones', loadComponent:() => import('./pages/buttons/buttons').then(m=>m.Buttons) },
  { path: 'usuarios', loadComponent: () => import('./pages/users/users').then(m => m.Users) },
  { path: 'category', loadComponent: () => import('./pages/category/category').then(m => m.Category) },
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/collection/collection').then((m) => m.Collection),
  },
  { path: '**', redirectTo: '' },
];
