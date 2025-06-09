import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { RecetasComponent } from "./components/recetas/recetas.component";
import { UsuarioExploradorComponent } from "./components/usuario-explorador/usuario-explorador.component";
import { AlergenoService } from "./services/alergeno.service";
import { IngredienteService } from "./services/ingrediente.service";
import { Alergeno } from "./models/Alergeno";
import { Subscription } from "rxjs";
import { IngredienteListarDTO } from "./models/IngredienteListarDTO";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {RecetasExploradorFiltroDTO} from './models/RecetasExploradorFiltroDTO';
import {RecetaService} from './services/receta.service';
import {RecetasExploradorDTO} from './models/RecetasExploradorDTO';
import {UsuarioExploradorDTO} from './models/UsuarioExploradorDTO';
import {UsuarioService} from './services/usuario.service';
import {UsuarioExploradorFiltroDTO} from './models/UsuarioExploradorFiltroDTO';
import {InteraccionesUsuarioDTO} from './models/InteraccionesUsuarioDTO';
import {BotonAddRecetaComponent} from '../../shared/components/boton-add-receta/boton-add-receta.component';
import {ExploradorEstadoService, ExploradorState} from './services/explorador-estado.service';

@Component({
  selector: 'app-explorador',
  templateUrl: './explorador.component.html',
  styleUrls: ['./explorador.component.css'],
  standalone: true,
  imports: [
    RecetasComponent,
    UsuarioExploradorComponent,
    NgForOf,
    NgIf,
    NgClass,
    FormsModule,
    BotonAddRecetaComponent
  ]
})
export class ExploradorComponent implements OnInit, OnDestroy {
  @ViewChild('ingredientInput') ingredientInputRef!: ElementRef<HTMLInputElement>;

  listaAlergenos: Alergeno[] = [];
  listaIngredientes: IngredienteListarDTO[] = [];
  allRecipes: RecetasExploradorDTO[] = [];
  allUsers: UsuarioExploradorDTO[] = [];
  filteredUsers: any[] = [];
  searchTerm: string = '';
  selectedAlergenos = new Set<number>();
  selectedIngredients: IngredienteListarDTO[] = [];
  ingredientSuggestions: IngredienteListarDTO[] = [];
  showIngredientSuggestions: boolean = false;
  noResultsFound: boolean = false;
  isLoadingAlergenos: boolean = false;
  isLoadingIngredientes: boolean = false;
  errorCarga: string | null = null;
  private alergenosSub: Subscription | null = null;
  private ingredienteSub: Subscription | null = null;
  showFilters: boolean = false;
  selectedRelevante: boolean = false;
  selectedSeguidos: boolean = false;
  recetaExploradorFiltroDTO: RecetasExploradorFiltroDTO = {
    buscador: '',
    relevantes: false,
    seguidos: -1,
    excluirAlergenos: '',
    ingredientes: '',
    numIngredientes: 0,
    pagina: 1,
    numElementos: 12
  }
  usuarioExploradorFiltroDTO: UsuarioExploradorFiltroDTO = {
    buscador: '',
    seguidos: -1,
    pagina: 1,
    numElementos: 3
  }
  interaccionesUsuarioDTO: InteraccionesUsuarioDTO = {
    meGusta: [],
    guardados: [],
    seguidos: []
  }
  toltalRecetas: number = 0;
  paginaActual: number = 1;
  numPaginas: number = 1;
  paginaActualUsuarios: number = 1;
  numPaginasUsuarios: number = 1;



  constructor(
      private alergenoService: AlergenoService,
      private ingredienteService: IngredienteService,
      private recetaService: RecetaService,
      private usuarioService: UsuarioService,
      private stateService: ExploradorEstadoService
  ) {}
  /**
   * Inicializa el componente y carga los datos necesarios.
   * Si hay un estado guardado, lo restaura; si no, carga los datos por defecto.
   */
  ngOnInit() {
    if (this.stateService.hasState()) {
      console.log("Restaurando estado previo del explorador.");
      this.restoreState();
      this.stateService.clearState();
    } else {
      console.log("Inicializando explorador con estado por defecto.");
      this.cargarAlergenos();
      this.cargarIngredientesCompletos();
      this.cargarRecetas();
      this.cargarUsuarios();
      this.cargarRecetasInteracciones();
    }
  }
  /**
   * Limpia el estado guardado y las suscripciones al destruir el componente.
   */
  ngOnDestroy(): void {
    this.saveState();
    this.alergenosSub?.unsubscribe();
    this.ingredienteSub?.unsubscribe();
  }
  /**
   * Guarda el estado actual del explorador en el servicio de estado.
   * Este método se llama al destruir el componente para preservar el estado.
   */
  private saveState(): void {
    const currentState: ExploradorState = {
      searchTerm: this.searchTerm,
      selectedAlergenos: this.selectedAlergenos,
      selectedIngredients: this.selectedIngredients,
      selectedRelevante: this.selectedRelevante,
      selectedSeguidos: this.selectedSeguidos,
      recetaExploradorFiltroDTO: this.recetaExploradorFiltroDTO,
      usuarioExploradorFiltroDTO: this.usuarioExploradorFiltroDTO,
      paginaActual: this.paginaActual,
      paginaActualUsuarios: this.paginaActualUsuarios,
      showFilters: this.showFilters
    };
    this.stateService.saveState(currentState);
  }
  /**
   * Restaura el estado del explorador desde el servicio de estado.
   * Si hay un estado guardado, lo aplica a las propiedades del componente.
   * Luego, carga los datos necesarios para la vista.
   */
  private restoreState(): void {
    const savedState = this.stateService.loadState();
    if (savedState) {
      // Restaura todas las propiedades del componente con los valores guardados
      this.searchTerm = savedState.searchTerm;
      this.selectedAlergenos = savedState.selectedAlergenos;
      this.selectedIngredients = savedState.selectedIngredients;
      this.selectedRelevante = savedState.selectedRelevante;
      this.selectedSeguidos = savedState.selectedSeguidos;
      this.recetaExploradorFiltroDTO = savedState.recetaExploradorFiltroDTO;
      this.usuarioExploradorFiltroDTO = savedState.usuarioExploradorFiltroDTO;
      this.paginaActual = savedState.paginaActual;
      this.paginaActualUsuarios = savedState.paginaActualUsuarios;
      this.showFilters = savedState.showFilters;

      // Carga los datos necesarios para la vista (no necesitas recargar los filtros estáticos como alergenos)
      this.cargarAlergenos(); // Necesario para pintar los seleccionados
      this.cargarIngredientesCompletos(); // Necesario para el input
      this.cargarRecetas(); // Recarga las recetas con los filtros restaurados
      this.cargarUsuarios(); // Recarga los usuarios con los filtros restaurados
      this.cargarRecetasInteracciones();
    }
  }
  /**
   * Establece el tipo de ordenamiento activo y actualiza los filtros de recetas.
   * @param sortType - Tipo de ordenamiento ('relevantes' o 'seguidos').
   */
  setActiveSort(sortType: 'relevantes' | 'seguidos'): void {
    if (sortType === 'relevantes') {
      this.selectedRelevante = !this.selectedRelevante;
      this.recetaExploradorFiltroDTO.relevantes = this.selectedRelevante;
    } else if (sortType === 'seguidos') {
      this.selectedSeguidos = !this.selectedSeguidos;
      this.recetaExploradorFiltroDTO.seguidos = this.selectedSeguidos ? 1 : -1;
    }
    this.usuarioExploradorFiltroDTO.pagina = 1;
    this.cargarRecetas();
  }
  /**
   * Alterna la visibilidad de los filtros.
   * Cambia el estado de `showFilters` para mostrar u ocultar los filtros.
   */
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
  /**
   * Carga las recetas y usuarios según los filtros aplicados.
   * Realiza dos llamadas al servicio: una para obtener las recetas y otra para obtener el número total de recetas.
   */
  cargarRecetas(): void {
    this.recetaService.getRecetasFiltro(this.recetaExploradorFiltroDTO).subscribe({
      next: (data: any) =>{
        this.allRecipes = data;
      },
      error: err => {
        console.error('Error al cargar recetas:', err);
        this.allRecipes = [];
      }
    });
    this.recetaService.getNumRecetas(this.recetaExploradorFiltroDTO).subscribe({
      next: (data: any) => {
        this.numPaginas = Math.ceil(data / this.recetaExploradorFiltroDTO.numElementos);
        this.toltalRecetas = data;
      },
      error: err => {
        console.error('Error al cargar número de recetas:', err);
        this.numPaginas = 1;
        this.toltalRecetas = 0;
      }
    });
  }
  /**
   * Carga los usuarios según los filtros aplicados.
   * Realiza dos llamadas al servicio: una para obtener los usuarios y otra para obtener el número total de usuarios.
   */
  cargarUsuarios(): void {
    this.usuarioService.getUsuariosFiltro(this.usuarioExploradorFiltroDTO).subscribe({
      next: (data: any) =>{
        this.allUsers = data;
      },
      error: err => {
        console.error('Error al cargar usuarios:', err);
        this.allUsers = [];
      }
    });
    this.usuarioService.getNumUsuarios(this.usuarioExploradorFiltroDTO).subscribe({
      next: (data: any) => {
        this.numPaginasUsuarios = Math.ceil(data / this.usuarioExploradorFiltroDTO.numElementos);
      },
      error: err => {
        console.error('Error al cargar número de usuarios:', err);
        this.numPaginasUsuarios = 1;
      }
    });
  }
  /**
   * Carga las interacciones del usuario con las recetas (me gusta, guardados, seguidos).
   * Utiliza el servicio de recetas para obtener las interacciones del usuario.
   */
  cargarRecetasInteracciones(): void {
    this.recetaService.getIntereaccionesRecetasUsuario().subscribe({
      next: (data: any) =>{
        this.interaccionesUsuarioDTO = data;
      },
      error: err => {
        console.error('Error al cargar recetas:', err);
        this.interaccionesUsuarioDTO.meGusta = [];
        this.interaccionesUsuarioDTO.guardados = [];
        this.interaccionesUsuarioDTO.seguidos = [];
      }
    });
  }
  /**
   * Carga los alérgenos disponibles para filtrar las recetas.
   * Utiliza el servicio de alérgenos para obtener la lista de alérgenos.
   */
  cargarAlergenos(): void {
    this.isLoadingAlergenos = true;
    this.errorCarga = null;

    this.alergenosSub = this.alergenoService.getAlergenos().subscribe({
      next: (data: Alergeno[]) => {
        this.listaAlergenos = data;
        this.isLoadingAlergenos = false;
      },
      error: (error) => {
        console.error('Error al cargar los alérgenos:', error);
        this.errorCarga = 'No se pudieron cargar los filtros de alérgenos.';
        this.isLoadingAlergenos = false;
        this.listaAlergenos = [];
      }
    });
  }
  /**
   * Carga los ingredientes disponibles para filtrar las recetas.
   * Utiliza el servicio de ingredientes para obtener la lista de ingredientes.
   */
  cargarIngredientesCompletos(): void {
    this.isLoadingIngredientes = true;
    this.errorCarga = null;

    this.ingredienteSub = this.ingredienteService.getIngredientes().subscribe({
      next: (data: IngredienteListarDTO[]) => {
        this.listaIngredientes = data;
        this.isLoadingIngredientes = false;
      },
      error: (error) => {
        console.error('Error al cargar los ingredientes:', error);
        this.errorCarga = 'No se pudieron cargar los ingredientes para el filtro.';
        this.isLoadingIngredientes = false;
        this.listaIngredientes = [];
      }
    });
  }

  /**
   * Maneja el cambio en el término de búsqueda.
   * Actualiza los filtros de recetas y usuarios, y recarga los datos.
   */
  onSearchTermChange(): void {
    this.recetaExploradorFiltroDTO.buscador = this.searchTerm;
    this.usuarioExploradorFiltroDTO.buscador = this.searchTerm;
    this.recetaExploradorFiltroDTO.pagina = 1;
    this.usuarioExploradorFiltroDTO.pagina = 1;
    this.cargarRecetas()
    this.cargarUsuarios();
    this.paginaActualUsuarios = 1;
    this.paginaActual = 1;
  }
  /**
   * Alterna la selección de un alérgeno.
   * Si el alérgeno ya está seleccionado, lo elimina; si no, lo agrega.
   * @param alergenoId - ID del alérgeno a alternar.
   */
  toggleAlergeno(alergenoId: number): void {
    if (this.selectedAlergenos.has(alergenoId)) {
      this.selectedAlergenos.delete(alergenoId);
    } else {
      this.selectedAlergenos.add(alergenoId);
    }
  }
  /**
   * Verifica si un alérgeno está seleccionado.
   * @param alergenoId - ID del alérgeno a verificar.
   * @returns true si el alérgeno está seleccionado, false en caso contrario.
   */
  isAlergenoSelected(alergenoId: number): boolean {
    return this.selectedAlergenos.has(alergenoId);
  }
  /**
   * Maneja el evento de enfoque en el campo de entrada de ingredientes.
   * Filtra las sugerencias de ingredientes basadas en el valor actual del campo de entrada.
   */
  onIngredientInputFocus(): void {
    this.filterIngredientSuggestions(this.ingredientInputRef.nativeElement.value);
  }
  /**
   * Maneja el evento de entrada de texto en el campo de ingredientes.
   * Filtra las sugerencias de ingredientes basadas en el valor ingresado.
   * @param value - Valor actual del campo de entrada.
   */
  onIngredientInput(value: string): void {
    this.filterIngredientSuggestions(value);
  }
  /**
   * Filtra las sugerencias de ingredientes basadas en el valor ingresado.
   * Muestra las sugerencias si hay texto ingresado y no hay resultados encontrados.
   * @param value - Valor actual del campo de entrada.
   */
  filterIngredientSuggestions(value: string): void {
    const searchTerm = value.trim().toLowerCase();

    if (searchTerm.length < 1) { // Ocultar si no hay texto
      this.ingredientSuggestions = [];
      this.showIngredientSuggestions = false;
      this.noResultsFound = false;
      return;
    }


    this.ingredientSuggestions = this.listaIngredientes.filter(ing =>
        ing.nombre.toLowerCase().includes(searchTerm) &&
        !this.selectedIngredients.some(selected => selected.id === ing.id)
    ).slice(0, 10);

    this.noResultsFound = this.ingredientSuggestions.length === 0;
    this.showIngredientSuggestions = true; // Mostrar contenedor porque hay texto
  }

  /**
   * Selecciona un ingrediente de las sugerencias y lo agrega a la lista de ingredientes seleccionados.
   * Limpia el campo de entrada y oculta las sugerencias.
   * @param ingrediente - Ingrediente seleccionado.
   */
  selectSuggestion(ingrediente: IngredienteListarDTO): void {
    this.addIngredient(ingrediente);
    if (this.ingredientInputRef) {
      this.ingredientInputRef.nativeElement.value = ''; // Limpia el input
    }
    this.ingredientSuggestions = [];
    this.showIngredientSuggestions = false;
    this.noResultsFound = false;
  }
  /**
   * Agrega un ingrediente a la lista de ingredientes seleccionados.
   * Si el ingrediente ya está seleccionado, no lo agrega nuevamente.
   * @param ingrediente - Ingrediente a agregar.
   */
  addIngredient(ingrediente: IngredienteListarDTO): void {
    if (ingrediente && !this.selectedIngredients.some(selected => selected.id === ingrediente.id)) {
      this.selectedIngredients.push(ingrediente);
      this.ingredientSuggestions = [];
      this.showIngredientSuggestions = false;
      this.noResultsFound = false;
    }
  }
  /**
   * Agrega un ingrediente basado en el valor ingresado en el campo de entrada.
   * Busca el ingrediente en las sugerencias y en la lista completa de ingredientes.
   * Si no se encuentra, muestra un mensaje de error.
   * @param inputElement - Elemento de entrada HTML donde se ingresó el nombre del ingrediente.
   */
  addIngredientFromInput(inputElement: HTMLInputElement): void {
    const nombreBuscado = inputElement.value.trim();
    if (!nombreBuscado) {
      this.ingredientSuggestions = [];
      this.showIngredientSuggestions = false;
      this.noResultsFound = false;
      return;
    };

    let ingredienteToAdd = this.ingredientSuggestions.find(ing => ing.nombre.toLowerCase() === nombreBuscado.toLowerCase());
    if (!ingredienteToAdd) {
      ingredienteToAdd = this.listaIngredientes.find(ing => ing.nombre.toLowerCase() === nombreBuscado.toLowerCase());
    }

    if (ingredienteToAdd) {
      this.addIngredient(ingredienteToAdd);
      inputElement.value = '';
      this.ingredientSuggestions = [];
      this.showIngredientSuggestions = false;
      this.noResultsFound = false;
    } else {
      console.warn(`Ingrediente "${nombreBuscado}" no encontrado.`);
      this.ingredientSuggestions = [];
      this.showIngredientSuggestions = true;
      this.noResultsFound = true;
    }
  }
  /**
   * Elimina un ingrediente de la lista de ingredientes seleccionados.
   * Filtra el ingrediente por su ID y lo elimina de la lista.
   * Si hay texto en el campo de entrada, vuelve a filtrar las sugerencias.
   * @param id - ID del ingrediente a eliminar.
   */
  removeIngredient(id: number): void {
    this.selectedIngredients = this.selectedIngredients.filter(ing => ing.id !== id);
    if (this.ingredientInputRef?.nativeElement?.value) {
      this.filterIngredientSuggestions(this.ingredientInputRef.nativeElement.value);
    }
  }

  /**
   * Maneja el evento de desenfoque del campo de entrada de ingredientes.
   * Oculta las sugerencias después de un breve retraso para permitir la selección.
   */
  onIngredientInputBlur(): void {
    setTimeout(() => {
      this.showIngredientSuggestions = false;
    }, 150);
  }
  /**
   * Aplica los filtros seleccionados y recarga las recetas.
   * Actualiza el DTO de filtro con los alérgenos y los ingredientes seleccionados.
   * Resetea la página a 1 y recarga las recetas.
   */
  aplicarFiltros() {
    if (this.selectedAlergenos.size > 0) {
      this.recetaExploradorFiltroDTO.excluirAlergenos = '(' + Array.from(this.selectedAlergenos).join(',') + ')';
    } else {
      this.recetaExploradorFiltroDTO.excluirAlergenos = '';
    }
    if (this.selectedIngredients.length > 0) {
      this.recetaExploradorFiltroDTO.ingredientes = '(' + this.selectedIngredients.map(ing => ing.id).join(',') + ')';
      this.recetaExploradorFiltroDTO.numIngredientes = this.selectedIngredients.length;
    } else {
      this.recetaExploradorFiltroDTO.ingredientes = '';
    }
    this.recetaExploradorFiltroDTO.pagina = 1;
    this.cargarRecetas();
    this.toggleFilters();
    this.paginaActual = 1;
  }
  /**
   * Limpia los filtros aplicados y recarga las recetas.
   * Resetea los DTO de filtro y recarga las recetas y usuarios.
   */
  guardada(idReceta: number): boolean {
    return this.interaccionesUsuarioDTO.guardados?.includes(idReceta) || false;
  }

  /**
   * Verifica si el usuario ha dado "Me gusta" a una receta.
   * @param idReceta
   */
  meGusta(idReceta: number): boolean {
    return this.interaccionesUsuarioDTO.meGusta?.includes(idReceta) || false;
  }

  /**
   * Verifica si el usuario sigue a otro usuario.
   * @param idUsuario
   */
  seguido(idUsuario: number): boolean {
    return this.interaccionesUsuarioDTO.seguidos?.includes(idUsuario) || false;
  }

  /**
   * Limpia los filtros aplicados y recarga las recetas.
   */
  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.recetaExploradorFiltroDTO.pagina = this.paginaActual;
      this.cargarRecetasInteracciones();
      this.cargarRecetas();
    }
  }
  /**
   * Avanza a la siguiente página de recetas si hay más páginas disponibles.
   */
  siguientePagina() {
    if (this.paginaActual < this.numPaginas) {
      this.paginaActual++;
      this.recetaExploradorFiltroDTO.pagina = this.paginaActual;
      this.cargarRecetasInteracciones();
      this.cargarRecetas();
    }
  }
  /**
   * Limpia los filtros aplicados y recarga las recetas y usuarios.
   */
  paginaAnteriorUsuarios() {
    if (this.paginaActualUsuarios > 1) {
      this.paginaActualUsuarios--;
      this.usuarioExploradorFiltroDTO.pagina = this.paginaActualUsuarios;
      this.cargarRecetasInteracciones();
      this.cargarUsuarios();
    }
  }
  /**
   * Avanza a la siguiente página de usuarios si hay más páginas disponibles.
   */
  siguientePaginaUsuarios() {
    if (this.paginaActualUsuarios < this.numPaginasUsuarios) {
      this.paginaActualUsuarios++;
      this.usuarioExploradorFiltroDTO.pagina = this.paginaActualUsuarios;
      this.cargarRecetasInteracciones();
      this.cargarUsuarios();
    }
  }
}
