import { ResolveFn, Routes } from '@angular/router';
import { Component, inject } from '@angular/core'; // Asegúrate que inject viene de @angular/core
import { map, of } from 'rxjs'; // Importa 'of' para placeholders de CRUD y 'map' para transformar

import { AdminComponent } from './admin.component'; // Tu AdminLayoutComponent
import { EntityTableComponent, EntityConfiguration } from './components/entity-table/entity-table.component'; // Tu EntityManagementComponent
import { IngredienteService } from './services/ingrediente.service';
import { IngredienteAdminDTO } from './models/IngredienteAdminDTO'; // Asumo que tienes este DTO o similar


@Component({
  standalone: true,
  selector: 'app-admin-placeholder',
  template: `<div class="bg-white p-6 rounded-lg shadow-md"><h2 class="text-2xl font-semibold">{{ currentRoute }}</h2><p>Contenido de la sección...</p></div>`,
})
export class AdminPlaceholderComponent {
  currentRoute = window.location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Sección';
  constructor() {
    this.currentRoute = this.currentRoute.charAt(0).toUpperCase() + this.currentRoute.slice(1);
  }
}

// --- Resolver para la Configuración de Ingredientes ---
export const ingredientesConfigResolver: ResolveFn<EntityConfiguration> = (route, state) => {
  const ingredienteService = inject(IngredienteService);

  return {
    entityName: 'Ingrediente',
    entityNamePlural: 'Ingredientes',
    tableColumns: [
      { key: 'id', label: 'ID' },
      { key: 'nombre', label: 'Nombre Ingrediente' },
      { key: 'alergeno.nombre', label: 'Alérgeno' , isSelect: true},
      { key: 'categoria.nombre', label: 'Categoría', isSelect: true},
      { key: 'proteinas', label: 'Proteínas (g)'},
      { key: 'hidratos', label: 'Hidratos (g)' },
      { key: 'grasas', label: 'Grasas (g)' }
    ],
    formConfig: {
      fields: [
        { name: 'nombre', label: 'Nombre Ingrediente', type: 'text', required: true },
        { name: 'alergeno.nombre', label: 'Alérgeno', type: 'select', required: true},
        { name: 'categoria.nombre', label: 'Categoría', type: 'select', required: true},
        { name: 'proteinas', label: 'Proteínas', type: 'number', required: true},
        { name: 'hidratos', label: 'Hidratos', type: 'number', required: true},
        { name: 'grasas', label: 'Grasas', type: 'number', required: true}
      ]
    },
    // fetchData DEBE devolver Observable<{ data: any[], totalItems: number }>
    fetchData: (page: number, itemsPerPage: number, searchTerm: string) =>
      ingredienteService.getIngredientes(page, itemsPerPage, searchTerm),
    createEntity: (data: any) => ingredienteService.createIngrediente ? ingredienteService.createIngrediente(data) : of({ error: 'createIngrediente no implementado'}),
    updateEntity: (id: any, data: any) => ingredienteService.updateIngrediente ? ingredienteService.updateIngrediente(id, data) : of({ error: 'updateIngrediente no implementado'}),
    deleteEntity: (id: any) => ingredienteService.deleteIngrediente ? ingredienteService.deleteIngrediente(id) : of({ error: 'deleteIngrediente no implementado'}),
  };
};


// --- RUTAS PRINCIPALES DEL MÓDULO ADMIN ---
export const ADMIN_ROUTES: Routes = [
  {
    path: '', // Ruta base para /admin (ej. /admin)
    component: AdminComponent, // Tu componente Layout con Sidebar y <router-outlet>
    children: [
      // Redirección por defecto al entrar a /admin
      { path: '', redirectTo: 'ingredientes', pathMatch: 'full' },
      {
        path: 'ingredientes', // <<<< AÑADIDA LA RUTA PARA INGREDIENTES
        component: EntityTableComponent, // Tu componente de gestión
        resolve: { // <<<< CORREGIDO: Usar la propiedad 'resolve'
          entityConfig: ingredientesConfigResolver // Usa el resolver para ingredientes
        },
        title: 'Admin - Gestión de Ingredientes'
      },
      {
        path: 'productos',
        component: AdminPlaceholderComponent, // Reemplaza con EntityTableComponent y su resolver
        // resolve: { entityConfig: productosConfigResolver }, // Cuando lo tengas
        title: 'Admin - Gestión de Productos'
      },
      {
        path: 'pedidos',
        component: AdminPlaceholderComponent, // Reemplaza con EntityTableComponent y su resolver
        // resolve: { entityConfig: pedidosConfigResolver },
        title: 'Admin - Gestión de Pedidos'
      },
      {
        path: 'usuarios',
        component: AdminPlaceholderComponent, // Reemplaza con EntityTableComponent y su resolver
        // resolve: { entityConfig: usuariosConfigResolver },
        title: 'Admin - Gestión de Usuarios'
      }
    ]
  }
];
