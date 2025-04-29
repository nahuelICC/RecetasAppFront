import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {RecetaInicioDTO} from '../models/RecetaInicioDTO';

@Injectable({
  providedIn: 'root'
})
export class InicioService {

  private apiUrl = 'api/receta';
  private listaCompraUrl = 'api/listaCompra';// URL base del backend

  constructor(private http: HttpClient) {}

  getTop10RecetasByCookerId(cookerId: number): Observable<RecetaInicioDTO[]> {
    return this.http.get<RecetaInicioDTO[]>(`${this.apiUrl}/recetasInicio/${cookerId}`);
  }
  getRecetasSiguiendo(cookerId: number): Observable<RecetaInicioDTO[]> {
    return this.http.get<RecetaInicioDTO[]>(`${this.apiUrl}/recetasSiguiendo/${cookerId}`);
  }

  darMeGustaAReceta(recetaId: number, cookerId: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/meGusta`, { recetaId, cookerId }, { responseType: 'text' as 'json' });
  }

  verificarMeGusta(recetaId: number, cookerId: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/estado`, { recetaId, cookerId });
  }

  eliminarMeGusta(recetaId: number, cookerId: number): Observable<string> {
    return this.http.request<string>('DELETE', `${this.apiUrl}/meGusta`, {
      body: { recetaId, cookerId },
      responseType: 'text' as 'json'
    });
  }

  guardarReceta(recetaId: number, cookerId: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/guardar`, { recetaId, cookerId }, { responseType: 'text' as 'json' });
  }

  verificarRecetaGuardada(recetaId: number, cookerId: number): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/estadoGuardado`, { recetaId, cookerId });
  }

  eliminarRecetaGuardada(recetaId: number, cookerId: number): Observable<string> {
    return this.http.request<string>('DELETE', `${this.apiUrl}/guardar`, {
      body: { recetaId, cookerId },
      responseType: 'text' as 'json'
    });
  }
  agregarIngredientesALaListaCompra(idReceta: number, idCooker: number): Observable<string> {
    const body = {
      idReceta: idReceta,
      idCooker: idCooker
    };

    return this.http.post<string>(`${this.listaCompraUrl}/agregar-ingredientes`, body, {
      responseType: 'text' as 'json'
    });
  }


}
