import { Component, OnInit } from '@angular/core';
import { CrearRecetaService } from './crear-receta.service';
import { Receta, RecetaIngredienteDTO, Ingrediente, RecetaPasoDTO } from './models/receta';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertInfoComponent} from '../../shared/components/alert-info/alert-info.component';
import { AlertConfirmarComponent} from '../../shared/components/alert-confirmar/alert-confirmar.component';

@Component({
  selector: 'app-crear-receta',
  templateUrl: './crear-receta.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule, AlertInfoComponent, AlertConfirmarComponent]
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

  constructor(private crearRecetaService: CrearRecetaService, private router: Router) {}

  ngOnInit(): void {
    this.loadIngredientes();
  }

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

  selectIngrediente(ingrediente: Ingrediente): void {
    this.selectedIngrediente = ingrediente;
    this.ingredienteSearch = ingrediente.nombre;
    this.filteredIngredientes = [];
  }

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

  removeIngrediente(index: number): void {
    this.receta.ingredientes.splice(index, 1);
  }

  getIngredienteName(id: number): string {
    const ingrediente = this.allIngredientes.find(ing => ing.id === id);
    return ingrediente ? ingrediente.nombre : 'Ingrediente desconocido';
  }

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

  getStepForMeasure(measure: string): number {
    return (measure === 'g' || measure === 'ml') ? 10 : 1;
  }

  getMaxForMeasure(measure: string): number {
    return (measure === 'g' || measure === 'ml') ? 10000 : 100;
  }

  updateDuration(): void {
    this.hours = Math.max(0, Math.min(23, this.hours || 0));
    this.minutes = Math.max(0, Math.min(59, this.minutes || 0));
    this.seconds = Math.max(0, Math.min(59, this.seconds || 0));

    const formattedHours = this.hours.toString().padStart(2, '0');
    const formattedMinutes = this.minutes.toString().padStart(2, '0');
    const formattedSeconds = this.seconds.toString().padStart(2, '0');

    this.receta.duracion = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

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

  removeFoto(): void {
    this.imagen = null;
    this.imagenPreview = null;
  }

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

  removePaso(index: number): void {
    this.receta.pasos.splice(index, 1);
    this.receta.pasos.forEach((paso, i) => {
      paso.numero = i + 1;
    });
  }

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

  removePasoFoto(): void {
    this.pasoFotoFile = null;
    this.pasoFotoPreview = null;
  }

  resetPasoForm(): void {
    this.nuevoPaso = {
      titulo: '',
      descripcion: '',
      numero: this.receta.pasos.length + 1
    };
    this.pasoFotoFile = null;
    this.pasoFotoPreview = null;
  }

  isFormValid(): boolean {
    return (
      this.receta.nombre.trim() !== '' &&
      this.receta.descripcion.trim() !== '' &&
      this.imagen !== null &&
      this.receta.ingredientes.length > 0
    );
  }

  registrarReceta(): void {
    if (!this.isFormValid()) {
      this.alertMessage = 'Por favor, completa todos los campos obligatorios';
      this.alertType = 'warning';
      this.showAlert = true;
      return;
    }

    this.showConfirm = true;
  }

  onConfirm(): void {
    this.showConfirm = false;
    this.crearRecetaService.registrarReceta(this.receta, this.imagen, this.video)
      .subscribe({
        next: () => {
          this.alertMessage = 'Receta registrada con éxito';
          this.alertType = 'success';
          this.showAlert = true;
          this.router.navigate(['/main']);
        },
        error: () => {
          this.alertMessage = 'Error al registrar la receta';
          this.alertType = 'error';
          this.showAlert = true;
        },
      });
  }

  onCancel(): void {
    this.showConfirm = false;
  }

  togglePasos(): void {
    this.mostrarPasos = !this.mostrarPasos;
  }
}
