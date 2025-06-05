import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {GenericTableComponent, TableActionsConfig, TableColumn} from '../generic-table/generic-table.component';
import {NgClass, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {FormConfig, ModalFormComponent} from '../modal-form/modal-form.component';
import {Observable, Subscription} from 'rxjs';
import {PaginationComponent} from '../pagination/pagination.component';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertInfoComponent, AlertType} from '../../../../shared/components/alert-info/alert-info.component';
import {AlertConfirmarComponent} from '../../../../shared/components/alert-confirmar/alert-confirmar.component';
import {EncryptService} from '../../../../core/services/encrypt.service';

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
    mostrarActivos: boolean,
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
    ModalFormComponent,
    AlertInfoComponent,
    AlertConfirmarComponent,
    NgClass
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

  showingActivos: boolean = true;

  // --- Estado de UI ---
  isLoading: boolean = false;
  isModalOpen: boolean = false;
  modalData: any | null = null;
  modalTitle: string = '';

  // alert
  alertVisible: boolean = false;
  mensajeAlert: string ="";
  tipoAlert: AlertType = "warning";

  // alert confirmar
  showAlertConfirmar: boolean = false;
  private confirmar: boolean = false;

  private routeDataSub?: Subscription;
  private dataSub?: Subscription;
  private item = null;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private zone: NgZone,
    private encryptService: EncryptService,
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

  toggleActivosEliminados(): void {
    this.showingActivos = !this.showingActivos;
    this.resetAndLoadData(); // Recargar los datos con el nuevo estado
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
    this.dataSub = this.config.fetchData(this.currentPage, this.itemsPerPage, this.searchTerm, this.showingActivos)
      .subscribe({
        next: (response: any) => {
          this.displayedData = response.data;
          this.totalItems = response.totalItems;
          this.totalPages = response.totalPages - 1;
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
      categoriaId: item.categoria ? item.categoria.id : null,
      rol: item.rol ? item.rol : null,
    };
    this.modalTitle = `Editar ${this.config.entityName}`;
    this.isModalOpen = true;
  }

  handleDelete(item: any): void {
    if (!this.config.deleteEntity) {
      console.warn("deleteEntity no configurado.");
      return;
    }
    this.mensajeAlert = `¿Estás seguro de que quieres eliminar "${item.nombre || item.id}"?`;
    this.showAlertConfirmar = true
    this.item = item;
  }
  handleRestore(item: any): void {
    if (!this.config.deleteEntity) {
      console.warn("deleteEntity no configurado.");
      return;
    }
    this.mensajeAlert = `¿Estás seguro de que quieres restaurar "${item.nombre || item.usuario || item.id}"?`;
    this.showAlertConfirmar = true
    this.item = item;
  }
  onConfirm() {
    this.isLoading = true;
    // @ts-ignore
    this.config.deleteEntity(this.item.id).subscribe({
      next: () => {
        this.alertVisible = true;
        this.tipoAlert = "success";
        this.mensajeAlert = `${this.config.entityName} eliminado.`;
        // alert(`${this.config.entityName} eliminado.`);
        this.resetAndLoadData(); // Recargar datos, idealmente a la página actual o la anterior si esta queda vacía
      },
      error: (err) => {
        this.alertVisible = true;
        this.tipoAlert = "error";
        this.mensajeAlert = `Error al eliminar ${this.config.entityName}.`;
        console.error("Error al eliminar:", err);
        // alert(`Error al eliminar ${this.config.entityName}.`);
        this.isLoading = false;
      }
    });
    this.showAlertConfirmar = false
  }
  onCalcel() {
    this.showAlertConfirmar = false
    this.item = null;
  }
  redireccionar(id: string, ruta: string): void {
    this.zone.run(() => {
      const idEncrypt = this.encryptService.encriptar(id);
      this.router.navigate([`/${ruta}`, idEncrypt]).then(() => {
        window.location.reload();
      });
    });
  }
  handleView(item: any): void {
    if (this.config.entityName == 'Usuario'){
      this.redireccionar(item.id, 'perfil');
    }
    if (this.config.entityName == 'Receta'){
      this.redireccionar(item.id, 'receta');
    }
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
        this.alertVisible = true;
        this.tipoAlert = "success";
        this.mensajeAlert = `${this.config.entityName} ${this.modalData?.id ? 'actualizado' : 'creado'}.`;
        // alert(`${this.config.entityName} ${this.modalData?.id ? 'actualizado' : 'creado'}.`);
        this.isModalOpen = false;
        this.resetAndLoadData(); // Recarga los datos
      },
      error: (err) => {
        this.alertVisible = true;
        this.tipoAlert = "error";
        this.mensajeAlert = `Error al guardar ${this.config.entityName}.`;
        console.error("Error al guardar:", err);
        // alert(`Error al guardar ${this.config.entityName}.`);
        this.isLoading = false; // Mantener el modal abierto para corrección o reintento
      }
    });
  }



}
