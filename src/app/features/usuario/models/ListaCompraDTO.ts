/**
 * DTO para representar una lista deingredingredientes de una receta.
 */
export interface ListaIngredienteDTO {
  nombre: string;
  cantidad: string;
  checked?: boolean;
}

/**
 * DTO para representar una lista de compra de una receta.
 */
export interface ListaCompraDTO {
  idReceta: number;
  tituloReceta: string;
  ingredientes: ListaIngredienteDTO[];
}
