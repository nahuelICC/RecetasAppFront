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

  /**
   * Guarda el estado del explorador.
   * @param state
   */
  saveState(state: ExploradorState): void {
    console.log("Guardando estado del explorador:", state);
    this.state = state;
  }
  /**
   * Carga el estado del explorador guardado.
   * @returns ExploradorState | null
   */
  loadState(): ExploradorState | null {
    console.log("Cargando estado del explorador guardado.");
    const loadedState = this.state;
    return loadedState;
  }
  /**
   * Actualiza el estado del explorador con un nuevo estado.
   * @param newState
   */
  clearState(): void {
    console.log("Limpiando estado del explorador.");
    this.state = null;
  }
  /**
   * Verifica si hay un estado guardado.
   * @returns boolean
   */
  hasState(): boolean {
    return this.state !== null;
  }
}
