/**
 * DTO para los pasos de una receta.
 */
export interface PasoResponse {
    titulo:         string;
    descripcion:    string;
    foto:           string;
    numero:         number;
    tiempoEstimado?: number;
    consejo?:       string;
}
