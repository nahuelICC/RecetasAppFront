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
import {DatePipe, NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import { FormsModule } from "@angular/forms";
import {Platform} from '@ionic/angular';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  imports: [
    IonIcon,
    DatePipe,
    NgForOf,
    NgIf,
    FormsModule,
    NgClass,
    NgStyle
  ],
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  conversaciones: ConversacionDTO[] = [];
  mensajes: ChatDTO[] = [];
  nuevoMensaje = '';
  usuarioActualId: number;
  usuarioDestinoId: number | null = null;
  nombreUsuarioDestino: string = 'Usuario';
  fotoUsuarioDestino: string = 'assets/frutero.png';
  loading = true;
  error = '';
  isMobile = false;
  private subscriptions: Subscription[] = [];
  private currentRoomId: string | null = null;
  private isFetchingProfile = false;

  constructor(
    private chatService: ChatService,
    private websocketService: WebsocketService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private encryptService: EncryptService,
    private platform: Platform // Inyecta Platform
  ) {
    this.usuarioActualId = this.authService.getUserId() || 0;
    this.checkMobile();
    this.platform.resize.subscribe(() => this.checkMobile());
  }

  ngOnInit(): void {
    this.initConversaciones();
    this.initRouteListening();
    this.initWebSocket();
  }

  private checkMobile(): void {
    this.isMobile = this.platform.width() < 768;
  }

  private initConversaciones(): void {
    this.loading = true;
    this.subscriptions.push(
      this.chatService.conversaciones$.subscribe({
        next: (conversaciones) => {
          this.conversaciones = conversaciones;
          // Si estamos en una conversación que no está en la lista, la añadimos
          if (this.usuarioDestinoId && !this.conversaciones.some(c => c.otroUsuarioId === this.usuarioDestinoId)) {
            this.agregarConversacionSiNecesario();
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar conversaciones:', err);
          this.error = 'Error al cargar las conversaciones';
          this.loading = false;
        }
      })
    );
    this.chatService.refreshConversaciones();
  }

  private agregarConversacionSiNecesario(): void {
    if (!this.usuarioDestinoId || this.conversaciones.some(c => c.otroUsuarioId === this.usuarioDestinoId)) {
      return;
    }

    const nuevaConversacion: ConversacionDTO = {
      otroUsuarioId: this.usuarioDestinoId,
      otroUsuarioNombre: this.nombreUsuarioDestino,
      otroUsuarioFoto: this.fotoUsuarioDestino,
      ultimoMensaje: '',
      fechaUltimoMensaje: new Date(),
      noLeidos: false
    };

    this.conversaciones = [nuevaConversacion, ...this.conversaciones];
  }

  private initRouteListening(): void {
    this.subscriptions.push(
      this.route.params.subscribe({
        next: (params) => {
          if (params['id']) {
            const decryptedId = this.encryptService.desencriptar(params['id']);
            const nuevoDestinoId = +decryptedId;

            if (this.usuarioDestinoId !== nuevoDestinoId) {
              this.usuarioDestinoId = nuevoDestinoId;
              this.handleNewConversation();
            }
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
            this.chatService.refreshConversaciones();
          }
        },
        error: (err) => console.error('Error en mensajes WebSocket:', err)
      })
    );
  }

  private handleNewConversation(): void {
    if (!this.usuarioDestinoId) return;

    const nuevaRoomId = this.getRoomId(this.usuarioActualId, this.usuarioDestinoId);

    if (this.currentRoomId !== nuevaRoomId) {
      if (this.currentRoomId) {
        this.websocketService.disconnect();
      }
      this.currentRoomId = nuevaRoomId;
      this.websocketService.connect(this.currentRoomId);
    }

    this.cargarMensajes();

    const conversacionExistente = this.conversaciones.find(c => c.otroUsuarioId === this.usuarioDestinoId);

    if (conversacionExistente) {
      this.nombreUsuarioDestino = conversacionExistente.otroUsuarioNombre;
      this.fotoUsuarioDestino = conversacionExistente.otroUsuarioFoto;
    } else {
      this.cargarInformacionUsuarioDestino();
    }
  }

  private cargarInformacionUsuarioDestino(): void {
    const usuarioDestinoId = this.usuarioDestinoId;

    if (!usuarioDestinoId || this.isFetchingProfile) return;

    this.isFetchingProfile = true;

    this.usuarioService.getPerfilId(usuarioDestinoId.toString()).subscribe({
      next: (perfil) => {
        this.nombreUsuarioDestino = perfil?.nombre || 'Usuario';

        if (perfil?.fotoPerfil) {
          this.fotoUsuarioDestino = perfil.fotoPerfil;
        } else {
          this.usuarioService.fotoPerfilVisita(usuarioDestinoId.toString()).subscribe({
            next: (foto) => {
              this.fotoUsuarioDestino = foto || 'assets/frutero.png';
            },
            error: (err) => {
              console.error('Error loading profile picture:', err);
              this.fotoUsuarioDestino = 'assets/frutero.png';
            }
          });
        }

        // Actualizamos la lista de conversaciones localmente
        this.agregarConversacionSiNecesario();
        this.isFetchingProfile = false;
      },
      error: (err) => {
        console.error('Error loading user profile:', err);
        this.nombreUsuarioDestino = 'Usuario';
        this.fotoUsuarioDestino = 'assets/frutero.png';
        this.agregarConversacionSiNecesario();
        this.isFetchingProfile = false;
      }
    });
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

    if (this.usuarioDestinoId === usuarioId) {
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
          remitenteFoto: perfil.fotoPerfil || 'assets/frutero.png'
        };

        this.chatService.enviarMensaje(mensaje).subscribe({
          next: (mensajeGuardado) => {
            this.mensajes.push(mensajeGuardado);
            this.nuevoMensaje = '';
            // Forzar actualización de conversaciones
            this.chatService.refreshConversaciones();
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

  getNombreUsuario(usuarioId: number | null): string {
    if (!usuarioId) return 'Chat';
    const conversacion = this.conversaciones.find(c => c.otroUsuarioId === usuarioId);
    return conversacion?.otroUsuarioNombre || this.nombreUsuarioDestino || 'Usuario desconocido';
  }

  getFotoUsuario(usuarioId: number | null): string {
    if (!usuarioId) return 'assets/frutero.png';
    const conversacion = this.conversaciones.find(c => c.otroUsuarioId === usuarioId);
    return conversacion?.otroUsuarioFoto || this.fotoUsuarioDestino || 'assets/frutero.png';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.websocketService.disconnect();
  }
}
