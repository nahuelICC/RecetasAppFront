import { Injectable } from "@angular/core"
import { Client } from "@stomp/stompjs"
import { BehaviorSubject, type Observable } from "rxjs"
import { ChatDTO } from "../../features/chat/models/chat.dto"
import { AuthService } from "./auth.service"

/**
 * Servicio para manejar la conexión WebSocket y la comunicación en tiempo real del chat.
 */
@Injectable({
  providedIn: "root",
})
export class WebsocketService {
  private stompClient: Client | null = null
  private messageSubject = new BehaviorSubject<ChatDTO | null>(null)
  private connectionStatus = new BehaviorSubject<boolean>(false)
  private readStatusSubject = new BehaviorSubject<any>(null)

  constructor(private authService: AuthService) {}

  /**
   * Endpoint que establece la conexión WebSocket.
   */
  connect(): void {
    if (this.stompClient?.connected) {
      return
    }

    const token = this.authService.getToken()
    const userId = this.authService.getUserId()

    if (!token || !userId) {
      console.error("No hay token o ID de usuario disponible")
      return
    }

    // Detectar entorno y configurar URL correctamente
    const isProduction = window.location.hostname !== "localhost"
    const baseUrl = isProduction ? "wss://cookersback.onrender.com" : "ws://localhost:8081"

    const socketUrl = `${baseUrl}/ws-native?token=${encodeURIComponent(token)}`

    console.log("Conectando WebSocket a:", socketUrl)
    console.log("Entorno de producción:", isProduction)

    this.stompClient = new Client({
      brokerURL: socketUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.log("[STOMP]", str),
      onConnect: () => {
        console.log("Conectado al servidor WebSocket")
        this.onConnectSuccess(userId)
      },
      onStompError: (frame) => {
        console.error("Error en WebSocket:", frame.headers["message"])
        console.error("Frame completo:", frame)
        this.connectionStatus.next(false)
      },
      onWebSocketError: (error) => {
        console.error("Error de WebSocket:", error)
        this.connectionStatus.next(false)
      },
      onDisconnect: () => {
        console.log("WebSocket desconectado")
        this.connectionStatus.next(false)
      },
    })

    try {
      this.stompClient.activate()
    } catch (error) {
      console.error("Error al activar WebSocket:", error)
      this.connectionStatus.next(false)
    }
  }

  /**
   * Endpoint que maneja la conexión exitosa y suscribe al usuario a los mensajes.
   */
  private onConnectSuccess(userId: number): void {
    this.connectionStatus.next(true)

    this.stompClient?.subscribe(`/topic/messages/${userId}`, (message) => {
      try {
        const data = JSON.parse(message.body)

        if (data.type === "READ_STATUS_UPDATE") {
          console.log("Actualización de estado de lectura recibida:", data)
          this.readStatusSubject.next(data)
        } else {
          const chatMessage: ChatDTO = data
          console.log("Mensaje recibido via WebSocket:", chatMessage)
          this.messageSubject.next(chatMessage)
        }
      } catch (e) {
        console.error("Error al parsear mensaje:", e)
        console.error("Mensaje recibido:", message.body)
      }
    })
  }

  sendMessage(destination: string, body: any): void {
    if (this.stompClient?.connected) {
      this.stompClient.publish({
        destination: `/app/chat`,
        body: JSON.stringify(body),
      })
    } else {
      console.warn("WebSocket no conectado, mensaje no enviado")
      console.warn("Estado de conexión:", this.connectionStatus.value)
    }
  }

  /**
   * Endpoint que desconecta el cliente WebSocket.
   */
  disconnect(): void {
    if (this.stompClient?.active) {
      this.stompClient.deactivate()
      console.log("WebSocket desconectado")
      this.connectionStatus.next(false)
    }
    this.stompClient = null
  }

  /**
   * Endpoint que obtiene los mensajes del chat.
   */
  getMessages(): Observable<ChatDTO | null> {
    return this.messageSubject.asObservable()
  }

  /**
   * Obtiene las notificaciones de estado de lectura
   */
  getReadStatusUpdates(): Observable<any> {
    return this.readStatusSubject.asObservable()
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable()
  }
}
