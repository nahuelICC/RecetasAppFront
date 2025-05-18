import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ComentarioResponse } from '../models/ComentarioResponse';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComentarioService {

  private apiUrl = '/api';


constructor(
  private http: HttpClient,
) { }

  getComentariosReceta(idReceta: string): Observable<ComentarioResponse[]> {
    return this.http.get<ComentarioResponse[]>(this.apiUrl +`/comentario/all/receta/`+idReceta);
  }

  postComentarioReceta(idReceta: string, comentario: any) {
    return this.http.post<any>(`https://api.recetario.com/comentarios/${idReceta}`, comentario);
  }

  deleteComentarioReceta(idComentario: string) {
    return this.http.delete<any>(`https://api.recetario.com/comentarios/${idComentario}`);
  }

}
