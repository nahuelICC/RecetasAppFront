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
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private userId: number | null = null;

  connect(userId: number): void {
    this.userId = userId;

    if (this.stompClient?.connected) {
      return;
    }

    console.log('Conectando a WebSocket...');

    // Usar WebSocket nativo
    const socket = new WebSocket('ws://localhost:8081/ws-postman');
    this.stompClient = over(socket);

    this.stompClient.connect(
      {},
      () => this.onConnectSuccess(),
      (error) => this.onConnectError(error)
    );
  }

  private onConnectSuccess(): void {
    this.reconnectAttempts = 0;
    this.connectionStatus.next(true);
    console.log('WebSocket conectado correctamente');

    if (this.userId) {
      this.stompClient?.subscribe(
        `/user/${this.userId}/queue/mensajes`,
        (message) => {
          try {
            const chatMessage: ChatDTO = JSON.parse(message.body);
            this.messageSubject.next(chatMessage);
          } catch (e) {
            console.error('Error al parsear mensaje:', e);
          }
        }
      );
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
      const delay = Math.min(5000 * this.reconnectAttempts, 30000);
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
