export interface ListaIngredienteDTO {
  nombre: string;
  cantidad: string;
  checked?: boolean;
}

export interface ListaCompraDTO {
  idReceta: number;
  tituloReceta: string;
  ingredientes: ListaIngredienteDTO[];
}
