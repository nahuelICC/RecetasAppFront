import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { WebsocketService } from '../../core/services/websocket.service';
import {ChatDTO,ConversacionDTO} from './models/chat.dto';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = '/api/chat'; // Define la URL base de tu API

  constructor(
    private websocketService: WebsocketService,
    private authService: AuthService,
    private http: HttpClient
  ) {
    const userId = this.authService.getUserId();
    if (userId) {
      this.websocketService.connect(userId);
    }
  }

  getConversaciones(): Observable<ConversacionDTO[]> {
    const userId = this.authService.getUserId();
    return this.http.get<ConversacionDTO[]>(`${this.apiUrl}/conversaciones?usuarioId=${userId}`);
  }

  getMensajes(remitenteId: number, destinatarioId: number): Observable<ChatDTO[]> {
    return this.http.get<ChatDTO[]>(
      `${this.apiUrl}/mensajes?remitenteId=${remitenteId}&destinatarioId=${destinatarioId}`
    );
  }

  enviarMensaje(mensaje: ChatDTO): void {
    this.websocketService.sendMessage('/app/chat', mensaje);
    this.http.post(`${this.apiUrl}/enviar`, mensaje).subscribe();
  }

  marcarComoLeido(remitenteId: number, destinatarioId: number): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/marcar-leido?remitenteId=${remitenteId}&destinatarioId=${destinatarioId}`,
      {}
    );
  }

  getMessagesObservable(): Observable<ChatDTO | null> {
    return this.websocketService.getMessages();
  }
}
