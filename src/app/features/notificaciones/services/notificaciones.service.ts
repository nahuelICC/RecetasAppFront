import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {GetNotificacionDTO} from '../Models/GetNotificacionDTO';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private apiUrl = 'api/notificacion';
  private notificacionesNoLeidasCountSubject = new BehaviorSubject<number>(0);
  notificacionesNoLeidasCount$ = this.notificacionesNoLeidasCountSubject.asObservable();
  constructor(private http: HttpClient) { }

  /**
   * Obtiene las notificaciones del usuario autenticado.
   * @returns Observable con las notificaciones.
   */
  obtenerNotificacionesPorUsuario(): Observable<GetNotificacionDTO[]> {
    return this.http.get<GetNotificacionDTO[]>(`${this.apiUrl}/personales`);
  }

  /**
   * Marca todas las notificaciones del usuario autenticado como leídas.
   * @returns Observable con el resultado de la operación.
   */
  marcarNotificacionesComoLeidas(): Observable<any> {
    return this.http.put(`${this.apiUrl}/notificaciones/leer`, null);
  }

  /**
   * Actualiza el contador de notificaciones no leídas.
   * Obtiene las notificaciones del usuario y cuenta cuántas no están leídas.
   */
  actualizarContadorNotificaciones() {
    this.obtenerNotificacionesPorUsuario().subscribe({
      next: (notificaciones) => {
        const noLeidas = notificaciones.filter(n => !n.leida).length;
        this.notificacionesNoLeidasCountSubject.next(noLeidas);
      },
      error: (err) => {
        console.error('Error actualizando contador', err);
      }
    });
  }

}
