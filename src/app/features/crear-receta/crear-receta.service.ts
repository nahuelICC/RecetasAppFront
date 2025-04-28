// crear-receta.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Receta, Ingrediente } from './models/receta';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CrearRecetaService {
  constructor(private http: HttpClient) {}

  getIngredientes(): Observable<Ingrediente[]> {
    return this.http.get<Ingrediente[]>('http://localhost:8081/ingrediente/listar');
  }

  registrarReceta(receta: Receta, imagen: File | null, video: File | null) {
    const formData = new FormData();

    const recetaPlain = {
      nombre: receta.nombre,
      duracion: receta.duracion,
      descripcion: receta.descripcion,
      esVisible: receta.esVisible,
      ingredientes: receta.ingredientes
    };

    const recetaBlob = new Blob([JSON.stringify(recetaPlain)], { type: 'application/json' });
    formData.append('receta', recetaBlob);

    if (imagen) {
      formData.append('imagen', imagen);
    }
    if (video) {
      formData.append('video', video);
    }

    return this.http.post('http://localhost:8081/receta/registro', formData, {
      responseType: 'text'
    });
  }
}
