import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import {  Observable, throwError, of, BehaviorSubject } from "rxjs"
import { catchError, tap, finalize, delay } from "rxjs/operators"
import { AuthService } from "../../core/services/auth.service"
import { WebsocketService } from "../../core/services/websocket.service"
import { ChatDTO, ConversacionDTO } from "./models/chat.dto"

/**
 * Servicio para manejar la lógica del chat, incluyendo la obtención de conversaciones,
 */
@Injectable({
  providedIn: "root",
})
export class ChatService {
  private apiUrl: string
  private conversacionesSubject = new BehaviorSubject<ConversacionDTO[]>([])
  private loadingSubject = new BehaviorSubject<boolean>(true)
  private initialLoadComplete = false
  private dataLoadedSubject = new BehaviorSubject<boolean>(false)

  conversaciones$ = this.conversacionesSubject.asObservable()
  loading$ = this.loadingSubject.asObservable()
  dataLoaded$ = this.dataLoadedSubject.asObservable()

  constructor(
    private websocketService: WebsocketService,
    private authService: AuthService,
    private http: HttpClient,
  ) {
    // Configurar URL base según el entorno
    const isProduction = window.location.hostname !== "localhost"
    this.apiUrl = isProduction ? "https://cookersback.onrender.com/chat" : "/api/chat"

    console.log("API URL configurada:", this.apiUrl)

    // Delay inicial más corto para no bloquear la carga
    setTimeout(() => {
      this.loadConversaciones()
    }, 100)
  }

  /**
   * Endpoint que carga las conversaciones del usuario desde el servidor y las almacena en un BehaviorSubject.
   * @private
   */
  private loadConversaciones(): void {
    const userId = this.authService.getUserId()
    if (!userId) {
      this.conversacionesSubject.next([])
      this.loadingSubject.next(false)
      this.initialLoadComplete = true
      setTimeout(() => {
        this.dataLoadedSubject.next(true)
      }, 500)
      return
    }

    if (!this.initialLoadComplete) {
      this.loadingSubject.next(true)
    }

    const url = `${this.apiUrl}/conversaciones?usuarioId=${userId}`
    console.log("Cargando conversaciones desde:", url)

    this.http
      .get<ConversacionDTO[]>(url, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .pipe(
        delay(this.initialLoadComplete ? 0 : 200),
        catchError((error) => {
          console.error("Error al obtener conversaciones:", error)
          console.error("URL que falló:", url)
          console.error("Status:", error.status)
          console.error("Response text:", error.error?.text || "No response text")
          return of([])
        }),
        finalize(() => {
          this.loadingSubject.next(false)
          this.initialLoadComplete = true
          const delayTime = this.conversacionesSubject.value.length > 0 ? 200 : 1000
          setTimeout(() => {
            this.dataLoadedSubject.next(true)
          }, delayTime)
        }),
      )
      .subscribe((conversaciones) => {
        this.conversacionesSubject.next(conversaciones || [])
        console.log("Conversaciones cargadas:", conversaciones?.length || 0)
      })
  }

  /**
   * Endpoint que obtiene los mensajes entre dos usuarios.
   */
  getMensajes(remitenteId: number, destinatarioId: number, page = 0, size = 10): Observable<ChatDTO[]> {
    if (remitenteId === destinatarioId) {
      return throwError(() => new Error("Los IDs no pueden ser iguales"))
    }

    const url = `${this.apiUrl}/mensajes?remitenteId=${remitenteId}&destinatarioId=${destinatarioId}&page=${page}&size=${size}`

    return this.http
      .get<ChatDTO[]>(url, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .pipe(
        catchError((error) => {
          console.error("Error al obtener mensajes:", error)
          console.error("URL que falló:", url)
          return of([])
        }),
      )
  }

  /**
   * Endpoint que envía un mensaje al servidor y actualiza las conversaciones.
   */
  enviarMensaje(mensaje: ChatDTO): Observable<ChatDTO> {
    const url = `${this.apiUrl}/enviar`

    return this.http
      .post<ChatDTO>(url, mensaje, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .pipe(
        tap(() => {
          if (this.initialLoadComplete) {
            this.loadConversaciones()
          }
        }),
        catchError((error) => {
          console.error("Error al enviar mensaje:", error)
          console.error("URL que falló:", url)
          return throwError(() => error)
        }),
      )
  }

  /**
   * Endpoint que marca un mensaje como leído entre dos usuarios.
   */
  marcarComoLeido(remitenteId: number, destinatarioId: number): Observable<void> {
    const url = `${this.apiUrl}/marcar-leido?remitenteId=${remitenteId}&destinatarioId=${destinatarioId}`

    return this.http
      .put<void>(
        url,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      )
      .pipe(
        tap(() => {
          if (this.initialLoadComplete) {
            this.loadConversaciones()
          }
        }),
        catchError((error) => {
          console.error("Error al marcar como leído:", error)
          console.error("URL que falló:", url)
          return of()
        }),
      )
  }

  getMessagesObservable(): Observable<ChatDTO | null> {
    return this.websocketService.getMessages()
  }

  /**
   * Endpoint que refresca las conversaciones del usuario.
   */
  refreshConversaciones(): void {
    this.loadConversaciones()
  }

  /**
   * Endpoint que marca un mensaje como borrado para un usuario específico.
   */
  marcarComoBorrado(mensajeId: number, usuarioId: number): Observable<ChatDTO> {
    const url = `${this.apiUrl}/borrar/${mensajeId}?usuarioId=${usuarioId}`

    return this.http
      .put<ChatDTO>(
        url,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      )
      .pipe(
        tap(() => this.refreshConversaciones()),
        catchError((error) => {
          console.error("Error al borrar mensaje:", error)
          console.error("URL que falló:", url)
          return throwError(() => error)
        }),
      )
  }

  private usuariosBloqueados: Set<number> = new Set<number>()

  getUsuariosBloqueados(): Set<number> {
    return this.usuariosBloqueados
  }

  isLoading(): Observable<boolean> {
    return this.loading$
  }

  isInitialLoadComplete(): boolean {
    return this.initialLoadComplete
  }

  isDataLoaded(): Observable<boolean> {
    return this.dataLoaded$
  }
}
