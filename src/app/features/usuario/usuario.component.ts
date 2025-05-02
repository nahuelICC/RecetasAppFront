import {ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {IonIcon, IonInfiniteScroll, IonInfiniteScrollContent} from '@ionic/angular/standalone';
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
    IonInfiniteScrollContent
  ]
})
export class UsuarioComponent  implements OnInit {

  perfil: any;
  activeTab: string = 'recetas';
  recetas: any[] = [];
  colecciones: any[] = [];
  recetasGuardadas: any[] = [];
  imagenPerfil: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
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
  recetasPage = 1;
  recetasPerPage = 9;
  recetasGuardadasMostradas: any[] = [];
  guardadasPage = 1;
  guardadasPerPage = 9;
  coleccionesMostradas: any[] = [];
  coleccionesPage = 1;
  coleccionesPerPage = 4;



  constructor(private usuarioService:UsuarioService,private headerService: HeaderService,private route: ActivatedRoute,private authService: AuthService,private zone: NgZone,private fb: FormBuilder, private router:Router) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.idPropietario = this.authService.getUserId() || 0;
    if (id && id !== this.idPropietario.toString()) {
      this.usuarioService.getPerfilId(id).subscribe((response) => {
        this.perfil = response;
        this.recetas = response.recetas;
        this.colecciones = response.colecciones;

        this.recetasMostradas = this.recetas.slice(0, this.recetasPerPage);
        this.coleccionesMostradas = this.colecciones.slice(0, this.coleccionesPerPage);
      });
      this.esPerfilPropio = false;
    } else {
      this.esPerfilPropio = true;
      this.usuarioService.getPerfil().subscribe((response) => {
        this.perfil = response;
        this.recetas = response.recetas;
        this.colecciones = response.colecciones;
        this.recetasGuardadas = response.recetasGuardadas;

        this.recetasMostradas = this.recetas.slice(0, this.recetasPerPage);
        this.coleccionesMostradas = this.colecciones.slice(0, this.coleccionesPerPage);
        this.recetasGuardadasMostradas = this.recetasGuardadas.slice(0, this.guardadasPerPage);
      });
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

    this.usuarioService.listaSeguidos(this.esPerfilPropio, this.route.snapshot.paramMap.get('id') || '').subscribe((response) => {
      this.seguidos = response;
    });

    this.usuarioService.listaSeguidores(this.esPerfilPropio, this.route.snapshot.paramMap.get('id') || '').subscribe((response) => {
      this.seguidores = response;
    });

    this.headerService.getFotoPerfil().subscribe((response: any) => {
      if (response !== 'sin foto') {
        this.imagenPerfil = response;
      }
    });
  }

  passwordsIguales(form: FormGroup) {
    const nueva = form.get('nueva')?.value;
    const repetir = form.get('repetir')?.value;
    return nueva === repetir ? null : { noCoinciden: true };
  }

  get nuevaContrasena() {
    return this.cambioContrasenaForm.get('nueva');
  }

  onGuardarContrasena() {
    if (this.cambioContrasenaForm.valid) {
      this.showConfirmPassword = false;
      console.log('Formulario válido:', this.cambioContrasenaForm.value);
      this.usuarioService.cambiarContrasena(this.cambioContrasenaForm.value).subscribe(
        (response) => {
          console.log(response);
          this.alertMessage = response;
          this.alertType = 'success';
          this.isAlertVisible = true;
        },
        (error) => {
          console.error('Error al cambiar la contraseña:', error);
          this.alertMessage = error.error;
          this.isAlertVisible = true;
          this.alertType = 'error';
        }
      );
      this.mostrandoCambioContrasena = false;
      this.cambioContrasenaForm.reset();

      setTimeout(() => {
        this.isAlertVisible = false;
      }, 2000);
    }
  }


  toggleEditarPerfil() {
    if (this.editandoPerfil) {
      this.guardarCambios();
    } else {
      this.perfilOriginal = { ...this.perfil };
    }
    this.editandoPerfil = !this.editandoPerfil;
  }

  guardarCambios() {
    this.datosEdicion = {
      nombre: this.perfil.nombre,
      apellidos: this.perfil.apellidos,
      descripcion: this.perfil.descripcion
    };

    if (!this.datosEdicion.nombre || !this.datosEdicion.apellidos || !this.datosEdicion.descripcion) {
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
      this.editandoPerfil = false;
      this.alertMessage = response;
      this.alertType = 'success';
      this.isAlertVisible = true;
    }, (error) => {
      console.error('Error al guardar los cambios:', error);
      this.perfil = this.perfilOriginal;
      this.editandoPerfil = false;
      this.alertMessage = error.error;
      this.isAlertVisible = true;
      this.alertType = 'error';
    });

    setTimeout(() => {
      this.isAlertVisible = false;
    }, 2000);

}

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const selectedFile = input.files[0];
      const formData = new FormData();
      formData.append('fotoPerfil', selectedFile);

      this.usuarioService.subirFotoPerfil(formData).subscribe(
        (response) => {
          console.log(response);
          this.imagenPerfil = response.urlFoto;
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

  toggleSeguidos(): void {
    this.mostrarSeguidos = !this.mostrarSeguidos;
  }

  toggleSeguidores(): void {
    this.mostrarSeguidores = !this.mostrarSeguidores;
  }

  redireccionarPerfil(id: string): void {
    this.zone.run(() => {
      this.router.navigate(['/perfil', id]).then(() => {
        window.location.reload();
      });
    });
  }

  loadMoreRecetas(event: any) {
    const startIndex = this.recetasMostradas.length;
    const endIndex = startIndex + this.recetasPerPage;
    const next = this.recetas.slice(startIndex, endIndex);

    this.recetasMostradas = [...this.recetasMostradas, ...next];
    event.target.complete();

    // Deshabilitar si no hay más datos
    if (this.recetasMostradas.length >= this.recetas.length) {
      event.target.disabled = true;
    }
  }

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


}
