import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Client, over } from 'stompjs';
import { ChatDTO} from '../../features/chat/models/chat.dto';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private stompClient: Client | null = null;
  private messageSubject = new BehaviorSubject<ChatDTO | null>(null);

  connect(userId: number): void {
    if (this.stompClient?.connected) return;

    const socket = new WebSocket(`ws://${window.location.host}/ws`);
    this.stompClient = over(socket);

    this.stompClient.connect({}, () => {
      this.stompClient?.subscribe(`/user/${userId}/queue/mensajes`, (message) => {
        this.messageSubject.next(JSON.parse(message.body));
      });
    }, (error) => {
      console.error('WebSocket error:', error);
      setTimeout(() => this.connect(userId), 5000);
    });
  }

  getMessages(): Observable<ChatDTO | null> {
    return this.messageSubject.asObservable();
  }

  sendMessage(destination: string, body: any): void {
    if (this.stompClient?.connected) {
      this.stompClient.send(destination, {}, JSON.stringify(body));
    }
  }

  disconnect(): void {
    if (this.stompClient?.connected) {
      this.stompClient.disconnect(() => {
        console.log('WebSocket disconnected');
      });
    }
    this.messageSubject.complete();
  }
}
