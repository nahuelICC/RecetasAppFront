import { Injectable } from '@angular/core';
import { Respuesta } from '../models/Respuesta';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrearRespuesta } from '../../../core/models/CrearRespuesta';

@Injectable({
  providedIn: 'root'
})
export class RespuestaService {
  private apiUrl = '/api/respuesta';

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Obtiene las respuestas asociadas a un comentario específico.
   * @param idComentario
   * @constructor
   */
  ObtenerRespuestas(idComentario: String):Observable<Respuesta[]> {
    return this.http.get<Respuesta[]>(`${this.apiUrl}/listar/${idComentario}`);
  }

  /**
   * Crea una nueva respuesta asociada a un comentario específico.
   * @param idReceta
   * @param respNueva
   * @constructor
   */
  ResponderComentario(idReceta: number, respNueva: CrearRespuesta): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${this.apiUrl}/new/${idReceta}`, respNueva);
  }

  /**
   * Elimina una respuesta existente.
   * @param idRespuesta
   */
  eliminarRespuesta(idRespuesta: String): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/eliminar/${idRespuesta}`);
  }


}
