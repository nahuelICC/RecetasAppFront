import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { IonContent } from '@ionic/angular/standalone'; // IonIcon no se usa en el template, se puede quitar si no lo necesitas en otro lado
import { RecetasComponent } from "./components/recetas/recetas.component";
import { UsuarioExploradorComponent } from "./components/usuario-explorador/usuario-explorador.component";
import { AlergenoService } from "./services/alergeno.service";
import { IngredienteService } from "./services/ingrediente.service"; // Asumiendo que tienes este servicio
// Importa tus modelos/interfaces reales para Receta y Usuario si los tienes
// import { Receta } from './models/Receta';
// import { User } from './models/User';
import { Alergeno } from "./models/Alergeno";
import { Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators'; // Para input de ingredientes
import { IngredienteListarDTO } from "./models/IngredienteListarDTO"; // Usando tu interfaz
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {RecetasExploradorFiltroDTO} from './models/RecetasExploradorFiltroDTO';
import {RecetaService} from './services/receta.service';
import {RecetasExploradorDTO} from './models/RecetasExploradorDTO';
import {UsuarioExploradorDTO} from './models/UsuarioExploradorDTO';
import {UsuarioService} from './services/usuario.service';
import {UsuarioExploradorFiltroDTO} from './models/UsuarioExploradorFiltroDTO';
import {InteraccionesUsuarioDTO} from './models/InteraccionesUsuarioDTO'; // Importar FormsModule

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
    FormsModule
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
      private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    this.cargarAlergenos();
    this.cargarIngredientesCompletos();
    this.cargarRecetas();
    this.cargarUsuarios();
    this.cargarRecetasInteracciones();
  }

  ngOnDestroy(): void {
    // Cancelar todas las suscripciones
    this.alergenosSub?.unsubscribe();
    this.ingredienteSub?.unsubscribe();
    // this.recetasSub?.unsubscribe();
    // this.usuariosSub?.unsubscribe();
  }
  setActiveSort(sortType: 'relevantes' | 'seguidos'): void {
    if (sortType === 'relevantes') {
      this.selectedRelevante = !this.selectedRelevante;
      this.recetaExploradorFiltroDTO.relevantes = this.selectedRelevante;
    } else if (sortType === 'seguidos') {
      this.selectedSeguidos = !this.selectedSeguidos;
      this.recetaExploradorFiltroDTO.seguidos = this.selectedSeguidos ? 1 : -1;
    }
    this.cargarRecetas();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // --- Carga de Datos ---
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


  onSearchTermChange(): void {
    this.recetaExploradorFiltroDTO.buscador = this.searchTerm;
    this.usuarioExploradorFiltroDTO.buscador = this.searchTerm;
    this.cargarRecetas()
    this.cargarUsuarios();
  }

  toggleAlergeno(alergenoId: number): void {
    if (this.selectedAlergenos.has(alergenoId)) {
      this.selectedAlergenos.delete(alergenoId);
    } else {
      this.selectedAlergenos.add(alergenoId);
    }
  }

  isAlergenoSelected(alergenoId: number): boolean {
    return this.selectedAlergenos.has(alergenoId);
  }

  onIngredientInputFocus(): void {
    this.filterIngredientSuggestions(this.ingredientInputRef.nativeElement.value);
  }

  onIngredientInput(value: string): void {
    this.filterIngredientSuggestions(value);
  }

  filterIngredientSuggestions(value: string): void {
    const searchTerm = value.trim().toLowerCase();

    if (searchTerm.length < 1) { // Ocultar si no hay texto
      this.ingredientSuggestions = [];
      this.showIngredientSuggestions = false;
      this.noResultsFound = false;
      return;
    }

    // Filtra la lista COMPLETA de ingredientes cargada
    this.ingredientSuggestions = this.listaIngredientes.filter(ing =>
        ing.nombre.toLowerCase().includes(searchTerm) &&
        !this.selectedIngredients.some(selected => selected.id === ing.id) // No sugerir si ya está seleccionado
    ).slice(0, 10); // Limita resultados

    // Actualiza flags para mostrar dropdown y mensaje "no encontrado"
    this.noResultsFound = this.ingredientSuggestions.length === 0;
    this.showIngredientSuggestions = true; // Mostrar contenedor porque hay texto
  }

  // Se llama al hacer clic en una sugerencia
  selectSuggestion(ingrediente: IngredienteListarDTO): void {
    this.addIngredient(ingrediente);
    if (this.ingredientInputRef) {
      this.ingredientInputRef.nativeElement.value = ''; // Limpia el input
    }
    // Limpia y oculta el dropdown
    this.ingredientSuggestions = [];
    this.showIngredientSuggestions = false;
    this.noResultsFound = false;
  }

  addIngredient(ingrediente: IngredienteListarDTO): void {
    if (ingrediente && !this.selectedIngredients.some(selected => selected.id === ingrediente.id)) {
      this.selectedIngredients.push(ingrediente);
      this.ingredientSuggestions = [];
      this.showIngredientSuggestions = false;
      this.noResultsFound = false;
    }
  }

  addIngredientFromInput(inputElement: HTMLInputElement): void {
    const nombreBuscado = inputElement.value.trim();
    if (!nombreBuscado) {
      this.ingredientSuggestions = [];
      this.showIngredientSuggestions = false;
      this.noResultsFound = false;
      return;
    };

    // Intenta encontrar en sugerencias o lista completa
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

  // Eliminar ingrediente de las píldoras
  removeIngredient(id: number): void {
    this.selectedIngredients = this.selectedIngredients.filter(ing => ing.id !== id);
    if (this.ingredientInputRef?.nativeElement?.value) {
      this.filterIngredientSuggestions(this.ingredientInputRef.nativeElement.value);
    }
  }

  // Ocultar sugerencias al perder el foco (con delay para permitir clic)
  onIngredientInputBlur(): void {
    // Usamos setTimeout para dar tiempo a que el evento (mousedown) de la sugerencia se procese
    setTimeout(() => {
      this.showIngredientSuggestions = false;
      // No limpiamos noResultsFound aquí, puede ser útil si el usuario vuelve
    }, 150); // Ajusta este tiempo si es necesario
  }

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
    this.cargarRecetas();
    this.toggleFilters();
  }

  guardada(idReceta: number): boolean {
    return this.interaccionesUsuarioDTO.guardados?.includes(idReceta) || false;
  }
  meGusta(idReceta: number): boolean {
    return this.interaccionesUsuarioDTO.meGusta?.includes(idReceta) || false;
  }
  seguido(idUsuario: number): boolean {
    return this.interaccionesUsuarioDTO.seguidos?.includes(idUsuario) || false;
  }


  paginaAnterior() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.recetaExploradorFiltroDTO.pagina = this.paginaActual;
      this.cargarRecetas();
    }
  }

  siguientePagina() {
    if (this.paginaActual < this.numPaginas) {
      this.paginaActual++;
      this.recetaExploradorFiltroDTO.pagina = this.paginaActual;
      this.cargarRecetas();
    }
  }

  paginaAnteriorUsuarios() {
    if (this.paginaActualUsuarios > 1) {
      this.paginaActualUsuarios--;
      this.usuarioExploradorFiltroDTO.pagina = this.paginaActualUsuarios;
      this.cargarUsuarios();
    }
  }

  siguientePaginaUsuarios() {
    if (this.paginaActualUsuarios < this.numPaginasUsuarios) {
      this.paginaActualUsuarios++;
      this.usuarioExploradorFiltroDTO.pagina = this.paginaActualUsuarios;
      this.cargarUsuarios();
    }
  }
}
