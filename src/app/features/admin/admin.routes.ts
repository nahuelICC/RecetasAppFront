import {Component, inject} from '@angular/core';
import {ResolveFn, Routes} from '@angular/router';
import { Observable, of, forkJoin } from 'rxjs'; // Importa forkJoin y of
import { map as rxjsMap } from 'rxjs/operators';// Importa 'of' para placeholders de CRUD y 'map' para transformar

import { AdminComponent } from './admin.component'; // Tu AdminLayoutComponent
import { EntityTableComponent, EntityConfiguration } from './components/entity-table/entity-table.component'; // Tu EntityManagementComponent
import { IngredienteService } from './services/ingrediente.service';
import { IngredienteAdminDTO } from './models/IngredienteAdminDTO';
import {FormOption} from './components/modal-form/modal-form.component';
import {AlergenoNoImgDTO} from './models/AlergenoNoImgDTO';
import {CategoriaNoMedidaDTO} from './models/CategoriaNoMedidaDTO';
import {AlergenoService} from './services/alergeno.service';
import {CategoriaService} from './services/categoria.service'; // Asumo que tienes este DTO o similar


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
  const alergenoService = inject(AlergenoService);     // Inyecta AlergenoService
  const categoriaService = inject(CategoriaService); // Inyecta CategoriaService

  // 1. Obtener las opciones para los selects
  const alergenosOptions$: Observable<FormOption[]> = alergenoService.getAlergenos() // Asume que este método existe
    .pipe(
      rxjsMap((alergenos: AlergenoNoImgDTO[]) =>
        alergenos.map(a => ({ value: a.id, label: a.nombre }))
      )
    );

  const categoriasOptions$: Observable<FormOption[]> = categoriaService.getCategorias() // Asume que este método existe
    .pipe(
      rxjsMap((categorias: CategoriaNoMedidaDTO[]) =>
        categorias.map(c => ({ value: c.id, label: c.nombre }))
      )
    );

  // 2. Usar forkJoin para esperar a que todas las opciones estén cargadas antes de construir la config
  return forkJoin({
    alergenosOpts: alergenosOptions$,
    categoriasOpts: categoriasOptions$
    // Añade más observables aquí si necesitas cargar más datos para el formulario
  }).pipe(
    rxjsMap(({ alergenosOpts, categoriasOpts }) => {
      // 3. Construye y devuelve el objeto EntityConfiguration CON las opciones
      return {
        entityName: 'Ingrediente',
        entityNamePlural: 'Ingredientes',
        tableColumns: [
          { key: 'id', label: 'ID' },
          { key: 'nombre', label: 'Nombre Ingrediente' },
          { key: 'alergeno.nombre', label: 'Alérgeno', isSelect: true },
          { key: 'categoria.nombre', label: 'Categoría', isSelect: true },
          { key: 'proteinas', label: 'Proteínas (g)' },
          { key: 'hidratos', label: 'Hidratos (g)' },
          { key: 'grasas', label: 'Grasas (g)' }
        ],
        formConfig: {
          fields: [
            { name: 'nombre', label: 'Nombre Ingrediente', type: 'text', required: true },
            {
              name: 'alergenoId',
              label: 'Alérgeno',
              type: 'select',
              options: alergenosOpts, // Opciones cargadas
              placeholder: 'Seleccionar Alérgeno',
              required: false
            },
            {
              name: 'categoriaId',
              label: 'Categoría',
              type: 'select',
              options: categoriasOpts,
              placeholder: 'Seleccionar Categoría',
              required: false
            },
            { name: 'proteinas', label: 'Proteínas (por 100g)', type: 'number', required: true, min: 0, step: 0.1 },
            { name: 'hidratos', label: 'Hidratos (por 100g)', type: 'number', required: true, min: 0, step: 0.1 },
            { name: 'grasas', label: 'Grasas (por 100g)', type: 'number', required: true, min: 0, step: 0.1 }
          ]
        },
        tableActions: {
          edit: true,
          delete: true,
          view: false,
        },
        fetchData: (page: number, itemsPerPage: number, searchTerm: string) =>
          ingredienteService.getIngredientes(page, itemsPerPage, searchTerm),
        createEntity: (data: any) =>
          ingredienteService.crearIngrediente ? ingredienteService.crearIngrediente(data) : of({ error: 'createIngrediente no implementado'}),
        updateEntity: (id: any, data: any) =>
          ingredienteService.actualizarIngrediente ? ingredienteService.actualizarIngrediente(id, data) : of({ error: 'updateIngrediente no implementado'}),
        deleteEntity: (id: any) => ingredienteService.ocultarIngrediente ? ingredienteService.ocultarIngrediente(id) : of({ error: 'deleteIngrediente no implementado'}),
      };
    })
  );
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
