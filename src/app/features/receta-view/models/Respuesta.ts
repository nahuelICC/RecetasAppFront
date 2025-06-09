/**
 * DTO para las respuestas de los comentarios en la vista de receta.
 */
export interface Respuesta {
    id:String;
    texto:String;
    fecha: Date;
    username: String;
    fotoPerfil: String;
}
