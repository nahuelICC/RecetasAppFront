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
  create: boolean;
  tableColumns: TableColumn[];
  tableActions?: TableActionsConfig;
  formConfig: FormConfig;

  fetchData: (
    page: number,
    itemsPerPage: number,
    searchTerm: string,
    mostrarActivos: boolean,
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

  config!: EntityConfiguration;

  displayedData: any[] = [];

  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalItems: number = 0;
  totalPages: number = 0;

  showingActivos: boolean = true;

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

  /**
   * Inicializa el componente y suscribe a los datos de la ruta para obtener la configuración de la entidad.
   */
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

  /**
   * Limpia las suscripciones al destruir el componente.
   */
  ngOnDestroy(): void {
    this.routeDataSub?.unsubscribe();
    this.dataSub?.unsubscribe();
  }

  /**
   * Reinicia la paginación y carga los datos de la entidad.
   */
  resetAndLoadData(): void {
    this.currentPage = 1;
    this.loadData();
  }

  toggleActivosEliminados(): void {
    this.showingActivos = !this.showingActivos;
    this.resetAndLoadData(); // Recargar los datos con el nuevo estado
  }

  /**
   * Carga los datos de la entidad.
   */
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

  /**
   * Maneja la búsqueda de entidades.
   */
  onSearch(): void {
    this.resetAndLoadData();
  }

  /**
   * Maneja el cambio de página en la paginación.
   * @param page
   */
  onPageChanged(page: number): void {
    this.currentPage = page;
    this.loadData();
  }

  /**
   * Abre el modal para añadir una nueva entidad.
   */
  openAddModal(): void {
    this.modalData = null;
    this.modalTitle = `Añadir ${this.config.entityName}`;
    this.isModalOpen = true;
  }

  /**
   * Maneja la edición de una entidad existente.
   * @param item
   */
  handleEdit(item: any): void {
    this.modalData = { ...item,
      alergenoId: item.alergeno ? item.alergeno.id : null,
      categoriaId: item.categoria ? item.categoria.id : null,
      rol: item.rol ? item.rol : null,
    };
    this.modalTitle = `Editar ${this.config.entityName}`;
    this.isModalOpen = true;
  }

  /**
   * Maneja la eliminación de una entidad.
   * @param item
   */
  handleDelete(item: any): void {
    if (!this.config.deleteEntity) {
      console.warn("deleteEntity no configurado.");
      return;
    }
    this.mensajeAlert = `¿Estás seguro de que quieres eliminar "${item.nombre || item.id}"?`;
    this.showAlertConfirmar = true
    this.item = item;
  }
  /**
   * Maneja la restauración de una entidad eliminada.
   * @param item
   */
  handleRestore(item: any): void {
    if (!this.config.deleteEntity) {
      console.warn("deleteEntity no configurado.");
      return;
    }
    this.mensajeAlert = `¿Estás seguro de que quieres restaurar "${item.nombre || item.usuario || item.id}"?`;
    this.showAlertConfirmar = true
    this.item = item;
  }

  /**
   * Confirma la eliminación de una entidad.
   */
  onConfirm() {
    this.isLoading = true;
    // @ts-ignore
    this.config.deleteEntity(this.item.id).subscribe({
      next: () => {
        this.alertVisible = true;
        this.tipoAlert = "success";
        this.mensajeAlert = `${this.config.entityName} eliminado.`;
        this.resetAndLoadData();
      },
      error: (err) => {
        this.alertVisible = true;
        this.tipoAlert = "error";
        this.mensajeAlert = `Error al eliminar ${this.config.entityName}.`;
        console.error("Error al eliminar:", err);
        this.isLoading = false;
      }
    });
    this.showAlertConfirmar = false
  }
  /**
   * Cancela la acción de eliminación o restauración.
   */
  onCalcel() {
    this.showAlertConfirmar = false
    this.item = null;
  }

  /**
   * Redirige a una ruta específica con el ID encriptado.
   * @param id
   * @param ruta
   */
  redireccionar(id: string, ruta: string): void {
    this.zone.run(() => {
      const idEncrypt = this.encryptService.encriptar(id);
      this.router.navigate([`/${ruta}`, idEncrypt]).then(() => {
        window.location.reload();
      });
    });
  }

  /**
   * Maneja la visualización de una entidad.
   * @param item
   */
  handleView(item: any): void {
    if (this.config.entityName == 'Usuario'){
      this.redireccionar(item.id, 'perfil');
    }
    if (this.config.entityName == 'Receta'){
      this.redireccionar(item.id, 'receta');
    }
  }

  /**
   * Cierra el modal y resetea los datos.
   */
  onModalClose(): void {
    this.isModalOpen = false;
    this.modalData = null;
  }
  //
  /**
   * Maneja el envío del formulario del modal.
   * @param formData
   */
  onFormSubmit(formData: any): void {
    this.isLoading = true;
    let operation: Observable<any>;

    if (this.modalData && this.modalData.id) {
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
        this.isModalOpen = false;
        this.resetAndLoadData();
      },
      error: (err) => {
        this.alertVisible = true;
        this.tipoAlert = "error";
        this.mensajeAlert = `Error al guardar ${this.config.entityName}.`;
        console.error("Error al guardar:", err);
        this.isLoading = false;
      }
    });
  }
}
