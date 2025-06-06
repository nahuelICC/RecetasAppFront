import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {BotonComponent} from '../../shared/components/boton/boton.component';
import {RegistroService} from './services/registro.service';
import {IonChip,IonIcon, IonLabel} from '@ionic/angular/standalone';
import {AlertInfoComponent, AlertType} from '../../shared/components/alert-info/alert-info.component';
import {AlertConfirmarComponent} from '../../shared/components/alert-confirmar/alert-confirmar.component';
import {Router} from '@angular/router';
import {PantallaCargaComponent} from '../../shared/components/pantalla-carga/pantalla-carga.component';

/**
 * Componente de registro de usuario.
 */
@Component({
  selector: 'app-registro',
  imports: [
    NgClass,
    NgIf,
    NgForOf,
    BotonComponent,
    ReactiveFormsModule,
    IonIcon,
    IonChip,
    IonLabel,
    AlertInfoComponent,
    AlertConfirmarComponent,
    PantallaCargaComponent,
  ],
  templateUrl: './registro.component.html',
  standalone: true,
  styleUrl: './registro.component.css'
})
export class RegistroComponent implements OnInit {
  ingredientes: any[] = [];
  alergenos: any[] = [];
  showPassword: boolean = false; // Controla si la contraseña principal es visible
  showConfirmPassword: boolean = false; // Controla si la confirmación de contraseña es visible
  currentStep = 1;
  portadaSeleccionada: File | null = null;
  imagenPreview: string | null = null;
  ingredientesFiltrados: any[] = [];
  ingredientesSeleccionados: any[] = [];
  alergenosSeleccionados: any[] = [];
  alertMessage: string = '';
  alertType: AlertType = 'success';
  isAlertVisible: boolean = false;
  showConfirmRegistro: boolean = false;
  showAlertConfirmar: boolean = false;
  isloading: boolean = false;


  formStep1:FormGroup;
  formStep2:FormGroup;
  formStep3:FormGroup;

  constructor(private fb: FormBuilder, private registroService: RegistroService,private cdr: ChangeDetectorRef,private router: Router,) {
    this.formStep1 = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
      ]],
      confirmPassword: ['', Validators.required],
      fotoPerfil: ['']
    },
      { validators: this.validadorCoincideContrasena });

    this.formStep2 = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      fecha: ['', [Validators.required, this.validadorFecha]],
      descripcionBreve: [''],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    });

    this.formStep3 = this.fb.group({
      ingredientesIds: [[]],
      alergenosIds: [[]]
    });
  }

  ngOnInit(): void {
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

  /**
   * Validador personalizado para verificar que las contraseñas coincidan.
   * @param form FormGroup del formulario de registro.
   * @returns Un objeto con el error si las contraseñas no coinciden, o null si son válidas.
   */
  validadorCoincideContrasena(form: FormGroup): { [key: string]: any } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  /**
   * Validador personalizado para verificar conflictos entre alérgenos e ingredientes seleccionados.
   * @returns true si hay un conflicto, false en caso contrario.
   */
  validadorConflictoAlergenos(): boolean {
    return this.ingredientesSeleccionados.some(ingrediente =>
      this.alergenosSeleccionados.some(alergeno => alergeno.id === ingrediente.alergenoId)
    );
  }

  /**
   * Validador personalizado para verificar la fecha de nacimiento.
   * Debe ser una fecha válida, no puede ser posterior a hoy y debe tener al menos 16 años.
   * @param control AbstractControl del formulario.
   * @returns Un objeto con el error si la fecha es inválida, o null si es válida.
   */
  validadorFecha(control: AbstractControl): { [key: string]: any } | null {
    const fechaNacimiento = new Date(control.value);
    const hoy = new Date();
    const edadMinima = 16;
    const fechaMinima = new Date(hoy.getFullYear() - edadMinima, hoy.getMonth(), hoy.getDate());

    if (fechaNacimiento > hoy) {
      return {'fechaInvalida': 'La fecha no puede ser posterior a hoy'};
    }

    if (fechaNacimiento > fechaMinima) {
      return {'edadInvalida': `Debe tener al menos ${edadMinima} años`};
    }

    return null;
  }


  /**
   * Avanza al siguiente paso del formulario de registro.
   * Si se llega al último paso, muestra la confirmación de registro.
   */
  nextStep() {
    if (this.currentStep < 4) {
      this.currentStep++;
    } else {
      this.showConfirmRegistro = true;
    }
  }

  /**
   * Retrocede al paso anterior del formulario de registro.
   * Si se regresa al primer paso, se actualiza la imagen de portada si está disponible.
   */
  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;

      if (this.currentStep === 1) {
        const fotoData = this.formStep1.get('fotoPerfil')?.value;
        if (fotoData) {
          this.portadaSeleccionada = fotoData.file;
          this.imagenPreview = fotoData.preview;
        }
      }
    }
  }

  /**
   * Verifica si el formulario del paso actual es válido.
   * @returns true si el formulario es válido, false en caso contrario.
   */
  isCurrentStepValid(): boolean {
    switch(this.currentStep) {
      case 1: return this.formStep1.valid;
      case 2: return this.formStep2.valid;
      case 3: return this.formStep3.valid && !this.validadorConflictoAlergenos();
      default: return true;
    }
  }

  /**
   * Envía el formulario de registro.
   * Valida los datos, crea un FormData y envía la solicitud al servicio de registro.
   * Muestra mensajes de éxito o error según la respuesta del servidor.
   */
  envioFormulario() {
    this.isloading = true;
    this.cdr.detectChanges();
    console.log(this.isloading);
    this.showConfirmRegistro = false;
    const formData = new FormData();

    const datos = {
      username: this.formStep1.get('username')?.value,
      email: this.formStep1.get('email')?.value,
      password: this.formStep1.get('password')?.value,
      confirmPassword: this.formStep1.get('confirmPassword')?.value,
      nombre: this.formStep2.get('nombre')?.value,
      apellidos: this.formStep2.get('apellidos')?.value,
      fecha: this.formStep2.get('fecha')?.value,
      telefono: this.formStep2.get('telefono')?.value,
      descripcionBreve: this.formStep2.get('descripcionBreve')?.value || '',
      ingredientesIds: this.formStep3.get('ingredientesIds')?.value,
      alergenosIds: this.formStep3.get('alergenosIds')?.value
    };

    formData.append('datos', JSON.stringify(datos));

    if (this.portadaSeleccionada) {
      formData.append('fotoPerfil', this.portadaSeleccionada);
    }

    this.registroService.registrarUsuario(formData).subscribe({
      next: (response) => {
        this.alertMessage = "Usuario registrado correctamente. Revise su correo para activar su cuenta";
        this.isloading = false;
        this.showAlertConfirmar = true;
      },
      error: (error) => {
        this.alertMessage = error.error.message || 'Error al registrar el usuario';
        this.alertType = "error";
        this.isloading = false;
        this.isAlertVisible = true;
      }
    });
    setTimeout(() => {
      this.isAlertVisible = false;
    }, 2000);
  }

  /**
   * Muestra la vista previa de la imagen seleccionada para el perfil.
   */
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.limpiarVistaPrevia();
      return;
    }

    this.portadaSeleccionada = input.files[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.imagenPreview = reader.result as string;

      this.formStep1.get('fotoPerfil')?.setValue({
        file: this.portadaSeleccionada,
        preview: this.imagenPreview
      });
    };
    reader.readAsDataURL(this.portadaSeleccionada);
  }


  /**
   * Limpia la vista previa de la imagen seleccionada y el campo del formulario.
   */
  limpiarVistaPrevia(): void {
    this.imagenPreview = null;
    this.portadaSeleccionada = null;

    this.formStep1.get('fotoPerfil')?.setValue('');

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Filtra los ingredientes según el término de búsqueda ingresado.
   * Muestra solo los primeros 5 resultados.
   * @param event Evento de entrada del campo de búsqueda.
   */
  filtrarIngredientes(event: Event): void {
    const input = event.target as HTMLInputElement;
    const term = input.value.trim().toLowerCase();

    if (term === '') {
      this.ingredientesFiltrados = [];
      return;
    }

    this.ingredientesFiltrados = this.ingredientes
      .filter(ingrediente => ingrediente.nombre.toLowerCase().includes(term))
      .slice(0, 5); // Mostrar solo los primeros 5 resultados
  }

  /**
   * Selecciona un ingrediente de la lista filtrada.
   * Si ya se han seleccionado 3 ingredientes o el ingrediente ya está seleccionado, no hace nada.
   * @param ingrediente El ingrediente a seleccionar.
   */
  seleccionarIngrediente(ingrediente: any): void {
    if (this.ingredientesSeleccionados.length >= 3 ||
      this.ingredientesSeleccionados.some(item => item.id === ingrediente.id)) {
      return;
    }
    this.ingredientesSeleccionados.push(ingrediente);
    this.actualizarIngredientesForm();
    this.cdr.detectChanges();
  }

  /**
   * Elimina un ingrediente seleccionado.
   * @param index El índice del ingrediente a eliminar.
   */
  eliminarIngrediente(index: number): void {
    this.ingredientesSeleccionados.splice(index, 1);
    this.actualizarIngredientesForm();
  }

  /**
   * Selecciona o deselecciona un alérgeno.
   * Si el alérgeno ya está seleccionado, lo elimina; si no, lo agrega a la lista de seleccionados.
   * @param alergeno El alérgeno a seleccionar o deseleccionar.
   */
  toggleAlergeno(alergeno: any): void {
    const index = this.alergenosSeleccionados.findIndex(a => a.id === alergeno.id);
    index === -1 ? this.alergenosSeleccionados.push(alergeno) : this.alergenosSeleccionados.splice(index, 1);
    this.actualizarAlergenosForm();
    this.cdr.detectChanges();
  }

  /**
   * Actualiza el formulario con los IDs de los ingredientes seleccionados.
   */
  actualizarIngredientesForm(): void {
    this.formStep3.get('ingredientesIds')?.setValue(this.ingredientesSeleccionados.map(i => i.id));
  }

  /**
   * Actualiza el formulario con los IDs de los alérgenos seleccionados.
   */
  actualizarAlergenosForm(): void {
    this.formStep3.get('alergenosIds')?.setValue(this.alergenosSeleccionados.map(a => a.id));
  }

  /**
   * Verifica si un ingrediente está seleccionado.
   * @param ingrediente El ingrediente a verificar.
   * @returns true si el ingrediente está seleccionado, false en caso contrario.
   */
  esAlergenoSeleccionado(alergeno: any): boolean {
    return this.alergenosSeleccionados.some((a) => a.id === alergeno.id);
  }

  /**
   * Cierra la alerta de confirmación de registro.
   */
  onConfirm() {
    this.showAlertConfirmar = false;
    this.router.navigate(['login']);
  }


}
