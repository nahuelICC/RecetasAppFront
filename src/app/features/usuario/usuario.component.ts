import {ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {IonChip, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonLabel} from '@ionic/angular/standalone';
import {UsuarioService} from './services/usuario.service';
import {HeaderService} from '../../shared/services/header.service';
import {BotonComponent} from '../../shared/components/boton/boton.component';
import {BotonAddRecetaComponent} from '../../shared/components/boton-add-receta/boton-add-receta.component';
import {CuadroRecetaComponent} from './components/cuadro-receta/cuadro-receta.component';
import {CuadroRecetaGuardadaComponent} from './components/cuadro-receta-guardada/cuadro-receta-guardada.component';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {ColeccionRecetasComponent} from './components/coleccion-recetas/coleccion-recetas.component';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AlertInfoComponent, AlertType} from '../../shared/components/alert-info/alert-info.component';
import {AlertConfirmarComponent} from '../../shared/components/alert-confirmar/alert-confirmar.component';
import {AuthService} from '../../core/services/auth.service';
import {EncryptService} from '../../core/services/encrypt.service';
import {RegistroService} from '../registro/services/registro.service';
import {ListaCompraComponent} from './components/lista-compra/lista-compra.component';

/**
 * Componente que representa el perfil de usuario.
 */
@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css'],
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    IonIcon,
    BotonComponent,
    BotonAddRecetaComponent,
    CuadroRecetaComponent,
    CuadroRecetaGuardadaComponent,
    NgClass,
    ColeccionRecetasComponent,
    FormsModule,
    AlertInfoComponent,
    ReactiveFormsModule,
    AlertConfirmarComponent,
    RouterLink,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonChip,
    IonLabel,
    ListaCompraComponent
  ]
})
export class UsuarioComponent  implements OnInit {

  perfil: any;
  activeTab: string = 'recetas';
  recetas: any[] = [];
  recetasVisibles: any[] = [];
  colecciones: any[] = [];
  recetasGuardadas: any[] = [];
  imagenPerfilUsuario: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  esPerfilPropio: boolean = true;
  editandoPerfil: boolean = false;
  datosEdicion: any = {};
  perfilOriginal: any = {};
  alertMessage: string = '';
  isAlertVisible: boolean = false;
  alertType: AlertType = 'success'; // 'success' | 'error' | 'info'
  cambioContrasenaForm!: FormGroup;
  mostrandoCambioContrasena = false;
  showConfirmPassword = false;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  mostrarSeguidos = false;
  seguidos: any[] = [];
  seguidores: any[] = [];
  mostrarSeguidores = false;
  idPropietario: number = 0;
  recetasMostradas: any[] = [];
  recetasPerPage = 9;
  recetasGuardadasMostradas: any[] = [];
  guardadasPerPage = 9;
  coleccionesMostradas: any[] = [];
  coleccionesPerPage = 4;
  perfilBloqueado = false;
  mostrarCrearColeccion = false;
  nuevaColeccionTitulo = '';
  recetasSeleccionadas: Set<number> = new Set<number>();
  mostrarEditarColeccion = false;
  modoEdicionColeccion = false;
  coleccionEditando: any = {};
  editarPerfil = false;
  ingredientes: any[] = [];
  ingredientesFiltrados: any[] = [];
  ingredientesSeleccionados: any[] = [];
  alergenosSeleccionados: any[] = [];
  alergenos: any[] = [];
  mostrarListaCompra = false;
  showPassword = false;
  showNewPassword = false;
  showRepeatPassword = false;
  recetaAEliminar: number | null = null;
  mostrarAlertaConfirmar: boolean = false;
  mensajeAlertaConfirmar: string = '';
  accionConfirmada: () => void = () => {};


  constructor(private usuarioService:UsuarioService,private registroService:RegistroService,private headerService: HeaderService,private route: ActivatedRoute,private authService: AuthService,private zone: NgZone,private fb: FormBuilder, private router:Router, private encryptService:EncryptService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const idDecrypt = this.encryptService.desencriptar(id || '');
    this.idPropietario = this.authService.getUserId() || 0;
    if (id && idDecrypt !== this.idPropietario.toString()) {
      this.usuarioService.getPerfilId(idDecrypt).subscribe((response) => {
        this.perfil = response;
        this.recetas = response.recetas;
        this.recetasVisibles = response.recetas.filter((receta: any) => receta.esVisible);
        this.colecciones = response.colecciones;
        if (!this.perfil.ingredientesFavoritos) this.perfil.ingredientesFavoritos = [];
        if (!this.perfil.alergenos) this.perfil.alergenos = [];

        this.recetasMostradas = this.recetas.slice(0, this.recetasPerPage);
        this.coleccionesMostradas = this.colecciones.slice(0, this.coleccionesPerPage);
      });
      this.usuarioService.perfilBloqueado(idDecrypt).subscribe((response) => {
        this.perfilBloqueado = response as boolean;
      });

      this.usuarioService.fotoPerfilVisita(idDecrypt).subscribe((response: any) => {
        if (response !== 'sin foto') {
          this.imagenPerfilUsuario = response;
        }else {
          this.imagenPerfilUsuario = 'https://ionicframework.com/docs/img/demos/avatar.svg';
        }
      });
      this.esPerfilPropio = false;
    } else {
      this.esPerfilPropio = true;
      this.usuarioService.getPerfil().subscribe((response) => {
        this.perfil = response;
        this.recetas = response.recetas;
        this.colecciones = response.colecciones;
        this.recetasVisibles = response.recetas.filter((receta: any) => receta.esVisible);
        this.recetasGuardadas = response.recetasGuardadas;
        this.alergenosSeleccionados = response.alergenos ? [...response.alergenos] : [];
        this.ingredientesSeleccionados = response.ingredientesFavoritos ? [...response.ingredientesFavoritos] : [];

        this.recetasMostradas = this.recetas.slice(0, this.recetasPerPage);
        this.coleccionesMostradas = this.colecciones.slice(0, this.coleccionesPerPage);
        this.recetasGuardadasMostradas = this.recetasGuardadas.slice(0, this.guardadasPerPage);
      });

      this.headerService.getFotoPerfil().subscribe((response: any) => {
        if (response !== 'sin foto') {
          this.imagenPerfilUsuario = response;
        }else {
          this.imagenPerfilUsuario = 'https://ionicframework.com/docs/img/demos/avatar.svg';
        }
      });
      this.registroService.getAlergenosImagen().subscribe(
        (response) => {
          this.alergenos = response;
          console.log(this.alergenos);
        },
        (error) => {
          console.error('Error al obtener los alergenos', error);
        }
      );
      this.registroService.getIngredientesBuscador().subscribe(
        (response) => {
          this.ingredientes = response;
          console.log(this.ingredientes);
        },
        (error) => {
          console.error('Error al obtener los ingredientes', error);
        }
      );
    }

    this.cambioContrasenaForm = this.fb.group({
      actual: ['', Validators.required],
      nueva: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)
        ]
      ],
      repetir: ['', Validators.required]
    }, { validators: this.passwordsIguales });

    const paramId = this.route.snapshot.paramMap.get('id') || '';

    this.usuarioService.listaSeguidos(this.esPerfilPropio, idDecrypt).subscribe((response) => {
      this.seguidos = response;
    });

    this.usuarioService.listaSeguidores(this.esPerfilPropio, idDecrypt).subscribe((response) => {
      this.seguidores = response;
    });



  }

  /**
   * Valida que las contraseñas nueva y repetir sean iguales.
   * @param form
   */
  passwordsIguales(form: FormGroup) {
    const nueva = form.get('nueva')?.value;
    const repetir = form.get('repetir')?.value;
    return nueva === repetir ? null : { noCoinciden: true };
  }

  /**
   * Getter para acceder al campo de contraseña actual del formulario.
   */
  get nuevaContrasena() {
    return this.cambioContrasenaForm.get('nueva');
  }

  /**
   * Función para cambiar la contraseña del usuario.
   */
  onGuardarContrasena() {
    if (this.cambioContrasenaForm.valid) {
      this.mensajeAlertaConfirmar = '¿Estás seguro de que quieres cambiar tu contraseña?';
      this.accionConfirmada = () => {
        this.usuarioService.cambiarContrasena(this.cambioContrasenaForm.value).subscribe(
          (response) => {
            console.log(response);
            this.alertMessage = response;
            this.alertType = 'success';
            this.isAlertVisible = true;

            this.cambioContrasenaForm.reset();

            setTimeout(() => {
              this.isAlertVisible = false;
            }, 3000);
          },
          (error) => {
            console.error('Error al cambiar la contraseña:', error);
            this.alertMessage = error.error;
            this.alertType = 'error';
            this.isAlertVisible = true;
          }
        );

        this.mostrarAlertaConfirmar = false;
        this.mostrandoCambioContrasena = false;

      };
      this.mostrarAlertaConfirmar = true;
    }
  }

  /**
   * Funcion para guardar los cambios realizados en el perfil del usuario.
   */
  guardarCambios() {
    this.datosEdicion = {
      nombre: this.perfil.nombre,
      apellidos: this.perfil.apellidos,
      descripcion: this.perfil.descripcion,
      ingredientesSeleccionados: this.ingredientesSeleccionados.map(i => i.id),
      alergenosSeleccionados: this.alergenosSeleccionados.map(a => a.id)
    };

    if (!this.datosEdicion.nombre || !this.datosEdicion.apellidos) {
      this.alertMessage = 'Por favor, completa todos los campos.';
      this.isAlertVisible = true;
      this.alertType = 'error';
      return;
    }

    this.usuarioService.editarPerfil(this.datosEdicion).subscribe((response) => {
      console.log(response);
      this.perfil.nombre = this.datosEdicion.nombre;
      this.perfil.apellidos = this.datosEdicion.apellidos;
      this.perfil.descripcion = this.datosEdicion.descripcion;
      this.perfil.ingredientesFavoritos = this.ingredientesSeleccionados;
      this.perfil.alergenos = this.alergenosSeleccionados;
      this.editandoPerfil = false;
      this.alertMessage = response;
      this.alertType = 'success';
      this.isAlertVisible = true;
      this.editarPerfil = false;
    }, (error) => {
      console.error('Error al guardar los cambios:', error);
      this.perfil = this.perfilOriginal;
      this.editandoPerfil = false;
      this.alertMessage = error.error;
      this.isAlertVisible = true;
      this.alertType = 'error';
      this.editarPerfil = false;
    });

    setTimeout(() => {
      this.isAlertVisible = false;
    }, 2000);

}

  /**
   * Función para manejar el cambio de imagen de perfil del usuario.
   */
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  /**
   * Función que se ejecuta cuando se selecciona un archivo para subir como foto de perfil.
   * @param event Evento de cambio del input de archivo.
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const selectedFile = input.files[0];
      const formData = new FormData();
      formData.append('fotoPerfil', selectedFile);

      this.usuarioService.subirFotoPerfil(formData).subscribe(
        (response) => {
          console.log(response);
          this.imagenPerfilUsuario = response.urlFoto;
          this.alertMessage = response.mensaje;
          this.alertType = 'success';
          this.isAlertVisible = true;
        },
        (error) => {
          console.error('Error al subir la imagen:', error);
          this.alertMessage = error.error;
          this.alertType = 'error';
          this.isAlertVisible = true;
        }
      );

      setTimeout(() => {
        this.isAlertVisible = false;
      }, 5000);
    }
  }

  /**
   * Muestra u oculta la sección de seguidos
   */
  toggleSeguidos(): void {
    this.mostrarSeguidos = !this.mostrarSeguidos;
  }

  /**
   * Muestra u oculta la sección de seguidores
   */
  toggleSeguidores(): void {
    this.mostrarSeguidores = !this.mostrarSeguidores;
  }

  /**
   * Redirecciona al perfil del usuario con el ID proporcionado.
   */
  redireccionarPerfil(id: string): void {
    this.zone.run(() => {
      const idEncrypt = this.encryptService.encriptar(id);
      this.router.navigate(['/perfil', idEncrypt]).then(() => {
        window.location.reload();
      });
    });
  }

  /**
   * Carga más recetas
   */
  loadMoreRecetas(event: any) {
    const startIndex = this.recetasMostradas.length;
    const endIndex = startIndex + this.recetasPerPage;
    const next = this.recetas.slice(startIndex, endIndex);

    this.recetasMostradas = [...this.recetasMostradas, ...next];
    event.target.complete();

    if (this.recetasMostradas.length >= this.recetas.length) {
      event.target.disabled = true;
    }
  }

  /**
   * Carga más recetas guardadas
   */
  loadMoreGuardadas(event: any) {
    const startIndex = this.recetasGuardadasMostradas.length;
    const endIndex = startIndex + this.guardadasPerPage;
    const next = this.recetasGuardadas.slice(startIndex, endIndex);

    this.recetasGuardadasMostradas = [...this.recetasGuardadasMostradas, ...next];
    event.target.complete();

    if (this.recetasGuardadasMostradas.length >= this.recetasGuardadas.length) {
      event.target.disabled = true;
    }
  }

  /**
   * Carga más colecciones
   */
  loadMoreColecciones(event: any) {
    const startIndex = this.coleccionesMostradas.length;
    const endIndex = startIndex + this.coleccionesPerPage;
    const next = this.colecciones.slice(startIndex, endIndex);

    this.coleccionesMostradas = [...this.coleccionesMostradas, ...next];
    event.target.complete();

    if (this.coleccionesMostradas.length >= this.colecciones.length) {
      event.target.disabled = true;
    }
  }

  /**
   * Cambia el estado de bloqueo del perfil del usuario.
   */
  toggleBloquearPerfil() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    const idDecrypt = this.encryptService.desencriptar(id);
    let isBlocked: boolean = false;

    this.usuarioService.changeBloqueo(idDecrypt).subscribe((response) => {
      this.alertMessage = "Estado de bloqueo cambiado";
      console.log(response);
      this.alertType = 'success';
      this.isAlertVisible = true;
      this.usuarioService.listaSeguidores(this.esPerfilPropio, this.route.snapshot.paramMap.get('id') || '').subscribe((response) => {
        this.seguidores = response;
      });
      this.usuarioService.getPerfilId(idDecrypt).subscribe((response) => {
        this.perfil = response;
      });
    }, (error) => {
      console.error('Error al cambiar el estado de bloqueo:', error);
      this.alertMessage = error.error;
      this.alertType = 'error';
      this.isAlertVisible = true;
    });

    this.usuarioService.isBlocked(idDecrypt).subscribe((response) => {
      isBlocked = response as boolean;
    });

    console.log('Perfil bloqueado:', isBlocked);

    if (isBlocked) {
      this.perfilBloqueado = true;
    }else {
      this.perfilBloqueado = !this.perfilBloqueado;
    }

    this.perfil.bloqueado  = !this.perfil.bloqueado;
    setTimeout(() => {
      this.isAlertVisible = false;
    }, 2000);

  }

  /**
   * Cambia el estado de seguimiento del perfil del usuario.
   */
  toggleSeguirPerfil() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    const idDecrypt = this.encryptService.desencriptar(id);
    this.usuarioService.changeSeguir(idDecrypt).subscribe((response) => {
      this.perfil.siguiendo = !this.perfil.siguiendo;
      this.alertMessage = response;
      this.alertType = 'success';
      this.isAlertVisible = true;
      this.usuarioService.listaSeguidores(this.esPerfilPropio, idDecrypt).subscribe((response) => {
        this.seguidores = response;
      });
      this.usuarioService.getPerfilId(idDecrypt).subscribe((response) => {
        this.perfil = response;
      });
    }, (error) => {
      console.error('Error al cambiar el estado de seguimiento:', error);
      this.alertMessage = error.error;
      this.alertType = 'error';
      this.isAlertVisible = true;
    });

    setTimeout(() => {
      this.isAlertVisible = false;
    }, 2000);
  }

  /**
   * Muestra u oculta la sección de creación de colecciones.
   */
  toggleCrearColeccion() {
    this.mostrarCrearColeccion = !this.mostrarCrearColeccion;
    this.modoEdicionColeccion = false;
    if (this.mostrarCrearColeccion) {
      this.nuevaColeccionTitulo = '';
      this.recetasSeleccionadas.clear();
    }
  }

  /**
   * cambia el estado de selección de una receta en la colección.
   */
  toggleReceta(idReceta: number) {
    if (this.recetasSeleccionadas.has(idReceta)) {
      this.recetasSeleccionadas.delete(idReceta);
    } else {
      this.recetasSeleccionadas.add(idReceta);
    }
  }

  /**
   * Función para guardar una nueva colección de recetas.
   */
  onGuardarColeccion() {
    const titulo = this.coleccionEditando.titulo.trim();

    if (!titulo) {
      this.alertMessage = 'El título es requerido';
      this.alertType = 'error';
      this.isAlertVisible = true;
      setTimeout(() => {
        this.isAlertVisible = false;
      }, 2000);
      return;
    }

    if (this.recetasSeleccionadas.size === 0) {
      this.alertMessage = 'Selecciona al menos una receta';
      this.alertType = 'error';
      this.isAlertVisible = true;
      setTimeout(() => {
        this.isAlertVisible = false;
      }, 2000);
      return;
    }

    const recetasIds = Array.from(this.recetasSeleccionadas);

    this.usuarioService.crearColeccion(titulo,recetasIds).subscribe(
      (response) => {
        this.usuarioService.getPerfil().subscribe((perfilResponse) => {
          this.colecciones = perfilResponse.colecciones;
        this.coleccionesMostradas = this.colecciones.slice(0, this.coleccionesPerPage);

      this.mostrarCrearColeccion = false;
      this.nuevaColeccionTitulo = '';
      this.recetasSeleccionadas.clear();
      this.alertMessage = response;
      this.alertType = 'success';
      this.isAlertVisible = true;

          setTimeout(() => {
            this.isAlertVisible = false;
          }, 2000);
        });
      },
      (error) => {
      console.error('Error al crear la colección:', error);
      this.alertMessage = error.error;
      this.alertType = 'error';
      this.isAlertVisible = true;

      setTimeout(() => {
        this.isAlertVisible = false;
      }, 2000);
  }
    );
  }

  /**
   * Elimina una colección de recetas.
   * @param coleccion
   */
  onEliminarColeccion(coleccion: any) {
    this.usuarioService.eliminarColeccion(coleccion.id).subscribe(
      (response) => {
        this.colecciones = this.colecciones.filter(c => c.id !== coleccion.id);
        this.coleccionesMostradas = this.colecciones.slice(0, this.coleccionesPerPage);
        this.alertMessage = response;
        this.alertType = 'success';
        this.isAlertVisible = true;
      },
      (error) => {
        this.alertMessage = error.error;
        this.isAlertVisible = true
      }
    );
    setTimeout(() => {
      this.isAlertVisible = false;
    }, 2000);
  }

  /**
   * Inicia la edición de una colección de recetas.
   * @param coleccion
   */
  iniciarEdicionColeccion(coleccion: any) {
    this.mostrarEditarColeccion = true;
    this.modoEdicionColeccion = true;
    this.coleccionEditando = { ...coleccion };
    this.recetasSeleccionadas = new Set(coleccion.recetas.map((r: any) => r.idReceta));
  }

  /**
   * Funcion para editar una colección de recetas.
   */
  onEditarColeccion() {
    const titulo = this.coleccionEditando.titulo.trim();
    const recetasIds = Array.from(this.recetasSeleccionadas);

    if (!titulo || recetasIds.length === 0) {
      this.alertMessage = 'El título es requerido y debe seleccionar al menos una receta';
      this.alertType = 'error';
      this.isAlertVisible = true;
      setTimeout(() => {
        this.isAlertVisible = false;
      }, 2000);

      return;
    }
    this.usuarioService.editarColeccion(this.coleccionEditando.id, titulo, recetasIds).subscribe(
      (response) => {
        this.usuarioService.getPerfil().subscribe((perfilResponse) => {
            this.usuarioService.getPerfil().subscribe((perfilResponse) => {
              this.colecciones = perfilResponse.colecciones;
              this.coleccionesMostradas = this.colecciones.slice(0, this.coleccionesPerPage);
            });
          this.alertMessage = response;
          this.alertType = 'success';
          this.isAlertVisible = true;
        });
      },
      (error) => {
        this.alertMessage = error.error;
        this.alertType = 'error';
        this.isAlertVisible = true;
      }
    );
    setTimeout(() => {
      this.isAlertVisible = false;
    }, 2000);

    this.mostrarEditarColeccion = false;
    this.modoEdicionColeccion = false;
    this.coleccionEditando = {};
  }

  /**
   * Muestra u oculta la sección de edición de colecciones.
   */
  toggleEditarColeccion() {
    this.mostrarEditarColeccion = !this.mostrarEditarColeccion;
    this.modoEdicionColeccion = false;
    this.coleccionEditando = {};
  }


  /**
   * Actualiza la lista de recetas guardadas del usuario.
   */
  actualizaGuardados($event: any) {
    this.usuarioService.getPerfil().subscribe((response) => {
      this.recetasGuardadas = response.recetasGuardadas;
      this.recetasGuardadasMostradas = this.recetasGuardadas.slice(0, this.guardadasPerPage);
    });
  }

  /**
   * Funcion para mostrar u ocultar la sección de edición del perfil.
   */
  toggleEditarPerfil() {
    this.editarPerfil = !this.editarPerfil;
  }
  /**
   * Filtra los ingredientes según el término de búsqueda ingresado.
   */
  filtrarIngredientes(event: Event): void {
    const input = event.target as HTMLInputElement;
    const term = input.value.trim().toLowerCase();

    this.ingredientesFiltrados = term === ''
      ? []
      : this.ingredientes.filter(i =>
        i.nombre.toLowerCase().includes(term)
      ).slice(0, 5);
  }

  /**
   * Selecciona un ingrediente y lo agrega a la lista de ingredientes seleccionados.
   * Si ya hay 3 ingredientes seleccionados o el ingrediente ya está seleccionado, no hace nada.
   */
  seleccionarIngrediente(ingrediente: any): void {
    if (this.ingredientesSeleccionados.length >= 3 ||
      this.ingredientesSeleccionados.some(i => i.id === ingrediente.id)) return;

    this.ingredientesSeleccionados.push(ingrediente);
  }

  /**
   * Elimina un ingrediente de la lista de ingredientes seleccionados.
   * @param index Índice del ingrediente a eliminar.
   */
  eliminarIngrediente(index: number): void {
    this.ingredientesSeleccionados.splice(index, 1);
  }

  /**
   * Filtra los alérgenos según el término de búsqueda ingresado.
   */
  esAlergenoSeleccionado(alergeno: any): boolean {
    return this.alergenosSeleccionados.some(a => a.id === alergeno.id);
  }

  /**
   * Selecciona o deselecciona un alérgeno.
   * @param alergeno
   */
  toggleAlergeno(alergeno: any): void {
    const index = this.alergenosSeleccionados.findIndex(a => a.id === alergeno.id);
    index === -1
      ? this.alergenosSeleccionados.push(alergeno)
      : this.alergenosSeleccionados.splice(index, 1);
  }

  /**
   * Valida si hay algún conflicto entre los ingredientes seleccionados y los alérgenos seleccionados.
   */
  validadorConflictoAlergenos(): boolean {
    return this.ingredientesSeleccionados.some(ingrediente =>
      this.alergenosSeleccionados.some(alergeno =>
        alergeno.id === ingrediente.alergenoId
      )
    );
  }

  esIngredienteSeleccionado(ingrediente: any): boolean {
    return this.ingredientesSeleccionados.some(i => i.id === ingrediente.id);
  }

  /**
   * Inicia un chat con el usuario actual.
   */
  iniciarChat() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    const idDecrypt = this.encryptService.desencriptar(id); // Desencripta el ID actual
    const idEncrypt = this.encryptService.encriptar(idDecrypt); // Encripta el ID nuevamente
    this.router.navigate(['/chat', idEncrypt]); // Redirige con el ID encriptado
  }

  /**
   * Muestra u oculta la lista de compra.
   */
  toggleListaCompra() {
    this.mostrarListaCompra = !this.mostrarListaCompra;
  }


  /**
   * Cambia la visibilidad de una receta en el perfil del usuario.
   * @param $event Evento que contiene la información de la receta y su nueva visibilidad.
   */
  onEditarVisibilidad($event: any) {
    if ($event.esVisible == false) {
    this.recetasVisibles = this.recetasVisibles.filter(receta => receta.idReceta !== $event.idReceta);
      this.perfil.numeroRecetas--;
  } else{
    const receta = this.recetas.find(r => r.idReceta === $event.idReceta);
    if (receta) {
      this.recetasVisibles.push(receta);}
      this.perfil.numeroRecetas++;
    }
  }

  /**
   * Muestra una alerta de confirmación para eliminar una receta de la lista de compra.
   * @param idReceta
   */
  mostrarAlertaConfirmarEliminar(idReceta: number) {
    this.mensajeAlertaConfirmar = '¿Estás seguro de que quieres eliminar esta receta de tu lista de la compra?';
    this.accionConfirmada = () => this.eliminarRecetaConfirmada(idReceta);
    this.mostrarAlertaConfirmar = true;
  }

  /**
   * Elimina una receta de la lista de compra del usuario.
   * @param idReceta
   */
  eliminarRecetaConfirmada(idReceta: number) {
    // Limpiar cualquier alerta anterior
    this.alertMessage = '';
    this.alertType = 'success';
    this.isAlertVisible = false;

    this.usuarioService.eliminarRecetaListaCompra(idReceta).subscribe({
      next: () => {
        this.usuarioService.ListaCompraByCooker().subscribe(data => {
          this.recetasGuardadas = data;
          this.recetasGuardadasMostradas = data.slice(0, this.guardadasPerPage);


          this.alertMessage = 'Receta eliminada correctamente.';
          this.alertType = 'success';
          this.isAlertVisible = true;

          setTimeout(() => {
            this.isAlertVisible = false;
          }, 3000);
        });
      },
      error: (err) => {
        console.error('Error al eliminar receta de la lista de compra', err);
        this.alertMessage = 'Error al eliminar la receta.';
        this.alertType = 'error';
        this.isAlertVisible = true;

        setTimeout(() => {
          this.isAlertVisible = false;
        }, 3000);
      }
    });

    this.mostrarAlertaConfirmar = false;
  }

}
