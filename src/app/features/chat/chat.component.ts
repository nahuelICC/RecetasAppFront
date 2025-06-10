import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
  NgZone,
} from "@angular/core"
import  { ChatService } from "./chat.service"
import  { AuthService } from "../../core/services/auth.service"
import  { UsuarioService } from "../usuario/services/usuario.service"
import {  Subscription, of, forkJoin } from "rxjs"
import { switchMap, map, catchError } from "rxjs/operators"
import  { ChatDTO, ConversacionDTO } from "./models/chat.dto"
import  { ActivatedRoute, Router } from "@angular/router"
import  { WebsocketService } from "../../core/services/websocket.service"
import  { EncryptService } from "../../core/services/encrypt.service"
import { IonIcon } from "@ionic/angular/standalone"
import { DatePipe, NgClass, NgForOf, NgIf, NgStyle } from "@angular/common"
import { FormsModule } from "@angular/forms"
import  { Platform } from "@ionic/angular"
import  { AudioService } from "../../core/services/audio.service"
import { PreviewRecetaComponent } from "../receta-view/components/preview-receta/preview-receta.component"

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  imports: [IonIcon, DatePipe, NgForOf, NgIf, FormsModule, NgClass, NgStyle, PreviewRecetaComponent],
  styleUrls: ["./chat.component.css"],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
  conversaciones: ConversacionDTO[] = []
  mensajes: ChatDTO[] = []
  mensajeSeleccionado: ChatDTO | null = null
  nuevoMensaje = ""
  usuarioActualId: number
  usuarioDestinoId: number | null = null
  nombreUsuarioDestino = ""
  fotoUsuarioDestino = ""
  loading = true
  error = ""
  isMobile = false
  currentPage = 0
  pageSize = 10
  loadingMore = false
  allMessagesLoaded = false
  private shouldScrollToBottom = false
  private mutationObserver: MutationObserver | null = null
  private usuariosBloqueados: Set<number> = new Set<number>()
  private subscriptions: Subscription[] = []
  private currentRoomId: string | null = null
  private isFetchingProfile = false
  @ViewChild("scrollContainer") scrollContainer!: ElementRef
  buscando = false
  terminoBusqueda = ""
  usuariosSeguidos: any[] = []
  mostrarResultadosBusqueda = false
  perfilBloqueado = false
  private scrollTimeout: any;
  private resizeObserver: ResizeObserver | null = null;

  // Nuevas propiedades para emojis
  showEmojiPicker = false
  emojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
    "🥳",
    "😏",
    "😒",
    "😞",
    "😔",
    "😟",
    "😕",
    "🙁",
    "☹️",
    "😣",
    "😖",
    "😫",
    "😩",
    "🥺",
    "😢",
    "😭",
    "😤",
    "😠",
    "😡",
    "🤬",
    "🤯",
    "😳",
    "🥵",
    "🥶",
    "😱",
    "😨",
    "😰",
    "😥",
    "😓",
    "🤗",
    "🤔",
    "🤭",
    "🤫",
    "🤥",
    "😶",
    "😐",
    "😑",
    "😬",
    "🙄",
    "😯",
    "😦",
    "😧",
    "😮",
    "😲",
    "🥱",
    "😴",
    "🤤",
    "😪",
    "😵",
    "🤐",
    "🥴",
    "🤢",
    "🤮",
    "🤧",
    "😷",
    "🤒",
    "🤕",
    "🤑",
    "🤠",
    "👍",
    "👎",
    "👏",
    "🙌",
    "👋",
    "❤️",
    "💔",
    "💯",
    "✅",
    "❌",
  ]

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
    private zone: NgZone,
    private platform: Platform,
  ) {
    this.usuarioActualId = this.authService.getUserId() || 0
    this.checkMobile()
    this.platform.resize.subscribe(() => this.checkMobile())
  }

  // FUNCIONES TRACKBY PARA OPTIMIZACIÓN
  trackByConversacion(index: number, conversacion: ConversacionDTO): number {
    return conversacion.otroUsuarioId
  }

  trackByMensaje(index: number, mensaje: ChatDTO): number {
    return mensaje.id || index
  }

  /**
   * Método que se ejecuta al inicializar el componente
   */
  ngOnInit(): void {
    this.initConversaciones()
    this.initRouteListening()
    this.websocketService.connect()
    this.initWebSocket()
    this.cargarUsuariosSeguidos()
  }

  /**
   * Método que se ejecuta después de que la vista se haya inicializado
   */
  ngAfterViewInit(): void {
    this.setupMutationObserver()
  }

  /**
   * Metodo que configura un MutationObserver para detectar cambios en el contenedor de scroll
   * @private
   */
  private setupMutationObserver(): void {
    if (!this.scrollContainer) return;

    this.zone.runOutsideAngular(() => {
      // MutationObserver para cambios en el DOM
      this.mutationObserver = new MutationObserver((mutations) => {
        let shouldScroll = false;

        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            shouldScroll = true;
          }
        });

        if (shouldScroll) {
          // Delay más largo para componentes que cargan contenido dinámico
          this.scrollToBottom(false, 100);
        }
      });

      this.mutationObserver.observe(this.scrollContainer.nativeElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });

      // ResizeObserver para detectar cambios de tamaño (como cuando se carga preview-receta)
      this.resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          // Solo hacer scroll si el contenido creció
          if (entry.contentRect.height > 0) {
            this.scrollToBottom(false, 50);
          }
        }
      });

      this.resizeObserver.observe(this.scrollContainer.nativeElement);
    });
  }

  /**
   * Método que verifica si el dispositivo es móvil
   * @private
   */
  private checkMobile(): void {
    this.isMobile = this.platform.width() < 768
  }

  /**
   * Método que carga los usuarios seguidos del usuario actual
   * @private
   */
  private cargarUsuariosSeguidos(): void {
    this.usuarioService.listaSeguidos(true).subscribe({
      next: (seguidos) => {
        this.usuariosSeguidos = seguidos
      },
      error: (err) => {
        console.error("Error al cargar usuarios seguidos:", err)
      },
    })
  }

  /**
   * Método que inicializa las conversaciones del usuario actual
   * @private
   */
  private initConversaciones(): void {
    this.loading = true
    this.subscriptions.push(
      this.chatService.conversaciones$
        .pipe(
          switchMap((conversaciones) => {
            // Solo verificar bloqueo para conversaciones nuevas
            const conversacionesExistentes = new Set(this.conversaciones.map((c) => c.otroUsuarioId))
            const conversacionesNuevas = conversaciones.filter(
              (conv) => !conversacionesExistentes.has(conv.otroUsuarioId),
            )

            if (conversacionesNuevas.length === 0) {
              return of(
                conversaciones.map((conv) => ({ ...conv, bloqueado: this.usuariosBloqueados.has(conv.otroUsuarioId) })),
              )
            }

            const verificaciones = conversacionesNuevas.map((conv) =>
              this.usuarioService.perfilBloqueado(conv.otroUsuarioId.toString()).pipe(
                map((bloqueado) => ({ ...conv, bloqueado })),
                catchError(() => of({ ...conv, bloqueado: false })),
              ),
            )

            return forkJoin(verificaciones).pipe(
              map((nuevasConversaciones) => {
                // Combinar conversaciones existentes con las nuevas verificadas
                const todasLasConversaciones = conversaciones.map((conv) => {
                  const nuevaConv = nuevasConversaciones.find((nc) => nc.otroUsuarioId === conv.otroUsuarioId)
                  return nuevaConv || { ...conv, bloqueado: this.usuariosBloqueados.has(conv.otroUsuarioId) }
                })
                return todasLasConversaciones
              }),
            )
          }),
        )
        .subscribe({
          next: (conversacionesConEstado) => {
            // Filtrar conversaciones bloqueadas y actualizar conjunto
            this.conversaciones = conversacionesConEstado.filter((conv) => !conv.bloqueado)
            conversacionesConEstado
              .filter((conv) => conv.bloqueado)
              .forEach((conv) => this.usuariosBloqueados.add(conv.otroUsuarioId))

            if (this.usuarioDestinoId && !this.conversaciones.some((c) => c.otroUsuarioId === this.usuarioDestinoId)) {
              this.agregarConversacionSiNecesario()
            }
            this.loading = false
          },
          error: (err) => {
            console.error("Error al cargar conversaciones:", err)
            this.error = "Error al cargar las conversaciones"
            this.loading = false
          },
        }),
    )
    this.chatService.refreshConversaciones()
  }

  /**
   * MÉTODO OPTIMIZADO: Actualiza solo una conversación específica
   * @private
   */
  private actualizarConversacionEspecifica(usuarioId: number, ultimoMensaje: string, fecha: Date): void {
    const index = this.conversaciones.findIndex((c) => c.otroUsuarioId === usuarioId)
    if (index !== -1) {
      // Actualizar solo la conversación específica
      this.conversaciones[index] = {
        ...this.conversaciones[index],
        ultimoMensaje,
        fechaUltimoMensaje: fecha,
        noLeidos: usuarioId !== this.usuarioDestinoId, // Solo marcar como no leído si no es la conversación actual
      }

      // Mover la conversación al principio si no es la actual
      if (index !== 0) {
        const conversacionActualizada = this.conversaciones.splice(index, 1)[0]
        this.conversaciones.unshift(conversacionActualizada)
      }

      this.cdr.detectChanges()
    } else {
      // Solo refrescar si la conversación no existe
      this.chatService.refreshConversaciones()
    }
  }

  /**
   * Método que agrega una nueva conversación si no existe con el usuario destino
   * @private
   */
  private agregarConversacionSiNecesario(): void {
    if (!this.usuarioDestinoId || this.conversaciones.some((c) => c.otroUsuarioId === this.usuarioDestinoId)) {
      return
    }

    const nuevaConversacion: ConversacionDTO = {
      otroUsuarioId: this.usuarioDestinoId,
      otroUsuarioNombre: this.nombreUsuarioDestino,
      otroUsuarioFoto: this.fotoUsuarioDestino,
      ultimoMensaje: "",
      fechaUltimoMensaje: new Date(),
      noLeidos: false,
    }

    this.conversaciones = [nuevaConversacion, ...this.conversaciones]
  }

  /**
   * Método que inicializa la escucha de cambios en la ruta
   * @private
   */
  private initRouteListening(): void {
    this.subscriptions.push(
      this.route.params.subscribe({
        next: (params) => {
          if (params["id"]) {
            const decryptedId = this.encryptService.desencriptar(params["id"])
            const nuevoDestinoId = +decryptedId

            if (this.usuarioDestinoId !== nuevoDestinoId) {
              this.usuarioDestinoId = nuevoDestinoId
              this.verificarBloqueo()
            }
          } else {
            this.usuarioDestinoId = null
            this.mensajes = []
            this.nombreUsuarioDestino = ""
            this.fotoUsuarioDestino = ""
            this.perfilBloqueado = false
          }
        },
        error: (err) => {
          console.error("Error en parámetros de ruta:", err)
          this.error = "Error al cargar la conversación"
        },
      }),
    )
  }

  /**
   * Método que verifica si el perfil del usuario destino está bloqueado
   * @private
   */
  private verificarBloqueo(): void {
    if (!this.usuarioDestinoId) return

    this.usuarioService.perfilBloqueado(this.usuarioDestinoId.toString()).subscribe({
      next: (response) => {
        const estaBloqueado = response as boolean
        this.perfilBloqueado = estaBloqueado

        if (estaBloqueado) {
          // Añadir a usuarios bloqueados
          this.usuariosBloqueados.add(this.usuarioDestinoId!)

          // Limpiar mensajes y desconectar
          this.mensajes = []
          this.websocketService.disconnect()
          this.currentRoomId = null

          // Forzar actualización de conversaciones
          this.chatService.refreshConversaciones()
        } else {
          this.handleNewConversation()
        }
      },
      error: (err) => {
        console.error("Error al verificar bloqueo:", err)
        this.perfilBloqueado = false
        this.handleNewConversation()
      },
    })
  }

  /**
   * Método que inicializa el WebSocket para recibir mensajes - OPTIMIZADO
   * @private
   */
  private initWebSocket(): void {
    this.subscriptions.push(
      this.websocketService.getMessages().subscribe({
        next: (msg) => {
          if (!msg) return;

          if (this.usuariosBloqueados.has(msg.remitenteId)) {
            return;
          }

          if (msg.borrado) {
            const index = this.mensajes.findIndex((m) => m.id === msg.id);
            if (index !== -1) {
              this.mensajes[index] = msg;
              this.cdr.detectChanges();
              return;
            }
          }

          if (!this.perfilBloqueado) {
            this.audioService.reproducir("mensaje");

            const otroUsuarioId = msg.remitenteId === this.usuarioActualId ? msg.destinatarioId : msg.remitenteId;
            this.actualizarConversacionEspecifica(otroUsuarioId, msg.texto, msg.fecha);

            if (
              (msg.remitenteId === this.usuarioDestinoId && msg.destinatarioId === this.usuarioActualId) ||
              (msg.remitenteId === this.usuarioActualId && msg.destinatarioId === this.usuarioDestinoId)
            ) {
              this.mensajes.push(msg);
              this.shouldScrollToBottom = true;

              // Detección de cambios y scroll con delay para contenido dinámico
              this.cdr.detectChanges();
              this.scrollToBottom(true, 150);
              this.marcarMensajesComoLeidos();
            }
          }
        },
        error: (err) => console.error("Error en mensajes WebSocket:", err),
      }),
    );
  }

  /**
   * Maneja la nueva conversación cuando se selecciona un usuario destino
   * @private
   */
  private handleNewConversation(): void {
    if (!this.usuarioDestinoId || this.perfilBloqueado) return

    const nuevaRoomId = this.getRoomId(this.usuarioActualId, this.usuarioDestinoId)

    if (this.currentRoomId !== nuevaRoomId) {
      if (this.currentRoomId) {
        this.websocketService.disconnect()
      }
      this.currentRoomId = nuevaRoomId
      this.websocketService.connect()
    }

    this.cargarMensajes()
    this.cargarInformacionUsuarioDestino()
  }

  /**
   * Carga la información del usuario destino, incluyendo nombre y foto de perfil
   * @private
   */
  private cargarInformacionUsuarioDestino(): void {
    const usuarioDestinoId = this.usuarioDestinoId

    if (!usuarioDestinoId || this.isFetchingProfile) return

    this.isFetchingProfile = true
    this.nombreUsuarioDestino = ""
    this.fotoUsuarioDestino = ""

    this.usuarioService.getPerfilId(usuarioDestinoId.toString()).subscribe({
      next: (perfil) => {
        this.nombreUsuarioDestino = perfil?.nombre || "Usuario"

        if (perfil?.fotoPerfil) {
          this.fotoUsuarioDestino = perfil.fotoPerfil
        } else {
          this.usuarioService.fotoPerfilVisita(usuarioDestinoId.toString()).subscribe({
            next: (foto) => {
              this.fotoUsuarioDestino = foto || "assets/frutero.png"
            },
            error: (err) => {
              console.error("Error loading profile picture:", err)
              this.fotoUsuarioDestino = "assets/frutero.png"
            },
          })
        }

        this.agregarConversacionSiNecesario()
        this.isFetchingProfile = false
      },
      error: (err) => {
        console.error("Error loading user profile:", err)
        this.nombreUsuarioDestino = ""
        this.fotoUsuarioDestino = "assets/frutero.png"
        this.agregarConversacionSiNecesario()
        this.isFetchingProfile = false
      },
    })
  }

  /**
   * Genera un ID de sala único basado en los IDs de los usuarios
   * @param user1Id
   * @param user2Id
   * @private
   */
  private getRoomId(user1Id: number, user2Id: number): string {
    return [user1Id, user2Id].sort().join("_")
  }

  /**
   * Determina si se debe ocultar el avatar basado en el agrupamiento de mensajes
   */
  shouldHideAvatar(index: number): boolean {
    if (index === 0) return false

    const currentMessage = this.mensajes[index]
    const previousMessage = this.mensajes[index - 1]

    // No ocultar avatar si hay separador de fecha
    if (this.shouldShowDateSeparator(index)) {
      return false
    }

    // Ocultar avatar si es del mismo remitente y debe agruparse
    if (currentMessage.remitenteId === previousMessage.remitenteId) {
      const timeDiff = new Date(currentMessage.fecha).getTime() - new Date(previousMessage.fecha).getTime()
      return timeDiff < 1 * 60 * 1000 // 1 minuto
    }

    return false
  }

  /**
   * Determina si los mensajes deben agruparse visualmente
   */
  shouldGroupMessage(index: number): boolean {
    if (index === 0) return false

    const currentMessage = this.mensajes[index]
    const previousMessage = this.mensajes[index - 1]

    // No agrupar si son de diferentes remitentes
    if (currentMessage.remitenteId !== previousMessage.remitenteId) {
      return false
    }

    // No agrupar si hay separador de fecha entre ellos
    if (this.shouldShowDateSeparator(index)) {
      return false
    }

    // Agrupar solo si la diferencia de tiempo es menor a 1 minuto
    const timeDiff = new Date(currentMessage.fecha).getTime() - new Date(previousMessage.fecha).getTime()
    return timeDiff < 1 * 60 * 1000 // 1 minuto
  }

  /**
   * Determina si se debe mostrar un separador de fecha
   */
  shouldShowDateSeparator(index: number): boolean {
    if (index === 0) return true

    const currentMessage = this.mensajes[index]
    const previousMessage = this.mensajes[index - 1]

    const currentDate = new Date(currentMessage.fecha).toDateString()
    const previousDate = new Date(previousMessage.fecha).toDateString()

    return currentDate !== previousDate
  }

  /**
   * Obtiene el texto del separador de fecha
   */
  getDateSeparatorText(fecha: Date): string {
    const messageDate = new Date(fecha)
    const today = new Date()

    // Si es hoy
    if (messageDate.toDateString() === today.toDateString()) {
      return "Hoy"
    }

    // Si es ayer
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Ayer"
    }

    // Si es esta semana
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    if (messageDate >= startOfWeek) {
      return messageDate.toLocaleDateString("es-ES", { weekday: "long" })
    }

    // Fecha completa
    return messageDate.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: messageDate.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    })
  }

  /**
   *  Maneja el evento de scroll en el contenedor de mensajes
   * @param event
   */
  onScroll(event: Event): void {
    if (this.perfilBloqueado) return

    const element = event.target as HTMLElement
    const atTop = element.scrollTop === 0

    if (atTop && !this.loadingMore && !this.allMessagesLoaded) {
      this.cargarMensajes(true)
    }
  }

  checkLoadMore(): void {
    if (!this.scrollContainer || this.perfilBloqueado) return

    const element = this.scrollContainer.nativeElement
    const nearTop = element.scrollTop < 100

    if (nearTop && !this.loadingMore && !this.allMessagesLoaded) {
      this.cargarMensajes(true)
    }
  }

  /**
   * Método optimizado para scroll al final - VERSIÓN MEJORADA
   */
  scrollToBottom(force = false, delay = 0): void {
    if (!this.scrollContainer?.nativeElement) return;

    // Limpiar timeout anterior si existe
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.zone.runOutsideAngular(() => {
      this.scrollTimeout = setTimeout(() => {
        try {
          const element = this.scrollContainer.nativeElement;
          const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 150;

          if (force || isNearBottom || this.shouldScrollToBottom) {
            // Usar scrollTo con behavior smooth para mejor UX
            element.scrollTo({
              top: element.scrollHeight,
              behavior: force ? 'auto' : 'smooth'
            });
            this.shouldScrollToBottom = false;
          }
        } catch (err) {
          console.error("Error al hacer scroll:", err);
        }
      }, delay);
    });
  }

  /**
   * Carga los mensajes del chat entre el usuario actual y el usuario destino.
   * @param loadMore
   */
  cargarMensajes(loadMore = false): void {
    if (!this.usuarioDestinoId || this.perfilBloqueado) return;

    if (loadMore) {
      if (this.allMessagesLoaded || this.loadingMore) return;
      this.currentPage++;
      this.loadingMore = true;
    } else {
      this.currentPage = 0;
      this.allMessagesLoaded = false;
      this.shouldScrollToBottom = true;
    }

    this.chatService
      .getMensajes(this.usuarioActualId, this.usuarioDestinoId, this.currentPage, this.pageSize)
      .subscribe({
        next: (mensajes) => {
          if (loadMore) {
            const prevScrollHeight = this.scrollContainer.nativeElement.scrollHeight;
            const prevScrollTop = this.scrollContainer.nativeElement.scrollTop;

            this.mensajes = [...mensajes.reverse(), ...this.mensajes];

            // Usar requestAnimationFrame para mejor sincronización
            requestAnimationFrame(() => {
              this.cdr.detectChanges();
              requestAnimationFrame(() => {
                const newScrollHeight = this.scrollContainer.nativeElement.scrollHeight;
                this.scrollContainer.nativeElement.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);
              });
            });
          } else {
            this.mensajes = mensajes.reverse();

            // Para mensajes nuevos, asegurar scroll al final con delay
            requestAnimationFrame(() => {
              this.cdr.detectChanges();
              // Delay adicional para componentes que cargan contenido dinámico
              this.scrollToBottom(true, 200);
            });
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
          console.error("Error al cargar mensajes:", err);
          this.error = "Error al cargar los mensajes";
        },
      });
  }

  /**
   * Selecciona una conversación para chatear con un usuario específico.
   * @param usuarioId
   */
  seleccionarConversacion(usuarioId: number): void {
    if (usuarioId === this.usuarioActualId) {
      this.error = "No puedes chatear contigo mismo";
      return;
    }

    if (this.usuarioDestinoId === usuarioId) {
      return;
    }

    const encryptedId = this.encryptService.encriptar(usuarioId.toString());
    this.router.navigate(["/chat", encryptedId]).then(() => {
      // Asegurar scroll al final después de navegar
      setTimeout(() => {
        this.scrollToBottom(true, 300);
      }, 500);
    });
  }

  /**
   * Envía un mensaje al usuario destino - OPTIMIZADO
   */
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
          remitenteNombre: perfil.nombre || "Usuario",
          remitenteFoto: perfil.fotoPerfil || "assets/frutero.png",
        };

        this.chatService.enviarMensaje(mensaje).subscribe({
          next: (mensajeGuardado) => {
            this.mensajes.push(mensajeGuardado);
            this.nuevoMensaje = "";
            this.shouldScrollToBottom = true;

            // Forzar detección de cambios y scroll inmediato
            this.cdr.detectChanges();
            this.scrollToBottom(true, 100);

            this.actualizarConversacionEspecifica(this.usuarioDestinoId!, mensajeGuardado.texto, mensajeGuardado.fecha);
          },
          error: (err) => {
            console.error("Error al enviar mensaje:", err);
            this.error = "Error al enviar el mensaje";
          },
        });
      },
      error: (err) => {
        console.error("Error al obtener perfil:", err);
        this.error = "Error al cargar datos del usuario";
      },
    });
  }

  /**
   * Marca los mensajes del usuario destino como leídos.
   */
  marcarMensajesComoLeidos(): void {
    if (!this.usuarioDestinoId || this.perfilBloqueado) return

    this.subscriptions.push(
      this.chatService.marcarComoLeido(this.usuarioDestinoId, this.usuarioActualId).subscribe({
        error: (err: any) => console.error("Error al marcar como leído:", err),
      }),
    )
  }

  /**
   * Obtiene el nombre del usuario destino para mostrar en la conversación.
   * @param usuarioId
   */
  getNombreUsuario(usuarioId: number | null): string {
    if (!usuarioId) return "Chat"
    const conversacion = this.conversaciones.find((c) => c.otroUsuarioId === usuarioId)
    return conversacion?.otroUsuarioNombre || this.nombreUsuarioDestino || "Usuario desconocido"
  }

  /**
   * Obtiene la foto del usuario destino para mostrar en la conversación.
   * @param usuarioId
   */
  getFotoUsuario(usuarioId: number | null): string {
    if (!usuarioId) return "assets/frutero.png"
    const conversacion = this.conversaciones.find((c) => c.otroUsuarioId === usuarioId)
    return conversacion?.otroUsuarioFoto || this.fotoUsuarioDestino || "assets/frutero.png"
  }

  tieneMensajesNoLeidos(): boolean {
    return this.conversaciones.some((conversacion) => conversacion.noLeidos)
  }

  /**
   * Muestra u oculta el selector de emojis
   */
  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker
  }

  /**
   * Añade un emoji al mensaje actual
   * @param emoji El emoji a añadir
   */
  addEmoji(emoji: string): void {
    this.nuevoMensaje += emoji
    this.showEmojiPicker = false // Opcional: cerrar el picker después de seleccionar
  }

  /**
   * Cleanup mejorado
   */
  ngOnDestroy(): void {
    // Limpiar timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Limpiar observers
    this.mutationObserver?.disconnect();
    this.resizeObserver?.disconnect();

    // Limpiar suscripciones
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.websocketService.disconnect();
  }

  /**
   * Borra un mensaje del chat.
   * @param mensaje
   */
  borrarMensaje(mensaje: ChatDTO): void {
    if (mensaje.remitenteId !== this.usuarioActualId || this.perfilBloqueado) return

    this.chatService.marcarComoBorrado(mensaje.id!, this.usuarioActualId).subscribe({
      next: (mensajeActualizado) => {
        const index = this.mensajes.findIndex((m) => m.id === mensaje.id)
        if (index !== -1) {
          this.mensajes[index] = mensajeActualizado
        }
      },
      error: (err) => console.error("Error al borrar mensaje:", err),
    })
  }

  /**
   * Obtiene el texto del mensaje, considerando si está borrado o no.
   * @param mensaje
   */
  getMensajeTexto(mensaje: ChatDTO): string {
    if (mensaje.borrado) {
      return mensaje.remitenteId === this.usuarioActualId
        ? "✖ Eliminaste este mensaje"
        : "✖ Este mensaje ha sido eliminado"
    }
    return mensaje.texto
  }

  /**
   * Navega al perfil del usuario destino.
   * @param usuarioId
   */
  irAlPerfil(usuarioId: number): void {
    const idEncrypt = this.encryptService.encriptar(usuarioId.toString()) // Encripta el ID del usuario
    this.router.navigate(["/perfil", idEncrypt]) // Redirige al perfil con el ID encriptado
  }

  /**
   * Verifica si el texto es un enlace a una receta.
   * @param texto
   */
  esLinkDeReceta(texto: string): boolean {
    return /\/receta\/[a-zA-Z0-9\-_]+/.test(texto)
  }

  /**
   * Obtiene el ID de la receta encriptado desde un texto.
   * @param texto
   */
  getIdRecetaEncriptado(texto: string): string | null {
    const match = texto.match(/\/receta\/([a-zA-Z0-9\-_]+)/)
    return match ? match[1] : null
  }

  /**
   * Obtiene la fecha de la conversación actual
   */
  getFechaConversacion(): string {
    if (this.mensajes.length === 0) return ""

    const ultimoMensaje = this.mensajes[this.mensajes.length - 1]
    const fecha = new Date(ultimoMensaje.fecha)
    const hoy = new Date()

    // Si es hoy
    if (fecha.toDateString() === hoy.toDateString()) {
      return "Hoy"
    }

    // Si es ayer
    const ayer = new Date(hoy)
    ayer.setDate(hoy.getDate() - 1)
    if (fecha.toDateString() === ayer.toDateString()) {
      return "Ayer"
    }

    // Si es esta semana
    const inicioSemana = new Date(hoy)
    inicioSemana.setDate(hoy.getDate() - hoy.getDay())
    if (fecha >= inicioSemana) {
      return fecha.toLocaleDateString("es-ES", { weekday: "long" })
    }

    // Fecha completa
    return fecha.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: fecha.getFullYear() !== hoy.getFullYear() ? "numeric" : undefined,
    })
  }
}
