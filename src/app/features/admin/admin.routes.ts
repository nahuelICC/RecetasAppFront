import {Component, inject} from '@angular/core';
import {ResolveFn, Routes} from '@angular/router';
import { Observable, of, forkJoin } from 'rxjs'; // Importa forkJoin y of
import { map as rxjsMap } from 'rxjs/operators';

import { AdminComponent } from './admin.component';
import { EntityTableComponent, EntityConfiguration } from './components/entity-table/entity-table.component';
import { IngredienteService } from './services/ingrediente.service';
import { IngredienteAdminDTO } from './models/IngredienteAdminDTO';
import {FormOption} from './components/modal-form/modal-form.component';
import {AlergenoNoImgDTO} from './models/AlergenoNoImgDTO';
import {CategoriaNoMedidaDTO} from './models/CategoriaNoMedidaDTO';
import {AlergenoService} from './services/alergeno.service';
import {CategoriaService} from './services/categoria.service';
import {UsuarioService} from './services/usuario.service';
import {RecetaService} from './services/receta.service';


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

export const ingredientesConfigResolver: ResolveFn<EntityConfiguration> = (route, state) => {
  const ingredienteService = inject(IngredienteService);
  const alergenoService = inject(AlergenoService);
  const categoriaService = inject(CategoriaService);

  const alergenosOptions$: Observable<FormOption[]> = alergenoService.getAlergenos()
    .pipe(
      rxjsMap((alergenos: AlergenoNoImgDTO[]) =>
        alergenos.map(a => ({ value: a.id, label: a.nombre }))
      )
    );

  const categoriasOptions$: Observable<FormOption[]> = categoriaService.getCategorias()
    .pipe(
      rxjsMap((categorias: CategoriaNoMedidaDTO[]) =>
        categorias.map(c => ({ value: c.id, label: c.nombre }))
      )
    );
  return forkJoin({
    alergenosOpts: alergenosOptions$,
    categoriasOpts: categoriasOptions$
  }).pipe(
    rxjsMap(({ alergenosOpts, categoriasOpts }) => {
      return {
        entityName: 'Ingrediente',
        entityNamePlural: 'Ingredientes',
        create: true,
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
              options: alergenosOpts,
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
        fetchData: (page: number, itemsPerPage: number, searchTerm: string, showingActivos: boolean) =>
          ingredienteService.getIngredientes(page, itemsPerPage, searchTerm, showingActivos),
        createEntity: (data: any) =>
          ingredienteService.crearIngrediente ? ingredienteService.crearIngrediente(data) : of({ error: 'createIngrediente no implementado'}),
        updateEntity: (id: any, data: any) =>
          ingredienteService.actualizarIngrediente ? ingredienteService.actualizarIngrediente(id, data) : of({ error: 'updateIngrediente no implementado'}),
        deleteEntity: (id: any) => ingredienteService.ocultarIngrediente ? ingredienteService.ocultarIngrediente(id) : of({ error: 'deleteIngrediente no implementado'}),
      };
    })
  );
};

export const usuariosConfigResolver: ResolveFn<EntityConfiguration> = (route, state) => {
  const usuarioService = inject(UsuarioService);
    return {
      entityName: 'Usuario',
      entityNamePlural: 'Usuarios',
      create: true,
      tableColumns: [
        { key: 'id', label: 'ID' },
        { key: 'usuario', label: 'Nombre usuaio' },
        { key: 'email', label: 'Email'},
        { key: 'fechaCreacion', label: 'Fehca creación', isDate:true},
        { key: 'rol', label: 'Rol', isSelect: true },
      ],
      formConfig: {
        fields: [
          { name: 'usuario', label: 'Nombre Usuario', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'text', disabledOnEdit: true },
          {
            name: 'rol',
            label: 'Rol',
            type: 'select',
            options: [
              { value: 'ADMIN', label: 'Admin' },
              { value: 'COOKER', label: 'Cooker' }
            ], // Opciones estáticas
            placeholder: 'Seleccionar Rol',
            required: false
          }
        ]
      },
      tableActions: {
        edit: true,
        delete: true,
        view: true,
      },
      fetchData: (page: number, itemsPerPage: number, searchTerm: string, showingActivos: boolean) =>
        usuarioService.getUsuarios(page, itemsPerPage, searchTerm, showingActivos),
      createEntity: (data: any) =>
        usuarioService.crearUsuario ? usuarioService.crearUsuario(data) : of({ error: 'createIngrediente no implementado'}),
      updateEntity: (id: any, data: any) =>
        usuarioService.actualizarUsuario ? usuarioService.actualizarUsuario(id, data) : of({ error: 'updateUsuario no implementado'}),
      deleteEntity: (id: any) =>
        usuarioService.ocultarUsuario ? usuarioService.ocultarUsuario(id) : of({ error: 'deleteUsuairo no implementado'}),
    };
};

export const recetasConfigResolver: ResolveFn<EntityConfiguration> = (route, state) => {
  const recetaService = inject(RecetaService);
  return {
    entityName: 'Receta',
    entityNamePlural: 'Recetas',
    create: false,
    tableColumns: [
      { key: 'id', label: 'ID' },
      { key: 'nombre', label: 'Nombre receta' },
      { key: 'fecha', label: 'Fecha creción', isDate: true },
      { key: 'esVisible', label: 'Visibilidad', isBoolean: true },
      { key: 'usuario', label: 'Usuario'},
    ],
    formConfig: {
      fields: [
        { name: 'nombre', label: 'Nombre receta', type: 'text', disabledOnEdit: true },
        { name: 'fecha', label: 'Fecha creción', type: 'date', disabledOnEdit: true },
        { name: 'esVisible', label: 'Visibilidad', type: 'checkbox', required: true},
        { name: 'usuario', label: 'Usuario', type: 'text', disabledOnEdit: true },
      ]
    },
    tableActions: {
      edit: true,
      delete: true,
      view: true,
    },
    fetchData: (page: number, itemsPerPage: number, searchTerm: string, showingActivos: boolean) =>
      recetaService.getRecetas(page, itemsPerPage, searchTerm, showingActivos),
    updateEntity: (id: any, data: any) =>
      recetaService.actualizarReceta ? recetaService.actualizarReceta(id, data) : of({ error: 'updateUsuario no implementado'}),
    deleteEntity: (id: any) =>
      recetaService.ocultarReceta ? recetaService.ocultarReceta(id) : of({ error: 'deleteUsuario no implementado'}),
  };
};


export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'ingredientes', pathMatch: 'full' },
      {
        path: 'ingredientes',
        component: EntityTableComponent,
        resolve: {
          entityConfig: ingredientesConfigResolver
        },
        title: 'Admin - Gestión de Ingredientes'
      },
      {
        path: 'usuarios',
        component: EntityTableComponent,
        resolve: { entityConfig: usuariosConfigResolver },
        title: 'Admin - Gestión de Usuarios'
      },
      {
        path: 'recetas',
        component: EntityTableComponent,
        resolve: { entityConfig: recetasConfigResolver },
        title: 'Admin - Gestión de Productos'
      },
      {
        path: 'pedidos',
        component: AdminPlaceholderComponent,
        // resolve: { entityConfig: pedidosConfigResolver },
        title: 'Admin - Gestión de Pedidos'
      },
    ]
  }
];
