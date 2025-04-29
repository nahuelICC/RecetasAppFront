import { Component, OnInit } from '@angular/core';
import { CrearRecetaService } from './crear-receta.service';
import { Receta, RecetaIngredienteDTO, Ingrediente } from './models/receta';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crear-receta',
  templateUrl: './crear-receta.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class CrearRecetaComponent implements OnInit {
  receta: Receta = {
    nombre: '',
    duracion: '00:00:00',
    descripcion: '',
    esVisible: true,  // Cambiado a true por defecto
    ingredientes: []
  };

  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;

  imagen: File | null = null;
  video: File | null = null;

  // Para la gestión de ingredientes
  allIngredientes: Ingrediente[] = [];
  filteredIngredientes: Ingrediente[] = [];
  ingredienteSearch: string = '';
  selectedIngrediente: Ingrediente | null = null;
  cantidad: number = 0;
  imagenPreview: string | ArrayBuffer | null = null;

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
        console.error('Error al cargar ingredientes:', error);
      }
    });
  }

  filterIngredientes(): void {
    if (!this.ingredienteSearch) {
      this.filteredIngredientes = [...this.allIngredientes];
      return;
    }
    this.filteredIngredientes = this.allIngredientes.filter(ing =>
      ing.nombre.toLowerCase().includes(this.ingredienteSearch.toLowerCase())
    );
  }

  selectIngrediente(ingrediente: Ingrediente): void {
    this.selectedIngrediente = ingrediente;
    this.ingredienteSearch = ingrediente.nombre;
    this.filteredIngredientes = [];
  }

  addIngrediente(): void {
    if (!this.selectedIngrediente || this.cantidad <= 0) return;

    const newIngrediente: RecetaIngredienteDTO = {
      idIngrediente: this.selectedIngrediente.id,
      cantidad: this.cantidad
    };

    this.receta.ingredientes.push(newIngrediente);

    // Reset form
    this.selectedIngrediente = null;
    this.ingredienteSearch = '';
    this.cantidad = 0;
    this.filteredIngredientes = [...this.allIngredientes];
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
    return ingrediente ? ingrediente.categoria.medida : '';
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

      // Crear vista previa de la imagen
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



  registrarReceta(): void {
    if (!this.imagen) {
      alert('Por favor, selecciona una foto para la receta');
      return;
    }

    this.crearRecetaService.registrarReceta(this.receta, this.imagen, this.video)
      .subscribe({
        next: (response) => {
          alert('Receta registrada con éxito');
          this.router.navigate(['/main']);
        },
        error: (error) => {
          console.error(error);
          alert('Error al registrar la receta');
        },
      });
  }
  getStepForMeasure(measure: string): number {
    return (measure === 'g' || measure === 'ml') ? 50 : 1;
  }

  getMaxForMeasure(measure: string): number {
    return (measure === 'g' || measure === 'ml') ? 10000 : 100;
  }

  isFormValid(): boolean {
    return (
      this.receta.nombre.trim() !== '' &&
      this.receta.descripcion.trim() !== '' &&
      this.imagen !== null &&
      this.receta.ingredientes.length > 0
    );
  }
}
