/**
 * DTO para notificaciones
 */
export interface NotificacionDTO {
  id: number;
  tipo: string;
  texto: string;
  fecha: string;
  leida: boolean;
  usuario: any;
}
