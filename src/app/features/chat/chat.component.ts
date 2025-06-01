import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ChatService } from './chat.service';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioService } from '../usuario/services/usuario.service';
import { Subscription, of, forkJoin } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { ChatDTO, ConversacionDTO } from './models/chat.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { WebsocketService } from '../../core/services/websocket.service';
import { EncryptService } from '../../core/services/encrypt.service';
import { IonIcon } from "@ionic/angular/standalone";
import {DatePipe, NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import { FormsModule } from "@angular/forms";
import {Platform} from '@ionic/angular';
import {AudioService} from '../../core/services/audio.service';
import { ChangeDetectorRef } from '@angular/core';

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
  mensajeSeleccionado: ChatDTO | null = null;
  nuevoMensaje = '';
  usuarioActualId: number;
  usuarioDestinoId: number | null = null;
  nombreUsuarioDestino: string = '';
  fotoUsuarioDestino: string = '';
  loading = true;
  error = '';
  isMobile = false;
  currentPage = 0;
  pageSize = 10;
  loadingMore = false;
  allMessagesLoaded = false;
  private usuariosBloqueados: Set<number> = new Set<number>();
  private subscriptions: Subscription[] = [];
  private currentRoomId: string | null = null;
  private isFetchingProfile = false;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  buscando = false;
  terminoBusqueda = '';
  usuariosSeguidos: any[] = [];
  mostrarResultadosBusqueda = false;
  perfilBloqueado = false;

  constructor(
    private chatService: ChatService,
    private websocketService: WebsocketService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private audioService: AudioService,
    private encryptService: EncryptService,
    private cdr: ChangeDetectorRef,
    private platform: Platform
  ) {
    this.usuarioActualId = this.authService.getUserId() || 0;
    this.checkMobile();
    this.platform.resize.subscribe(() => this.checkMobile());
  }

  ngOnInit(): void {
    this.initConversaciones();
    this.initRouteListening();
    this.websocketService.connect();
    this.initWebSocket();
    this.cargarUsuariosSeguidos();
  }

  private checkMobile(): void {
    this.isMobile = this.platform.width() < 768;
  }

  private cargarUsuariosSeguidos(): void {
    this.usuarioService.listaSeguidos(true).subscribe({
      next: (seguidos) => {
        this.usuariosSeguidos = seguidos;
      },
      error: (err) => {
        console.error('Error al cargar usuarios seguidos:', err);
      }
    });
  }

  private initConversaciones(): void {
    this.loading = true;
    this.subscriptions.push(
      this.chatService.conversaciones$.pipe(
        switchMap(conversaciones => {
          // Verificar bloqueo para cada conversación
          const verificaciones = conversaciones.map(conv =>
            this.usuarioService.perfilBloqueado(conv.otroUsuarioId.toString()).pipe(
              map(bloqueado => ({ ...conv, bloqueado })),
              catchError(() => of({ ...conv, bloqueado: false }))
            )
          );
          return forkJoin(verificaciones);
        })
      ).subscribe({
        next: (conversacionesConEstado) => {
          // Filtrar conversaciones bloqueadas y actualizar conjunto
          this.conversaciones = conversacionesConEstado.filter(conv => !conv.bloqueado);
          conversacionesConEstado
            .filter(conv => conv.bloqueado)
            .forEach(conv => this.usuariosBloqueados.add(conv.otroUsuarioId));

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
              this.verificarBloqueo();
            }
          } else {
            this.usuarioDestinoId = null;
            this.mensajes = [];
            this.nombreUsuarioDestino = '';
            this.fotoUsuarioDestino = '';
            this.perfilBloqueado = false;
          }
        },
        error: (err) => {
          console.error('Error en parámetros de ruta:', err);
          this.error = 'Error al cargar la conversación';
        }
      })
    );
  }

  private verificarBloqueo(): void {
    if (!this.usuarioDestinoId) return;

    this.usuarioService.perfilBloqueado(this.usuarioDestinoId.toString()).subscribe({
      next: (response) => {
        const estaBloqueado = response as boolean;
        this.perfilBloqueado = estaBloqueado;

        if (estaBloqueado) {
          // Añadir a usuarios bloqueados
          this.usuariosBloqueados.add(this.usuarioDestinoId!);

          // Limpiar mensajes y desconectar
          this.mensajes = [];
          this.websocketService.disconnect();
          this.currentRoomId = null;

          // Forzar actualización de conversaciones
          this.chatService.refreshConversaciones();
        } else {
          this.handleNewConversation();
        }
      },
      error: (err) => {
        console.error('Error al verificar bloqueo:', err);
        this.perfilBloqueado = false;
        this.handleNewConversation();
      }
    });
  }
  private initWebSocket(): void {
    this.subscriptions.push(
      this.websocketService.getMessages().subscribe({
        next: (msg) => {
          if (!msg) return;

          // Verificar si el mensaje es de un usuario bloqueado
          if (this.usuariosBloqueados.has(msg.remitenteId)) {
            return; // Ignorar mensajes de usuarios bloqueados
          }

          if (msg.borrado) {
            const index = this.mensajes.findIndex(m => m.id === msg.id);
            if (index !== -1) {
              this.mensajes[index] = msg;
              this.cdr.detectChanges();
              return;
            }
          }

          // Solo procesar mensajes si no estamos en un chat bloqueado
          if (!this.perfilBloqueado) {
            this.audioService.reproducir('mensaje');
            this.chatService.refreshConversaciones();

            if (
              (msg.remitenteId === this.usuarioDestinoId && msg.destinatarioId === this.usuarioActualId) ||
              (msg.remitenteId === this.usuarioActualId && msg.destinatarioId === this.usuarioDestinoId)
            ) {
              this.mensajes.push(msg);
              this.marcarMensajesComoLeidos();
            }
          }
        },
        error: (err) => console.error('Error en mensajes WebSocket:', err)
      })
    );
  }

  private handleNewConversation(): void {
    if (!this.usuarioDestinoId || this.perfilBloqueado) return;

    const nuevaRoomId = this.getRoomId(this.usuarioActualId, this.usuarioDestinoId);

    if (this.currentRoomId !== nuevaRoomId) {
      if (this.currentRoomId) {
        this.websocketService.disconnect();
      }
      this.currentRoomId = nuevaRoomId;
      this.websocketService.connect();
    }

    this.cargarMensajes();
    this.cargarInformacionUsuarioDestino();
  }

  private cargarInformacionUsuarioDestino(): void {
    const usuarioDestinoId = this.usuarioDestinoId;

    if (!usuarioDestinoId || this.isFetchingProfile) return;

    this.isFetchingProfile = true;
    this.nombreUsuarioDestino = '';
    this.fotoUsuarioDestino = '';

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

        this.agregarConversacionSiNecesario();
        this.isFetchingProfile = false;
      },
      error: (err) => {
        console.error('Error loading user profile:', err);
        this.nombreUsuarioDestino = '';
        this.fotoUsuarioDestino = 'assets/frutero.png';
        this.agregarConversacionSiNecesario();
        this.isFetchingProfile = false;
      }
    });
  }

  private getRoomId(user1Id: number, user2Id: number): string {
    return [user1Id, user2Id].sort().join('_');
  }

  onScroll(event: Event): void {
    if (this.perfilBloqueado) return;

    const element = event.target as HTMLElement;
    const atTop = element.scrollTop === 0;

    if (atTop && !this.loadingMore && !this.allMessagesLoaded) {
      this.cargarMensajes(true);
    }
  }

  checkLoadMore(): void {
    if (!this.scrollContainer || this.perfilBloqueado) return;

    const element = this.scrollContainer.nativeElement;
    const nearTop = element.scrollTop < 100;

    if (nearTop && !this.loadingMore && !this.allMessagesLoaded) {
      this.cargarMensajes(true);
    }
  }

  private scrollToBottom(): void {
    if (this.scrollContainer && !this.perfilBloqueado) {
      this.cdr.detectChanges();
      setTimeout(() => {
        const container = this.scrollContainer.nativeElement;
        if (!this.loadingMore) {
          container.scrollTop = container.scrollHeight;
        }
      }, 0);
    }
  }

  cargarMensajes(loadMore: boolean = false): void {
    if (!this.usuarioDestinoId || this.perfilBloqueado) return;

    if (loadMore) {
      if (this.allMessagesLoaded || this.loadingMore) return;
      this.currentPage++;
      this.loadingMore = true;
    } else {
      this.currentPage = 0;
      this.allMessagesLoaded = false;
    }

    this.chatService.getMensajes(
      this.usuarioActualId,
      this.usuarioDestinoId,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (mensajes) => {
        if (loadMore) {
          const prevHeight = this.scrollContainer.nativeElement.scrollHeight;
          this.mensajes = [...mensajes.reverse(), ...this.mensajes];

          this.cdr.detectChanges();
          setTimeout(() => {
            this.scrollContainer.nativeElement.scrollTop =
              this.scrollContainer.nativeElement.scrollHeight - prevHeight;
          }, 0);
        } else {
          this.mensajes = mensajes.reverse();
          this.scrollToBottom();
        }

        if (mensajes.length < this.pageSize) {
          this.allMessagesLoaded = true;
        }

        this.loading = false;
        this.loadingMore = false;
        this.marcarMensajesComoLeidos();
      },
      error: (err) => {
        this.loading = false;
        this.loadingMore = false;
        console.error('Error al cargar mensajes:', err);
        this.error = 'Error al cargar los mensajes';
      }
    });
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
    if (!this.nuevoMensaje.trim() || !this.usuarioDestinoId || this.perfilBloqueado) return;

    this.usuarioService.getPerfil().subscribe({
      next: (perfil) => {
        const mensaje: ChatDTO = {
          texto: this.nuevoMensaje,
          remitenteId: this.usuarioActualId,
          destinatarioId: this.usuarioDestinoId!,
          fecha: new Date(),
          leido: false,
          borrado: false,
          remitenteNombre: perfil.nombre || 'Usuario',
          remitenteFoto: perfil.fotoPerfil || 'assets/frutero.png'
        };

        this.chatService.enviarMensaje(mensaje).subscribe({
          next: (mensajeGuardado) => {
            this.mensajes.push(mensajeGuardado);
            this.nuevoMensaje = '';
            this.scrollToBottom();
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
    if (!this.usuarioDestinoId || this.perfilBloqueado) return;

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

  tieneMensajesNoLeidos(): boolean {
    return this.conversaciones.some(conversacion => conversacion.noLeidos);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.websocketService.disconnect();
  }

  borrarMensaje(mensaje: ChatDTO): void {
    if (mensaje.remitenteId !== this.usuarioActualId || this.perfilBloqueado) return;

    this.chatService.marcarComoBorrado(mensaje.id!, this.usuarioActualId).subscribe({
      next: (mensajeActualizado) => {
        const index = this.mensajes.findIndex(m => m.id === mensaje.id);
        if (index !== -1) {
          this.mensajes[index] = mensajeActualizado;
        }
      },
      error: (err) => console.error('Error al borrar mensaje:', err)
    });
  }

  getMensajeTexto(mensaje: ChatDTO): string {
    if (mensaje.borrado) {
      return mensaje.remitenteId === this.usuarioActualId
        ? '✖ Eliminaste este mensaje'
        : '✖ Este mensaje ha sido eliminado';
    }
    return mensaje.texto;
  }

  irAlPerfil(usuarioId: number): void {
    const idEncrypt = this.encryptService.encriptar(usuarioId.toString()); // Encripta el ID del usuario
    this.router.navigate(['/perfil', idEncrypt]); // Redirige al perfil con el ID encriptado
  }

}
