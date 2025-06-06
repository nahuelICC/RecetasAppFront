/**
 * DTO para obtener notificaciones
 */
export interface GetNotificacionDTO {
  id: number;
  tipo: string;
  texto: string;
  fecha: string;
  leida: boolean;
  idReceta?: number,
  idUsuarioSeguido?: number
}

export interface NotificacionEncriptadaDTO extends GetNotificacionDTO {
  encryptedId?: string;
}
