import { Alergeno } from "./Alergeno";
import { Ingrediente } from "./Ingrediente";

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
}