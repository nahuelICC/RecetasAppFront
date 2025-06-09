import { Alergeno } from "./Alergeno";
import { Ingrediente } from "./Ingrediente";

/**
 * DTO para la vista de una receta.
 */
export interface RecetaViewResponse {
    id:           number;
    nombre:       string;
    descripcion:  null;
    imagen:       string;
    visible:      null;
    duracion:     null;
    ingredientes: Ingrediente[];
    proteinas:    number;
    hidratos:     number;
    grasas:       number;
    alergenos:    Alergeno[];
    video:       string;
    cooker:      string;
    idCooker: number;
}
