import { Routes } from '@angular/router';
import { AdminComponent} from './admin.component';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-admin-placeholder',
  template: `<div class="bg-white p-6 rounded-lg shadow-md"><h2 class="text-2xl font-semibold">{{ currentRoute }}</h2><p>Contenido de la sección...</p></div>`,
})
export class AdminPlaceholderComponent {
  currentRoute = window.location.pathname; // Simple para demo
}

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'recetas', pathMatch: 'full' },
      { path: 'recetas', component: AdminPlaceholderComponent, title: 'Admin - Gestión de Recetas'},
      { path: 'productos', component: AdminPlaceholderComponent, title: 'Admin - Gestión de Productos'},
      { path: 'pedidos', component: AdminPlaceholderComponent, title: 'Admin - Gestión de Pedidos'},
      { path: 'usuarios', component: AdminPlaceholderComponent, title: 'Admin - Gestión de Usuarios'}
    ]
  }
];
