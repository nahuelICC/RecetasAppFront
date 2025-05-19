// src/app/models/chat.model.ts
export interface ChatDTO {
  id: number;
  texto: string;
  fecha: Date;
  leido: boolean;
  remitenteId: number;
  destinatarioId: number;
  remitenteNombre: string;
  remitenteFoto: string;
}

export interface ConversacionDTO {
  otroUsuarioId: number;
  otroUsuarioNombre: string;
  otroUsuarioFoto: string;
  ultimoMensaje: string;
  fechaUltimoMensaje: Date;
  noLeidos: boolean;
}
