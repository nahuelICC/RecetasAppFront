export interface Receta {
  nombre: string;
  duracion: string;
  descripcion: string;
  imagen?: string;
  video?: string;
  esVisible: boolean;
  ingredientes: RecetaIngredienteDTO[];
  pasos: RecetaPasoDTO[];
}

export interface RecetaIngredienteDTO {
  idIngrediente: number;
  cantidad: number;
}

export interface RecetaPasoDTO {
  titulo: string;
  descripcion: string;
  numero: number;
  foto?: File;
  fotoPreview?: string;  // Para mantener la previsualización
}

export interface Ingrediente {
  id: number;
  nombre: string;
  proteinas: number;
  grasas: number;
  hidratos: number;
  alergeno: string | null;
  categoria: {
    id: number;
    nombre: string;
    medida: string;
  };
}
