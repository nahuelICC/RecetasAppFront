import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatDTO } from '../../features/chat/models/chat.dto';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private stompClient: Client | null = null;
  private messageSubject = new BehaviorSubject<ChatDTO | null>(null);
  private connectionStatus = new BehaviorSubject<boolean>(false);
  private currentRoomId: string | null = null;

  constructor(private authService: AuthService) {}

  connect(roomId: string): void {
    if (this.stompClient?.connected && this.currentRoomId === roomId) {
      return;
    }

    this.currentRoomId = roomId;
    const token = this.authService.getToken();

    if (!token) {
      console.error('No hay token disponible');
      return;
    }

    const socketUrl = `ws://localhost:8081/ws-native?token=${encodeURIComponent(token)}`;

    this.stompClient = new Client({
      brokerURL: socketUrl,
      reconnectDelay: 5000,
      debug: (str) => console.log('[STOMP]', str),
      onConnect: () => {
        console.log('Conectado al servidor WebSocket');
        this.onConnectSuccess(roomId);
      },
      onStompError: (frame) => {
        console.error('Error en WebSocket:', frame.headers['message']);
        this.connectionStatus.next(false);
      }
    });

    this.stompClient.activate();
  }

  private onConnectSuccess(roomId: string): void {
    this.connectionStatus.next(true);

    this.stompClient?.subscribe(
      `/topic/messages/${roomId}`,
      (message) => {
        try {
          const chatMessage: ChatDTO = JSON.parse(message.body);
          console.log('Mensaje recibido via WebSocket:', chatMessage);
          this.messageSubject.next(chatMessage);
        } catch (e) {
          console.error('Error al parsear mensaje:', e);
        }
      }
    );
  }

  sendMessage(destination: string, body: any): void {
    if (this.stompClient?.connected) {
      this.stompClient.publish({
        destination: `/app/chat/${this.currentRoomId}`,
        body: JSON.stringify(body)
      });
    } else {
      console.warn('WebSocket no conectado, mensaje no enviado');
    }
  }

  disconnect(): void {
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
      console.log('WebSocket desconectado');
      this.connectionStatus.next(false);
    }
    this.stompClient = null;
    this.currentRoomId = null;
  }

  getMessages(): Observable<ChatDTO | null> {
    return this.messageSubject.asObservable();
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }
}
