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

  obtenerNotificacionesPorUsuario(idUsuario: number): Observable<GetNotificacionDTO[]> {
    return this.http.get<GetNotificacionDTO[]>(`${this.apiUrl}/usuario/${idUsuario}`);
  }

  marcarNotificacionesComoLeidas(idUsuario: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/marcar-leidas/${idUsuario}`, null);
  }

  actualizarContadorNotificaciones(idUsuario: number) {
    this.obtenerNotificacionesPorUsuario(idUsuario).subscribe({
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
