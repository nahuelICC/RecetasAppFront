export interface ListaIngredienteDTO {
  nombre: string;
  cantidad: string;
  checked?: boolean;
}

export interface ListaCompraDTO {
  tituloReceta: string;
  ingredientes: ListaIngredienteDTO[];
}
