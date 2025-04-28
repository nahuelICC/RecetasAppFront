import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Receta } from './models/receta';

@Injectable({
  providedIn: 'root'
})
export class CrearRecetaService {
  constructor(private http: HttpClient) {}

  registrarReceta(receta: Receta, imagen: File | null, video: File | null) {
    const formData = new FormData();

    const recetaPlain = {
      nombre: receta.nombre,
      duracion: receta.duracion,
      descripcion: receta.descripcion,
      esVisible: receta.esVisible
    };

    const recetaBlob = new Blob([JSON.stringify(recetaPlain)], { type: 'application/json' });
    formData.append('receta', recetaBlob);

    if (imagen) {
      formData.append('imagen', imagen);
    }
    if (video) {
      formData.append('video', video);
    }

    // Elimina el header 'Accept' o asegúrate de que el servidor devuelva JSON
    return this.http.post('http://localhost:8081/receta/registro', formData, {
      responseType: 'text' // Maneja respuestas no JSON
    });
  }
}
