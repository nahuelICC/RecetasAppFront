import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import {  Observable, throwError, of, BehaviorSubject } from "rxjs"
import { catchError, tap, finalize, delay } from "rxjs/operators"
import  { AuthService } from "../../core/services/auth.service"
import  { WebsocketService } from "../../core/services/websocket.service"
import  { ChatDTO, ConversacionDTO } from "./models/chat.dto"

/**
 * Servicio para manejar la lógica del chat, incluyendo la obtención de conversaciones,
 */
@Injectable({
  providedIn: "root",
})
export class ChatService {
  private apiUrl = "/api/chat"
  private conversacionesSubject = new BehaviorSubject<ConversacionDTO[]>([])
  private loadingSubject = new BehaviorSubject<boolean>(true)
  private initialLoadComplete = false
  private dataLoadedSubject = new BehaviorSubject<boolean>(false) // Nuevo: indica si los datos se han cargado

  conversaciones$ = this.conversacionesSubject.asObservable()
  loading$ = this.loadingSubject.asObservable()
  dataLoaded$ = this.dataLoadedSubject.asObservable() // Nuevo observable

  constructor(
    private websocketService: WebsocketService,
    private authService: AuthService,
    private http: HttpClient,
  ) {
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
      // Delay más corto para casos sin usuario
      setTimeout(() => {
        this.dataLoadedSubject.next(true)
      }, 500)
      return
    }

    // Solo mostrar loading en la primera carga
    if (!this.initialLoadComplete) {
      this.loadingSubject.next(true)
    }

    this.http
      .get<ConversacionDTO[]>(`${this.apiUrl}/conversaciones?usuarioId=${userId}`)
      .pipe(
        // Delay más corto para no interferir con la carga
        delay(this.initialLoadComplete ? 0 : 200),
        catchError((error) => {
          console.error("Error al obtener conversaciones:", error)
          return of([])
        }),
        finalize(() => {
          this.loadingSubject.next(false)
          this.initialLoadComplete = true
          // Delay más inteligente: más corto si hay conversaciones, más largo si no hay
          const delayTime = this.conversacionesSubject.value.length > 0 ? 200 : 1000
          setTimeout(() => {
            this.dataLoadedSubject.next(true)
          }, delayTime)
        }),
      )
      .subscribe((conversaciones) => {
        // Asegurar que siempre se emita un array, incluso si es vacío
        this.conversacionesSubject.next(conversaciones || [])
        console.log("Conversaciones cargadas:", conversaciones?.length || 0)
      })
  }

  /**
   * Endpoint que obtiene los mensajes entre dos usuarios.
   * @param remitenteId
   * @param destinatarioId
   * @param page
   * @param size
   */
  getMensajes(remitenteId: number, destinatarioId: number, page = 0, size = 10): Observable<ChatDTO[]> {
    if (remitenteId === destinatarioId) {
      return throwError(() => new Error("Los IDs no pueden ser iguales"))
    }
    return this.http
      .get<ChatDTO[]>(
        `${this.apiUrl}/mensajes?remitenteId=${remitenteId}&destinatarioId=${destinatarioId}&page=${page}&size=${size}`,
      )
      .pipe(
        catchError((error) => {
          console.error("Error al obtener mensajes:", error)
          return of([])
        }),
      )
  }

  /**
   * Endpoint que envía un mensaje al servidor y actualiza las conversaciones.
   * @param mensaje
   */
  enviarMensaje(mensaje: ChatDTO): Observable<ChatDTO> {
    return this.http.post<ChatDTO>(`${this.apiUrl}/enviar`, mensaje).pipe(
      tap(() => {
        // Solo recargar si ya se completó la carga inicial
        if (this.initialLoadComplete) {
          this.loadConversaciones()
        }
      }),
      catchError((error) => {
        console.error("Error al enviar mensaje:", error)
        return throwError(() => error)
      }),
    )
  }

  /**
   * Endpoint que marca un mensaje como leído entre dos usuarios.
   * @param remitenteId
   * @param destinatarioId
   */
  marcarComoLeido(remitenteId: number, destinatarioId: number): Observable<void> {
    return this.http
      .put<void>(`${this.apiUrl}/marcar-leido?remitenteId=${remitenteId}&destinatarioId=${destinatarioId}`, {})
      .pipe(
        tap(() => {
          // Solo recargar si ya se completó la carga inicial
          if (this.initialLoadComplete) {
            this.loadConversaciones()
          }
        }),
        catchError((error) => {
          console.error("Error al marcar como leído:", error)
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
   * @param mensajeId
   * @param usuarioId
   */
  marcarComoBorrado(mensajeId: number, usuarioId: number): Observable<ChatDTO> {
    return this.http
      .put<ChatDTO>(`${this.apiUrl}/borrar/${mensajeId}?usuarioId=${usuarioId}`, {})
      .pipe(tap(() => this.refreshConversaciones()))
  }

  private usuariosBloqueados: Set<number> = new Set<number>()

  getUsuariosBloqueados(): Set<number> {
    return this.usuariosBloqueados
  }

  /**
   * Obtiene el estado de carga de las conversaciones
   */
  isLoading(): Observable<boolean> {
    return this.loading$
  }

  /**
   * Verifica si la carga inicial se ha completado
   */
  isInitialLoadComplete(): boolean {
    return this.initialLoadComplete
  }

  /**
   * Verifica si los datos se han cargado completamente (incluyendo delays)
   */
  isDataLoaded(): Observable<boolean> {
    return this.dataLoaded$
  }
}
