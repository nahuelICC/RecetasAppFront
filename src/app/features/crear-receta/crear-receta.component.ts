import { Component } from '@angular/core';
import { CrearRecetaService } from './crear-receta.service';
import { Receta } from './models/receta';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-receta',
  templateUrl: './crear-receta.component.html',
  standalone: true,
  imports: [FormsModule]
})
export class CrearRecetaComponent {
  receta: Receta = {
    nombre: '',
    duracion: '00:00:00',
    descripcion: '',
    esVisible: false,
  };

  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;

  imagen: File | null = null;
  video: File | null = null;

  constructor(private crearRecetaService: CrearRecetaService, private router: Router) {}

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
    if (type === 'imagen') {
      this.imagen = file;
    } else if (type === 'video') {
      this.video = file;
    }
  }

  registrarReceta(): void {
    this.crearRecetaService.registrarReceta(this.receta, this.imagen, this.video)
      .subscribe({
        next: (response) => {
          // No es necesario verificar la respuesta si el código de estado es 200
          alert('Receta registrada con éxito');
          this.router.navigate(['/main']);
        },
        error: (error) => {
          console.error(error);
          alert('Error al registrar la receta');
        },
      });
  }
}
