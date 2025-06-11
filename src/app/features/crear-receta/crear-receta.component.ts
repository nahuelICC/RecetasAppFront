import { Component, OnInit } from '@angular/core';
import { CrearRecetaService } from './crear-receta.service';
import { Receta, RecetaIngredienteDTO, Ingrediente, RecetaPasoDTO } from './models/receta';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertInfoComponent} from '../../shared/components/alert-info/alert-info.component';
import { AlertConfirmarComponent} from '../../shared/components/alert-confirmar/alert-confirmar.component';
import {PantallaCargaComponent} from '../../shared/components/pantalla-carga/pantalla-carga.component';

/**
 * Componente para crear una nueva receta.
 */
@Component({
  selector: 'app-crear-receta',
  templateUrl: './crear-receta.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule, AlertInfoComponent, AlertConfirmarComponent, PantallaCargaComponent]
})
export class CrearRecetaComponent implements OnInit {
  receta: Receta = {
    nombre: '',
    duracion: '00:00:00',
    descripcion: '',
    esVisible: true,
    ingredientes: [],
    pasos: []
  };

  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;

  imagen: File | null = null;
  video: File | null = null;
  imagenPreview: string | ArrayBuffer | null = null;

  allIngredientes: Ingrediente[] = [];
  filteredIngredientes: Ingrediente[] = [];
  ingredienteSearch: string = '';
  selectedIngrediente: Ingrediente | null = null;
  cantidad: number = 0;

  nuevoPaso: RecetaPasoDTO = {
    titulo: '',
    descripcion: '',
    numero: 1
  };
  pasoFotoFile: File | null = null;
  pasoFotoPreview: string | ArrayBuffer | null = null;
  mostrarPasos: boolean = false;

  alertMessage: string = '';
  alertType: 'success' | 'error' | 'warning' = 'success';
  showAlert: boolean = false;

  showConfirm: boolean = false;

  loading: boolean = false;
  showAlertConfirmar: boolean = false;

  constructor(private crearRecetaService: CrearRecetaService, private router: Router) {}

  ngOnInit(): void {
    this.loadIngredientes();
  }

  /**
   * Carga los ingredientes disponibles desde el servicio.
   */
  loadIngredientes(): void {
    this.crearRecetaService.getIngredientes().subscribe({
      next: (ingredientes) => {
        this.allIngredientes = ingredientes;
        this.filteredIngredientes = [...ingredientes];
      },
      error: (error) => {
        this.alertMessage = 'Error al cargar ingredientes';
        this.alertType = 'error';
        this.showAlert = true;
      }
    });
  }

  /**
   * Filtra los ingredientes según la búsqueda del usuario.
   */
  filterIngredientes(): void {
    if (!this.ingredienteSearch) {
      this.filteredIngredientes = [];
      return;
    }
    this.filteredIngredientes = this.allIngredientes
      .filter(ing =>
        ing.nombre.toLowerCase().includes(this.ingredienteSearch.toLowerCase()) &&
        !this.receta.ingredientes.some(recIng => recIng.idIngrediente === ing.id)
      );
  }

  /**
   * Selecciona un ingrediente de la lista filtrada.
   * @param ingrediente
   */
  selectIngrediente(ingrediente: Ingrediente): void {
    this.selectedIngrediente = ingrediente;
    this.ingredienteSearch = ingrediente.nombre;
    this.filteredIngredientes = [];
  }

  /**
   * Agrega un ingrediente a la receta.
   */
  addIngrediente(): void {
    if (!this.selectedIngrediente || this.cantidad <= 0 ||
      this.receta.ingredientes.some(ing => ing.idIngrediente === this.selectedIngrediente!.id)) {
      return;
    }

    const newIngrediente: RecetaIngredienteDTO = {
      idIngrediente: this.selectedIngrediente.id,
      cantidad: this.cantidad
    };

    this.receta.ingredientes.push(newIngrediente);

    this.selectedIngrediente = null;
    this.ingredienteSearch = '';
    this.cantidad = 0;
    this.filteredIngredientes = [];
  }

  /**
   * Elimina un ingrediente de la receta.
   * @param index
   */
  removeIngrediente(index: number): void {
    this.receta.ingredientes.splice(index, 1);
  }

  /**
   * Obtiene el nombre de un ingrediente por su ID.
   * @param id
   */
  getIngredienteName(id: number): string {
    const ingrediente = this.allIngredientes.find(ing => ing.id === id);
    return ingrediente ? ingrediente.nombre : 'Ingrediente desconocido';
  }

  /**
   * Obtiene la medida de un ingrediente por su ID.
   * @param id
   */
  getIngredienteMeasure(id: number): string {
    const ingrediente = this.allIngredientes.find(ing => ing.id === id);
    if (!ingrediente) return '';

    const medida = ingrediente.categoria.medida;
    if (medida === 'unidad' && this.receta.ingredientes) {
      const ingredienteEnReceta = this.receta.ingredientes.find(ing => ing.idIngrediente === id);
      if (ingredienteEnReceta && ingredienteEnReceta.cantidad > 1) {
        return 'unidades';
      }
    }
    return medida;
  }

  /**
   * Obtiene el minimo para la medida de un ingrediente.
   * @param measure
   */
  getStepForMeasure(measure: string): number {
    return (measure === 'g' || measure === 'ml') ? 10 : 1;
  }

  /**
   * Obtiene el máximo permitido para una medida específica.
   * @param measure
   */
  getMaxForMeasure(measure: string): number {
    return (measure === 'g' || measure === 'ml') ? 10000 : 100;
  }

  /**
   * Actualiza la duración de la receta en formato HH:MM:SS.
   */
  updateDuration(): void {
    this.hours = Math.max(0, Math.min(23, this.hours || 0));
    this.minutes = Math.max(0, Math.min(59, this.minutes || 0));
    this.seconds = Math.max(0, Math.min(59, this.seconds || 0));

    const formattedHours = this.hours.toString().padStart(2, '0');
    const formattedMinutes = this.minutes.toString().padStart(2, '0');
    const formattedSeconds = this.seconds.toString().padStart(2, '0');

    this.receta.duracion = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  /**
   * Maneja la selección de archivos para imagen o video.
   * @param event
   * @param type
   */
  onFileSelected(event: any, type: 'imagen' | 'video'): void {
    const file = event.target.files[0];
    if (!file) return;

    if (type === 'imagen') {
      this.imagen = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result;
      };
      reader.readAsDataURL(file);
    } else if (type === 'video') {
      this.video = file;
    }
  }

  /**
   * Elimina la imagen o video seleccionado.
   */
  removeFoto(): void {
    this.imagen = null;
    this.imagenPreview = null;
  }

  /**
   * Agrega un nuevo paso a la receta.
   */
  addPaso(): void {
    if (!this.nuevoPaso.titulo || !this.nuevoPaso.descripcion) {
      this.alertMessage = 'El título y descripción del paso son obligatorios';
      this.alertType = 'warning';
      this.showAlert = true;
      return;
    }

    const paso: RecetaPasoDTO = {
      titulo: this.nuevoPaso.titulo,
      descripcion: this.nuevoPaso.descripcion,
      numero: this.receta.pasos.length + 1,
      foto: this.pasoFotoFile || undefined
    };

    if (this.pasoFotoPreview) {
      paso.fotoPreview = this.pasoFotoPreview.toString();
    }

    this.receta.pasos.push(paso);
    this.resetPasoForm();
  }

  /**
   * Elimina un paso de la receta.
   * @param index
   */
  removePaso(index: number): void {
    this.receta.pasos.splice(index, 1);
    this.receta.pasos.forEach((paso, i) => {
      paso.numero = i + 1;
    });
  }

  /**
   * Maneja la selección de archivos para la foto del paso.
   * @param event
   */
  onPasoFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.pasoFotoFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.pasoFotoPreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Elimina la foto del paso seleccionado.
   */
  removePasoFoto(): void {
    this.pasoFotoFile = null;
    this.pasoFotoPreview = null;
  }

  /**
   * Resetea el formulario del paso para agregar un nuevo paso.
   */
  resetPasoForm(): void {
    this.nuevoPaso = {
      titulo: '',
      descripcion: '',
      numero: this.receta.pasos.length + 1
    };
    this.pasoFotoFile = null;
    this.pasoFotoPreview = null;
  }

  /**
   * Verifica si el formulario de creación de receta es válido.
   */
  isFormValid(): boolean {
    return (
      this.receta.nombre.trim() !== '' &&
      this.receta.descripcion.trim() !== '' &&
      this.imagen !== null &&
      this.receta.ingredientes.length > 0
    );
  }

  /**
   * Registra la receta, mostrando un mensaje de alerta si el formulario no es válido.
   */
  registrarReceta(): void {
    if (!this.isFormValid()) {
      this.alertMessage = 'Por favor, completa todos los campos obligatorios';
      this.alertType = 'warning';
      this.showAlert = true;
      return;
    }

    this.showConfirm = true;
  }

  /**
   * Confirma el registro de la receta.
   */
  onConfirm(): void {
    this.loading = true;
    this.showConfirm = false;
    this.crearRecetaService.registrarReceta(this.receta, this.imagen, this.video)
      .subscribe({
        next: () => {
          this.alertMessage = 'Receta registrada con éxito';
          this.loading = false;
          this.showAlertConfirmar = true;
        },
        error: () => {
          this.alertMessage = 'Error al registrar la receta';
          this.alertType = 'error';
          this.showAlert = true;
          this.loading = false;
        },
      });
  }

  /**
   * Cancela la confirmación de registro de la receta.
   */
  onCancel(): void {
    this.showConfirm = false;
  }

  /**
   * Muestra u oculta los pasos de la receta.
   */
  togglePasos(): void {
    this.mostrarPasos = !this.mostrarPasos;
  }

  onConfirmAccept() {
    this.showAlertConfirmar = false;
    this.router.navigate(['/main']);
  }
}
