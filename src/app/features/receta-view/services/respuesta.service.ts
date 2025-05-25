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

  ObtenerRespuestas(idComentario: String):Observable<Respuesta[]> {
    return this.http.get<Respuesta[]>(`${this.apiUrl}/listar/${idComentario}`);
  }

  ResponderComentario(respNueva: CrearRespuesta): Observable<Respuesta> {
    return this.http.post<Respuesta>(`${this.apiUrl}/new`, respNueva);
  }
}
