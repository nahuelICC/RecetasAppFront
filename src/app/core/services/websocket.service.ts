import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Client, over } from 'stompjs';
import { ChatDTO } from '../../features/chat/models/chat.dto';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private stompClient: Client | null = null;
  private messageSubject = new BehaviorSubject<ChatDTO | null>(null);
  private connectionStatus = new BehaviorSubject<boolean>(false);
  private userId: number | null = null;
  private reconnectInterval = 5000;
  private maxReconnectAttempts = 5;
  private reconnectAttempts = 0;
  private debug = true; // Habilitar logs

  connect(userId: number): void {
    if (this.stompClient?.connected) return;

    const socket = new WebSocket('ws://localhost:8081/ws-postman');
    this.stompClient = over(socket);

    this.stompClient.debug = (str) => console.log('[STOMP]', str);

    this.stompClient.connect({},
      () => {
        console.log('STOMP conectado');
        this.stompClient?.subscribe(`/user/queue/mensajes`,
          (message) => {
            console.log('Mensaje recibido:', message.body);
            this.messageSubject.next(JSON.parse(message.body));
          }
        );
      },
      (error) => console.error('Error STOMP:', error)
    );
  }

  private onConnectSuccess(): void {
    this.reconnectAttempts = 0;
    this.connectionStatus.next(true);
    console.log('WebSocket conectado correctamente');

    if (this.userId) {
      // Suscribirse usando la notación correcta para user destinations
      const subscription = this.stompClient?.subscribe(
        `/user/queue/mensajes`,
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
      console.log(`Suscrito a cola personal para usuario ${this.userId}`);
    }
  }

  private onConnectError(error: any): void {
    console.error('Error en WebSocket:', error);
    this.connectionStatus.next(false);
    this.handleReconnect();
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId) {
      this.reconnectAttempts++;
      const delay = this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts);
      console.log(`Reintentando conexión en ${delay}ms...`);
      setTimeout(() => this.connect(this.userId!), delay);
    } else {
      console.error('Máximo de intentos de reconexión alcanzado');
    }
  }

  getMessages(): Observable<ChatDTO | null> {
    return this.messageSubject.asObservable();
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  getConnectionStatusValue(): boolean {
    return this.connectionStatus.getValue();
  }

  sendMessage(destination: string, body: any): void {
    if (this.stompClient?.connected) {
      try {
        this.stompClient.send(destination, {}, JSON.stringify(body));
      } catch (e) {
        console.error('Error al enviar mensaje:', e);
      }
    } else {
      console.warn('WebSocket no conectado, mensaje no enviado');
      this.connectionStatus.next(false);
    }
  }

  disconnect(): void {
    if (this.stompClient?.connected) {
      this.stompClient.disconnect(() => {
        console.log('WebSocket desconectado');
        this.connectionStatus.next(false);
      });
    }
  }
}
