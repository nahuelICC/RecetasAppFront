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
import {RecetasExploradorDTO} from './models/RecetasExploradorDTO'; // Importar FormsModule

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

  // --- Propiedades existentes ---
  listaAlergenos: Alergeno[] = [];
  listaIngredientes: IngredienteListarDTO[] = [];
  allRecipes: RecetasExploradorDTO[] = [];
  allUsers: any[] = [/* ... */];
  filteredRecipes: any[] = [];
  filteredUsers: any[] = [];
  searchTerm: string = '';
  selectedAlergenos = new Set<number>(); //lista con los alergenos seleccionados
  selectedIngredients: IngredienteListarDTO[] = []; // lista con los ingresientes seleccionados
  ingredientSuggestions: IngredienteListarDTO[] = [];
  showIngredientSuggestions: boolean = false;
  noResultsFound: boolean = false;
  isLoadingAlergenos: boolean = false;
  isLoadingIngredientes: boolean = false;
  errorCarga: string | null = null;
  private alergenosSub: Subscription | null = null;
  private ingredienteSub: Subscription | null = null;
  showFilters: boolean = false;
  activeSort: 'relevantes' | 'seguidos' = 'relevantes';
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
  paginaActual: number = 1;
  numPaginas: number = 1;

  constructor(
      private alergenoService: AlergenoService,
      private ingredienteService: IngredienteService,
      private recetaService: RecetaService
      // private recetaService: RecetaService,
      // private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    this.cargarAlergenos();
    this.cargarIngredientesCompletos(); // Carga todos para las sugerencias
    this.cargarRecetas();
    // this.cargarTodosLosUsuarios()
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
        // this.numPaginas = Math.ceil(this.allRecipes.length / 12);
      },
      error: err => {
        console.error('Error al cargar recetas:', err);
        this.allRecipes = [];
      }
    });
    this.recetaService.getNumRecetas(this.recetaExploradorFiltroDTO).subscribe({
      next: (data: any) => {
        this.numPaginas = Math.ceil(data / this.recetaExploradorFiltroDTO.numElementos);
      },
      error: err => {
        console.error('Error al cargar número de recetas:', err);
        this.numPaginas = 1;
      }
    });
  }

  cargarAlergenos(): void {
    this.isLoadingAlergenos = true;
    this.errorCarga = null; // Limpiar errores específicos si los hubiera

    this.alergenosSub = this.alergenoService.getAlergenos().subscribe({
      next: (data: Alergeno[]) => {
        this.listaAlergenos = data;
        this.isLoadingAlergenos = false;
      },
      error: (error) => {
        console.error('Error al cargar los alérgenos:', error);
        this.errorCarga = 'No se pudieron cargar los filtros de alérgenos.'; // Mensaje más específico
        this.isLoadingAlergenos = false;
        this.listaAlergenos = [];
      }
      // No necesitas 'complete' generalmente para llamadas HTTP
    });
  }

  cargarIngredientesCompletos(): void {
    this.isLoadingIngredientes = true;
    this.errorCarga = null;

    // Asumiendo que getIngredientes() devuelve TODOS los ingredientes para el autocompletado
    this.ingredienteSub = this.ingredienteService.getIngredientes().subscribe({
      next: (data: IngredienteListarDTO[]) => {
        this.listaIngredientes = data;
        this.isLoadingIngredientes = false;
      },
      error: (error) => {
        console.error('Error al cargar los ingredientes:', error);
        // Podrías tener un error específico para ingredientes si quieres
        this.errorCarga = 'No se pudieron cargar los ingredientes para el filtro.';
        this.isLoadingIngredientes = false;
        this.listaIngredientes = [];
      }
    });
  }

  // --- Lógica de Filtros ---

  onSearchTermChange(): void {
    this.recetaExploradorFiltroDTO.buscador = this.searchTerm;
    console.log('Search Term:', this.searchTerm);
    this.cargarRecetas()
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
    // Muestra sugerencias si ya hay texto al volver a hacer focus
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

  // Añadir ingrediente (reutilizado)
  addIngredient(ingrediente: IngredienteListarDTO): void {
    // Verifica que el ingrediente exista y no esté ya seleccionado
    if (ingrediente && !this.selectedIngredients.some(selected => selected.id === ingrediente.id)) {
      this.selectedIngredients.push(ingrediente);
      // Limpiar estado de sugerencias
      this.ingredientSuggestions = [];
      this.showIngredientSuggestions = false;
      this.noResultsFound = false;
      // --- !!! Aquí llamarías a la función que filtra las recetas/usuarios si tuvieras esa lógica ---
      // this.applyFilters();
      console.log('Ingredientes seleccionados:', this.selectedIngredients);
    }
  }

  // Añadir al presionar Enter
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
      inputElement.value = ''; // Limpiar input
      // Limpiar estado de sugerencias
      this.ingredientSuggestions = [];
      this.showIngredientSuggestions = false;
      this.noResultsFound = false;
    } else {
      console.warn(`Ingrediente "${nombreBuscado}" no encontrado.`);
      // Muestra el mensaje "No encontrado" en el dropdown
      this.ingredientSuggestions = [];
      this.showIngredientSuggestions = true;
      this.noResultsFound = true;
    }
  }

  // Eliminar ingrediente de las píldoras
  removeIngredient(id: number): void {
    this.selectedIngredients = this.selectedIngredients.filter(ing => ing.id !== id);
    // --- !!! Aquí llamarías a la función que filtra las recetas/usuarios si tuvieras esa lógica ---
    // this.applyFilters();
    console.log('Ingredientes seleccionados:', this.selectedIngredients);
    // Opcional: re-filtrar sugerencias si el input tiene texto
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

  // --- Método Principal de Filtrado ---

  // applyFilters(): void {
  //   console.log('Applying filters...');
  //   // 1. Empezar con la lista completa
  //   let recipes = [...this.allRecipes];
  //   let users = [...this.allUsers];
  //
  //   // 2. Filtrar por término de búsqueda (searchTerm)
  //   const term = this.searchTerm.trim().toLowerCase();
  //   if (term) {
  //     recipes = recipes.filter(recipe =>
  //         recipe.nombre?.toLowerCase().includes(term) || // Ajusta las propiedades a buscar
  //         recipe.descripcion?.toLowerCase().includes(term)
  //     );
  //     users = users.filter(user =>
  //         user.nombre?.toLowerCase().includes(term) || // Ajusta las propiedades a buscar
  //         user.username?.toLowerCase().includes(term)
  //     );
  //   }
  //
  //   // 3. Filtrar recetas por alérgenos excluidos (selectedAlergenos)
  //   if (this.selectedAlergenos.size > 0) {
  //     recipes = recipes.filter(recipe => {
  //       // Necesitas que cada 'recipe' tenga una lista de sus ingredientes
  //       // y que cada ingrediente tenga su 'alergenoId' o información de alérgeno.
  //       // Ejemplo: recipe.ingredientes = [{..., alergenoId: 1}, {..., alergenoId: 3}]
  //       if (!recipe.ingredientes || recipe.ingredientes.length === 0) {
  //         return true; // Si no tiene ingredientes, no puede tener el alérgeno excluido
  //       }
  //       // Comprobar si ALGUNO de sus ingredientes tiene un alergenoId que esté en selectedAlergenos
  //       const tieneAlergenoExcluido = recipe.ingredientes.some((ing: any) =>
  //           ing.alergenoId && this.selectedAlergenos.has(Number(ing.alergenoId)) // Asegúrate que alergenoId sea number
  //       );
  //       return !tieneAlergenoExcluido; // Devuelve true si NO tiene el alérgeno excluido
  //     });
  //   }
  //
  //   // 4. Filtrar recetas por ingredientes incluidos (selectedIngredients)
  //   if (this.selectedIngredients.length > 0) {
  //     recipes = recipes.filter(recipe => {
  //       // Necesitas que cada 'recipe' tenga una lista de IDs de sus ingredientes.
  //       // Ejemplo: recipe.ingredientIds = [10, 25, 30]
  //       if (!recipe.ingredientIds || recipe.ingredientIds.length === 0) {
  //         return false; // Si no tiene ingredientes, no puede tener los requeridos
  //       }
  //       // Comprobar si TODOS los ingredientes seleccionados están presentes en la receta
  //       return this.selectedIngredients.every(selectedIng =>
  //           recipe.ingredientIds.includes(selectedIng.id)
  //       );
  //     });
  //   }
  //
  //   // 5. Actualizar las listas que usa el template
  //   this.filteredRecipes = recipes;
  //   this.filteredUsers = users;
  //
  //   console.log('Filtered Recipes Count:', this.filteredRecipes.length);
  //   console.log('Filtered Users Count:', this.filteredUsers.length);
  // }


/*
  cargarTodosLosUsuarios(): void {
    // Llama a tu servicio de usuarios
     this.usuarioService.getAllPublicUsers().subscribe(data => {
      this.allUsers = data;
      this.applyFilters(); // Aplica filtros una vez cargados los usuarios
    });
  }
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
    this.cargarRecetas();
    this.toggleFilters();
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
}
