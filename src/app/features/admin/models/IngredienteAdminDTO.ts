import {CategoriaNoMedidaDTO} from './CategoriaNoMedidaDTO';
import {AlergenoNoImgDTO} from './AlergenoNoImgDTO';

export interface IngredienteAdminDTO{
  id: number;
  nombre: string;
  alergeno?: AlergenoNoImgDTO;
  categoria?: CategoriaNoMedidaDTO;
  proteinas: number;
  hidratos: number;
  grasas: number;
}
