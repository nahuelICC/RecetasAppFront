import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { ChatDTO, ConversacionDTO } from './models/chat.dto';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = '/api/chat';

  constructor(
    private websocketService: WebsocketService,
    private authService: AuthService,
    private http: HttpClient
  ) {

  }

  getConversaciones(): Observable<ConversacionDTO[]> {
    const userId = this.authService.getUserId();
    return this.http.get<ConversacionDTO[]>(`${this.apiUrl}/conversaciones?usuarioId=${userId}`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener conversaciones:', error);
          return of([]);
        })
      );
  }

  getMensajes(remitenteId: number, destinatarioId: number): Observable<ChatDTO[]> {
    if (remitenteId === destinatarioId) {
      return throwError(() => new Error('Los IDs no pueden ser iguales'));
    }
    return this.http.get<ChatDTO[]>(
      `${this.apiUrl}/mensajes?remitenteId=${remitenteId}&destinatarioId=${destinatarioId}`
    ).pipe(
      catchError(error => {
        console.error('Error al obtener mensajes:', error);
        return of([]);
      })
    );
  }

  enviarMensaje(mensaje: ChatDTO): Observable<ChatDTO> {
    return new Observable(observer => {
      this.http.post<ChatDTO>(`${this.apiUrl}/enviar`, mensaje).subscribe({
        next: (mensajeGuardado) => {
          // El backend se encargará de enviar via WebSocket
          observer.next(mensajeGuardado);
          observer.complete();
        },
        error: (err) => {
          console.error('Error al enviar mensaje:', err);
          observer.error(err);
        }
      });
    });
  }

  marcarComoLeido(remitenteId: number, destinatarioId: number): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/marcar-leido?remitenteId=${remitenteId}&destinatarioId=${destinatarioId}`,
      {}
    ).pipe(
      catchError(error => {
        console.error('Error al marcar como leído:', error);
        return of();
      })
    );
  }

  getMessagesObservable(): Observable<ChatDTO | null> {
    return this.websocketService.getMessages();
  }
}
