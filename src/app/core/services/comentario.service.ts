import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ComentarioResponse } from '../models/ComentarioResponse';
import { Observable } from 'rxjs';
import { Respuesta } from '../../features/receta-view/models/Respuesta';
import { CrearRespuesta } from '../models/CrearRespuesta';
import { CrearComentario } from '../models/CrearComentario';

/**
 * Servicio para manejar comentarios y respuestas en recetas.
 */
@Injectable({
  providedIn: 'root'
})
export class ComentarioService {

  private apiUrl = '/api';


constructor(
  private http: HttpClient,
) { }

  /**
   * Obtiene todos los comentarios de una receta específica.
   * @param idReceta
   */
  getComentariosReceta(idReceta: string): Observable<ComentarioResponse[]> {
    return this.http.get<ComentarioResponse[]>(this.apiUrl +`/comentario/all/receta/`+idReceta);
  }

  // /**
  //  * Crea un nuevo comentario en una receta.
  //  * @param respuesta
  //  * @param idComentario
  //  */
  // responderComentario(respuesta: CrearRespuesta,idComentario: string){
  //   return this.http.post<Respuesta>(this.apiUrl + '/respuesta/new', respuesta);
  // }

  /**
   * Crea un nuevo comentario en una receta.
   * @param texto
   * @param idReceta
   */
  comentarReceta(texto: CrearComentario, idReceta: string): Observable<ComentarioResponse> {
    return this.http.post<ComentarioResponse>(this.apiUrl + `/comentario/receta/${idReceta}`, texto);
  }

  /**
   * Endpoint que elimina un comentario de una receta.
   * @param idComentario
   */
  eliminarComentario(idComentario: number){
    return this.http.delete(this.apiUrl + `/comentario/receta/${idComentario}`);
  }

  /**
   *  Endpoint que marca un comentario como denunciado.
   * @param idComentario
   */
  denunciarComentario(idComentario: number): Observable<string> {
    return this.http.post(`${this.apiUrl}/comentario/denunciar/${idComentario}`, null, { responseType: 'text' });
  }
}
