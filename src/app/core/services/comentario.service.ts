import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ComentarioResponse } from '../models/ComentarioResponse';
import { Observable } from 'rxjs';
import { Respuesta } from '../../features/receta-view/models/Respuesta';
import { CrearRespuesta } from '../models/CrearRespuesta';
import { CrearComentario } from '../models/CrearComentario';

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

  responderComentario(respuesta: CrearRespuesta,idComentario: string){
    return this.http.post<Respuesta>(this.apiUrl + '/respuesta/new', respuesta);
  }

  comentarReceta(texto: CrearComentario, idReceta: string): Observable<ComentarioResponse> {
    return this.http.post<ComentarioResponse>(this.apiUrl + `/comentario/receta/${idReceta}`, texto);
  }

  eliminarComentario(idComentario: number){
    return this.http.delete(this.apiUrl + `/comentario/receta/${idComentario}`);
  }
}
