import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from './chat.service';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { ChatDTO, ConversacionDTO } from './models/chat.dto';
import { IonIcon } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WebsocketService } from '../../core/services/websocket.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  imports: [
    IonIcon,
    FormsModule,
    DatePipe,
    NgIf,
    NgForOf
  ],
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  conversaciones: ConversacionDTO[] = [];
  mensajes: ChatDTO[] = [];
  nuevoMensaje = '';
  usuarioActualId: number;
  usuarioDestinoId: number | null = null;
  loading = true;
  error = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private websocketService: WebsocketService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.usuarioActualId = this.authService.getUserId() || 0;
  }

  ngOnInit(): void {
    this.cargarConversaciones();

    this.subscriptions.push(
      this.chatService.getMessagesObservable().subscribe({
        next: (mensaje) => {
          if (mensaje && this.usuarioDestinoId &&
            ((mensaje.remitenteId === this.usuarioDestinoId && mensaje.destinatarioId === this.usuarioActualId) ||
              (mensaje.destinatarioId === this.usuarioDestinoId && mensaje.remitenteId === this.usuarioActualId))) {
            this.mensajes.push(mensaje);
          }
        },
        error: (err: any) => console.error('Error en mensajes:', err)
      })
    );

    this.route.params.subscribe({
      next: (params) => {
        if (params['id']) {
          this.usuarioDestinoId = +params['id'];
          this.cargarMensajes();
        } else {
          this.usuarioDestinoId = null;
          this.mensajes = [];
        }
      },
      error: (err) => {
        console.error('Error en parámetros de ruta:', err);
        this.error = 'Error al cargar la conversación';
      }
    });
  }

  cargarConversaciones(): void {
    this.loading = true;
    this.subscriptions.push(
      this.chatService.getConversaciones().subscribe({
        next: (data: ConversacionDTO[]) => {
          this.conversaciones = data;
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error al cargar conversaciones:', err);
          this.error = 'Error al cargar las conversaciones';
          this.loading = false;
        }
      })
    );
  }

  cargarMensajes(): void {
    if (!this.usuarioDestinoId) return;

    this.loading = true;
    this.subscriptions.push(
      this.chatService.getMensajes(this.usuarioActualId, this.usuarioDestinoId).subscribe({
        next: (data: ChatDTO[]) => {
          this.mensajes = data;
          this.marcarMensajesComoLeidos();
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error al cargar mensajes:', err);
          this.error = 'Error al cargar los mensajes';
          this.loading = false;
        }
      })
    );
  }

  seleccionarConversacion(usuarioId: number): void {
    this.router.navigate(['/chat', usuarioId]);
  }

  enviarMensaje(): void {
    if (!this.nuevoMensaje.trim() || !this.usuarioDestinoId) return;

    const mensaje: ChatDTO = {
      texto: this.nuevoMensaje,
      remitenteId: this.usuarioActualId,
      destinatarioId: this.usuarioDestinoId,
      fecha: new Date(),
      leido: false,
      id: 0,
      remitenteNombre: '',
      remitenteFoto: ''
    };

    try {
      this.chatService.enviarMensaje(mensaje);
      this.nuevoMensaje = '';
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      this.error = 'Error al enviar el mensaje';
    }
  }

  marcarMensajesComoLeidos(): void {
    if (!this.usuarioDestinoId) return;

    this.subscriptions.push(
      this.chatService.marcarComoLeido(this.usuarioDestinoId, this.usuarioActualId).subscribe({
        error: (err: any) => console.error('Error al marcar como leído:', err)
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.websocketService.disconnect();
  }

  getFotoUsuarioDestino(): string {
    const conversacion = this.conversaciones.find(c => c.otroUsuarioId === this.usuarioDestinoId);
    return conversacion?.otroUsuarioFoto || 'assets/images/default-avatar.png';
  }

  getNombreUsuarioDestino(): string {
    const conversacion = this.conversaciones.find(c => c.otroUsuarioId === this.usuarioDestinoId);
    return conversacion?.otroUsuarioNombre || 'Usuario desconocido';
  }
}
