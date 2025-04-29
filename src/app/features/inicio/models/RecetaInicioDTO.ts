export interface RecetaInicioDTO {
  id: number;
  imagen: string;
  titulo: string;
  alergenos: string[];
  nombreCooker: string;
  fotoPerfilCooker: string;
  cookerId: number;
}
