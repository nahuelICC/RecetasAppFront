import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from './chat.service';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioService } from '../usuario/services/usuario.service';
import { Subscription } from 'rxjs';
import { ChatDTO, ConversacionDTO } from './models/chat.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { WebsocketService } from '../../core/services/websocket.service';
import { EncryptService } from '../../core/services/encrypt.service';
import { IonIcon } from "@ionic/angular/standalone";
import { DatePipe, NgForOf, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  imports: [
    IonIcon,
    DatePipe,
    NgForOf,
    NgIf,
    FormsModule
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
  private currentRoomId: string | null = null;

  constructor(
    private chatService: ChatService,
    private websocketService: WebsocketService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private encryptService: EncryptService
  ) {
    this.usuarioActualId = this.authService.getUserId() || 0;
  }

  ngOnInit(): void {
    this.initConversaciones();
    this.initRouteListening();
    this.initWebSocket();
  }

  private initConversaciones(): void {
    this.loading = true;
    this.subscriptions.push(
      this.chatService.conversaciones$.subscribe({
        next: (conversaciones) => {
          this.conversaciones = conversaciones;
          this.loading = false;
          // Si hay un usuarioDestinoId pero no está en conversaciones, forzamos carga
          if (this.usuarioDestinoId && !this.conversaciones.some(c => c.otroUsuarioId === this.usuarioDestinoId)) {
            this.chatService.refreshConversaciones();
          }
        },
        error: (err) => {
          console.error('Error al cargar conversaciones:', err);
          this.error = 'Error al cargar las conversaciones';
          this.loading = false;
        }
      })
    );
  }

  private initRouteListening(): void {
    this.subscriptions.push(
      this.route.params.subscribe({
        next: (params) => {
          if (params['id']) {
            const decryptedId = this.encryptService.desencriptar(params['id']);
            this.usuarioDestinoId = +decryptedId;
            this.handleNewConversation();
          } else {
            this.usuarioDestinoId = null;
            this.mensajes = [];
          }
        },
        error: (err) => {
          console.error('Error en parámetros de ruta:', err);
          this.error = 'Error al cargar la conversación';
        }
      })
    );
  }

  private initWebSocket(): void {
    this.subscriptions.push(
      this.chatService.getMessagesObservable().subscribe({
        next: (msg) => {
          if (msg && (msg.destinatarioId === this.usuarioActualId || msg.remitenteId === this.usuarioDestinoId)) {
            this.mensajes.push(msg);
            this.marcarMensajesComoLeidos();
            this.chatService.refreshConversaciones(); // Actualizar lista de conversaciones
          }
        },
        error: (err) => console.error('Error en mensajes WebSocket:', err)
      })
    );
  }

  private handleNewConversation(): void {
    if (!this.usuarioDestinoId) return;

    this.currentRoomId = this.getRoomId(this.usuarioActualId, this.usuarioDestinoId);
    this.websocketService.connect(this.currentRoomId);
    this.cargarMensajes();
    this.chatService.refreshConversaciones(); // Forzar actualización de conversaciones
  }

  private getRoomId(user1Id: number, user2Id: number): string {
    return [user1Id, user2Id].sort().join('_');
  }

  cargarMensajes(): void {
    if (!this.usuarioDestinoId || this.usuarioDestinoId === this.usuarioActualId) {
      console.error('ID de destinatario inválido');
      this.error = 'ID de destinatario inválido';
      return;
    }

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
    if (usuarioId === this.usuarioActualId) {
      this.error = 'No puedes chatear contigo mismo';
      return;
    }
    const encryptedId = this.encryptService.encriptar(usuarioId.toString());
    this.router.navigate(['/chat', encryptedId]);
  }

  enviarMensaje(): void {
    if (!this.nuevoMensaje.trim() || !this.usuarioDestinoId) return;

    this.usuarioService.getPerfil().subscribe({
      next: (perfil) => {
        const mensaje: ChatDTO = {
          texto: this.nuevoMensaje,
          remitenteId: this.usuarioActualId,
          destinatarioId: this.usuarioDestinoId!,
          fecha: new Date(),
          leido: false,
          remitenteNombre: perfil.nombre || 'Usuario',
          remitenteFoto: perfil.fotoPerfil || 'assets/images/default-avatar.png'
        };

        this.chatService.enviarMensaje(mensaje).subscribe({
          next: (mensajeGuardado) => {
            this.mensajes.push(mensajeGuardado);
            this.nuevoMensaje = '';
          },
          error: (err) => {
            console.error('Error al enviar mensaje:', err);
            this.error = 'Error al enviar el mensaje';
          }
        });
      },
      error: (err) => {
        console.error('Error al obtener perfil:', err);
        this.error = 'Error al cargar datos del usuario';
      }
    });
  }

  marcarMensajesComoLeidos(): void {
    if (!this.usuarioDestinoId) return;

    this.subscriptions.push(
      this.chatService.marcarComoLeido(this.usuarioDestinoId, this.usuarioActualId).subscribe({
        error: (err: any) => console.error('Error al marcar como leído:', err)
      })
    );
  }

  getFotoUsuarioDestino(): string {
    const conversacion = this.conversaciones.find(c => c.otroUsuarioId === this.usuarioDestinoId);
    return conversacion?.otroUsuarioFoto || 'assets/images/default-avatar.png';
  }

  getNombreUsuarioDestino(): string {
    const conversacion = this.conversaciones.find(c => c.otroUsuarioId === this.usuarioDestinoId);
    return conversacion?.otroUsuarioNombre || 'Usuario desconocido';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.websocketService.disconnect();
  }
}
