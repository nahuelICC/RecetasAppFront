import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { ChatDTO, ConversacionDTO } from './models/chat.dto';

/**
 * Servicio para manejar la lógica del chat, incluyendo la obtención de conversaciones,
 */
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

  /**
   * Endpoint que carga las conversaciones del usuario desde el servidor y las almacena en un BehaviorSubject.
   * @private
   */
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

  /**
   * Endpoint que obtiene los mensajes entre dos usuarios.
   * @param remitenteId
   * @param destinatarioId
   * @param page
   * @param size
   */
  getMensajes(remitenteId: number, destinatarioId: number, page: number = 0, size: number = 10): Observable<ChatDTO[]> {
    if (remitenteId === destinatarioId) {
      return throwError(() => new Error('Los IDs no pueden ser iguales'));
    }
    return this.http.get<ChatDTO[]>(
      `${this.apiUrl}/mensajes?remitenteId=${remitenteId}&destinatarioId=${destinatarioId}&page=${page}&size=${size}`
    ).pipe(
      catchError(error => {
        console.error('Error al obtener mensajes:', error);
        return of([]);
      })
    );
  }

  /**
   * Endpoint que envía un mensaje al servidor y actualiza las conversaciones.
   * @param mensaje
   */
  enviarMensaje(mensaje: ChatDTO): Observable<ChatDTO> {
    return this.http.post<ChatDTO>(`${this.apiUrl}/enviar`, mensaje).pipe(
      tap(() => this.loadConversaciones()), // Actualizar conversaciones después de enviar
      catchError(error => {
        console.error('Error al enviar mensaje:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Endpoint que marca un mensaje como leído entre dos usuarios.
   * @param remitenteId
   * @param destinatarioId
   */
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

  /**
   * Endpoint que refresca las conversaciones del usuario.
   */
  refreshConversaciones(): void {
    this.loadConversaciones();
  }

  /**
   * Endpoint que marca un mensaje como borrado para un usuario específico.
   * @param mensajeId
   * @param usuarioId
   */
  marcarComoBorrado(mensajeId: number, usuarioId: number): Observable<ChatDTO> {
    return this.http.put<ChatDTO>(
      `${this.apiUrl}/borrar/${mensajeId}?usuarioId=${usuarioId}`,
      {}
    ).pipe(
      tap(() => this.refreshConversaciones())
    );
  }
  private usuariosBloqueados: Set<number> = new Set<number>();

  getUsuariosBloqueados(): Set<number> {
    return this.usuariosBloqueados;
  }
}
