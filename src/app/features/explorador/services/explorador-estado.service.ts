import { Injectable } from '@angular/core';
import {IngredienteListarDTO} from '../models/IngredienteListarDTO';
import {RecetasExploradorFiltroDTO} from '../models/RecetasExploradorFiltroDTO';
import {UsuarioExploradorFiltroDTO} from '../models/UsuarioExploradorFiltroDTO';

export interface ExploradorState {
  searchTerm: string;
  selectedAlergenos: Set<number>;
  selectedIngredients: IngredienteListarDTO[];
  selectedRelevante: boolean;
  selectedSeguidos: boolean;
  recetaExploradorFiltroDTO: RecetasExploradorFiltroDTO;
  usuarioExploradorFiltroDTO: UsuarioExploradorFiltroDTO;
  paginaActual: number;
  paginaActualUsuarios: number;
  showFilters: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class ExploradorEstadoService {
  private state: ExploradorState | null = null;
  constructor() { }

  // Guarda el estado actual del componente
  saveState(state: ExploradorState): void {
    console.log("Guardando estado del explorador:", state);
    this.state = state;
  }

  // Carga el estado guardado
  loadState(): ExploradorState | null {
    console.log("Cargando estado del explorador guardado.");
    const loadedState = this.state;
    // Opcional: Limpiar el estado después de cargarlo para que no se
    // reutilice si el usuario vuelve a la página desde otro lugar que no sea "atrás".
    // this.clearState();
    return loadedState;
  }

  // Limpia el estado guardado
  clearState(): void {
    console.log("Limpiando estado del explorador.");
    this.state = null;
  }

  // Comprueba si hay un estado guardado
  hasState(): boolean {
    return this.state !== null;
  }
}
