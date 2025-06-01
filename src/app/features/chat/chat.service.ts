import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { ChatDTO, ConversacionDTO } from './models/chat.dto';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = '/api/chat';
  private conversacionesSubject = new BehaviorSubject<ConversacionDTO[]>([]);
  conversaciones$ = this.conversacionesSubject.asObservable();

  constructor(
    private websocketService: WebsocketService,
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.loadConversaciones();
  }

  private loadConversaciones(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.http.get<ConversacionDTO[]>(`${this.apiUrl}/conversaciones?usuarioId=${userId}`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener conversaciones:', error);
          return of([]);
        })
      )
      .subscribe(conversaciones => {
        this.conversacionesSubject.next(conversaciones);
      });
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
    return this.http.post<ChatDTO>(`${this.apiUrl}/enviar`, mensaje).pipe(
      tap(() => this.loadConversaciones()), // Actualizar conversaciones después de enviar
      catchError(error => {
        console.error('Error al enviar mensaje:', error);
        return throwError(() => error);
      })
    );
  }

  marcarComoLeido(remitenteId: number, destinatarioId: number): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/marcar-leido?remitenteId=${remitenteId}&destinatarioId=${destinatarioId}`,
      {}
    ).pipe(
      tap(() => this.loadConversaciones()), // Actualizar conversaciones después de marcar como leído
      catchError(error => {
        console.error('Error al marcar como leído:', error);
        return of();
      })
    );
  }

  getMessagesObservable(): Observable<ChatDTO | null> {
    return this.websocketService.getMessages();
  }

  refreshConversaciones(): void {
    this.loadConversaciones();
  }

  marcarComoBorrado(mensajeId: number, usuarioId: number): Observable<ChatDTO> {
    return this.http.put<ChatDTO>(
      `${this.apiUrl}/borrar/${mensajeId}?usuarioId=${usuarioId}`,
      {}
    ).pipe(
      tap(() => this.refreshConversaciones())
    );
  }
}
