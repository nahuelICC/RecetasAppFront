import {Component, OnDestroy, OnInit} from '@angular/core';
import {GenericTableComponent, TableActionsConfig, TableColumn} from '../generic-table/generic-table.component';
import {NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {FormConfig, ModalFormComponent} from '../modal-form/modal-form.component';
import {Observable, Subscription} from 'rxjs';
import {PaginationComponent} from '../pagination/pagination.component';
import {ActivatedRoute, Router} from '@angular/router';

export interface EntityConfiguration {
  entityName: string;
  entityNamePlural: string;
  tableColumns: TableColumn[];
  tableActions?: TableActionsConfig; // Hacerlo opcional si tienes defaults
  formConfig: FormConfig;
  // Función para obtener los datos de la entidad
  // Debería devolver un Observable que emita un objeto con { data: any[], totalItems: number }
  // El 'any' debería ser reemplazado por tu servicio específico
  fetchData: (
    page: number,
    itemsPerPage: number,
    searchTerm: string,
    // otrosFiltros?: any // Si tienes más filtros específicos de entidad
  ) => Observable<{ data: any[], totalItems: number , totalPages: number}>;
  createEntity?: (data: any) => Observable<any>;
  updateEntity?: (id: any, data: any) => Observable<any>;
  deleteEntity?: (id: any) => Observable<any>;
}

@Component({
  selector: 'app-entity-table',
  templateUrl: './entity-table.component.html',
  styleUrls: ['./entity-table.component.css'],
  standalone: true,
  imports: [
    GenericTableComponent,
    NgIf,
    FormsModule,
    PaginationComponent,
    ModalFormComponent
  ]
})
export class EntityTableComponent  implements OnInit, OnDestroy{

  // --- Configuración específica de la entidad (esto se podría pasar por @Input o Route Data) ---
  config!: EntityConfiguration;

  displayedData: any[] = [];

  // --- Estado de Búsqueda y Paginación ---
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalItems: number = 0;
  totalPages: number = 0;

  // --- Estado de UI ---
  isLoading: boolean = false;
  isModalOpen: boolean = false;
  modalData: any | null = null;
  modalTitle: string = '';

  private routeDataSub?: Subscription;
  private dataSub?: Subscription;

  constructor(
    private route: ActivatedRoute, // Inyectar ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.routeDataSub = this.route.data.subscribe(data => {
      if (data && data['entityConfig']) {
        this.config = data['entityConfig'] as EntityConfiguration;
        this.resetAndLoadData(); // Cargar datos cuando la configuración esté lista
      } else {
        console.error("Error: Configuración de entidad no encontrada en los datos de la ruta.");
        // Podrías redirigir o mostrar un mensaje de error
      }
    });
  }

  ngOnDestroy(): void {
    this.routeDataSub?.unsubscribe();
    this.dataSub?.unsubscribe();
  }

  resetAndLoadData(): void {
    this.currentPage = 1;
    this.loadData();
  }

  loadData(): void {
    if (!this.config || !this.config.fetchData) {
      console.warn("FetchData no configurado para la entidad actual.");
      this.displayedData = [];
      this.totalItems = 0;
      this.totalPages = 0;
      return;
    }
    this.isLoading = true;
    this.dataSub = this.config.fetchData(this.currentPage, this.itemsPerPage, this.searchTerm)
      .subscribe({
        next: (response: any) => {
          this.displayedData = response.data;
          this.totalItems = response.totalItems;
          this.totalPages = response.totalPages;
          if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = this.totalPages;
          } else if (this.currentPage < 1 && this.totalPages > 0) {
            this.currentPage = 1;
          } else if (this.totalPages === 0) {
            this.currentPage = 1;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error(`Error al cargar ${this.config.entityNamePlural}:`, err);
          this.isLoading = false;
        }
      });
  }

  onSearch(): void {
    this.resetAndLoadData();
  }

  onPageChanged(page: number): void {
    this.currentPage = page;
    this.loadData();
  }

  openAddModal(): void {
    this.modalData = null;
    this.modalTitle = `Añadir ${this.config.entityName}`;
    this.isModalOpen = true;
  }

  handleEdit(item: any): void {
    this.modalData = { ...item,
      alergenoId: item.alergeno ? item.alergeno.id : null,
      categoriaId: item.categoria ? item.categoria.id : null
    };
    this.modalTitle = `Editar ${this.config.entityName}`;
    this.isModalOpen = true;
  }

  handleDelete(item: any): void {
  //   if (!this.config.deleteEntity) {
  //     console.warn("deleteEntity no configurado.");
  //     return;
  //   }
  //   if (confirm(`¿Estás seguro de que quieres eliminar "${item.nombre || item.id}"?`)) {
  //     this.isLoading = true;
  //     this.config.deleteEntity(item.id).subscribe({
  //       next: () => {
  //         alert(`${this.config.entityName} eliminado.`);
  //         this.resetAndLoadData(); // Recargar datos, idealmente a la página actual o la anterior si esta queda vacía
  //       },
  //       error: (err) => {
  //         console.error("Error al eliminar:", err);
  //         alert(`Error al eliminar ${this.config.entityName}.`);
  //         this.isLoading = false;
  //       }
  //     });
  //   }
  }

  handleView(item: any): void {
    console.log(`Ver ${this.config.entityName}:`, item);
    // Implementa navegación o un modal de vista detallada
    // Ejemplo: this.router.navigate([`/admin/${this.config.entityName.toLowerCase()}/view`, item.id]);
    alert(`Viendo detalles de: ${JSON.stringify(item)}`);
  }

  onModalClose(): void {
    this.isModalOpen = false;
    this.modalData = null;
  }
  //
  onFormSubmit(formData: any): void {
    this.isLoading = true;
    let operation: Observable<any>;

    if (this.modalData && this.modalData.id) { // Editando
      if (!this.config.updateEntity) {
        console.warn("updateEntity no configurado.");
        this.isLoading = false;
        this.isModalOpen = false;
        return;
      }
      operation = this.config.updateEntity(this.modalData.id, formData);
    } else { // Creando
      if (!this.config.createEntity) {
        console.warn("createEntity no configurado.");
        this.isLoading = false;
        this.isModalOpen = false;
        return;
      }
      operation = this.config.createEntity(formData);
    }

    operation.subscribe({
      next: () => {
        alert(`${this.config.entityName} ${this.modalData?.id ? 'actualizado' : 'creado'}.`);
        this.isModalOpen = false;
        this.resetAndLoadData(); // Recarga los datos
      },
      error: (err) => {
        console.error("Error al guardar:", err);
        alert(`Error al guardar ${this.config.entityName}.`);
        this.isLoading = false; // Mantener el modal abierto para corrección o reintento
      }
    });
  }

}
