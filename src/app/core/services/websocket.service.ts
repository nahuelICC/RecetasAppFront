import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatDTO } from '../../features/chat/models/chat.dto';
import { AuthService } from './auth.service';

/**
 * Servicio para manejar la conexión WebSocket y la comunicación en tiempo real del chat.
 */
@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private stompClient: Client | null = null;
  private messageSubject = new BehaviorSubject<ChatDTO | null>(null);
  private connectionStatus = new BehaviorSubject<boolean>(false);

  constructor(private authService: AuthService) {}

  /**
   * Endpoint que establece la conexión WebSocket.
   */
  connect(): void {
    if (this.stompClient?.connected) {
      return;
    }

    const token = this.authService.getToken();
    const userId = this.authService.getUserId();

    if (!token || !userId) {
      console.error('No hay token o ID de usuario disponible');
      return;
    }

    const socketUrl = `ws://localhost:8081/ws-native?token=${encodeURIComponent(token)}`;

    this.stompClient = new Client({
      brokerURL: socketUrl,
      reconnectDelay: 5000,
      debug: (str) => console.log('[STOMP]', str),
      onConnect: () => {
        console.log('Conectado al servidor WebSocket');
        this.onConnectSuccess(userId);
      },
      onStompError: (frame) => {
        console.error('Error en WebSocket:', frame.headers['message']);
        this.connectionStatus.next(false);
      }
    });

    this.stompClient.activate();
  }

  /**
   * Endpoint que maneja la conexión exitosa y suscribe al usuario a los mensajes.
   * @param userId ID del usuario para suscribirse a los mensajes.
   */
  private onConnectSuccess(userId: number): void {
    this.connectionStatus.next(true);

    this.stompClient?.subscribe(
      `/topic/messages/${userId}`,
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
        destination: `/app/chat`,
        body: JSON.stringify(body)
      });
    } else {
      console.warn('WebSocket no conectado, mensaje no enviado');
    }
  }

  /**
   * Endpoint que desconecta el cliente WebSocket.
   */
  disconnect(): void {
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
      console.log('WebSocket desconectado');
      this.connectionStatus.next(false);
    }
    this.stompClient = null;
  }

  /**
   * Endpoint que obtiene los mensajes del chat.
   */
  getMessages(): Observable<ChatDTO | null> {
    return this.messageSubject.asObservable();
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }
}
