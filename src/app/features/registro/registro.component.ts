import {ChangeDetectorRef, Component, input, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {BotonComponent} from '../../shared/components/boton/boton.component';
import {RegistroService} from './services/registro.service';
import {IonChip, IonContent, IonIcon, IonLabel} from '@ionic/angular/standalone';


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
    IonContent,
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


  formStep1:FormGroup;
  formStep2:FormGroup;
  formStep3:FormGroup;

  constructor(private fb: FormBuilder, private registroService: RegistroService,private cdr: ChangeDetectorRef) {
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

  validadorCoincideContrasena(form: FormGroup): { [key: string]: any } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  validadorConflictoAlergenos(): boolean {
    return this.ingredientesSeleccionados.some(ingrediente =>
      this.alergenosSeleccionados.some(alergeno => alergeno.id === ingrediente.alergenoId)
    );
  }

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


  nextStep() {
    if (this.currentStep < 4) {
      this.currentStep++;
    } else {
      this.envioFormulario();
    }
  }

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

  isCurrentStepValid(): boolean {
    switch(this.currentStep) {
      case 1: return this.formStep1.valid;
      case 2: return this.formStep2.valid;
      case 3: return this.formStep3.valid && !this.validadorConflictoAlergenos();
      default: return true;
    }
  }

  envioFormulario() {
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
        console.log('Registro exitoso', response);
      },
      error: (error) => {
        console.error('Error en el registro', error);
      }
    });
  }

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


  limpiarVistaPrevia(): void {
    this.imagenPreview = null;
    this.portadaSeleccionada = null;

    this.formStep1.get('fotoPerfil')?.setValue('');

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

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

  seleccionarIngrediente(ingrediente: any): void {
    if (this.ingredientesSeleccionados.length >= 3 ||
      this.ingredientesSeleccionados.some(item => item.id === ingrediente.id)) {
      return;
    }
    this.ingredientesSeleccionados.push(ingrediente);
    this.actualizarIngredientesForm();
    this.cdr.detectChanges();
  }

  eliminarIngrediente(index: number): void {
    this.ingredientesSeleccionados.splice(index, 1);
    this.actualizarIngredientesForm();
  }

  toggleAlergeno(alergeno: any): void {
    const index = this.alergenosSeleccionados.findIndex(a => a.id === alergeno.id);
    index === -1 ? this.alergenosSeleccionados.push(alergeno) : this.alergenosSeleccionados.splice(index, 1);
    this.actualizarAlergenosForm();
    this.cdr.detectChanges();
  }

  actualizarIngredientesForm(): void {
    this.formStep3.get('ingredientesIds')?.setValue(this.ingredientesSeleccionados.map(i => i.id));
  }

  actualizarAlergenosForm(): void {
    this.formStep3.get('alergenosIds')?.setValue(this.alergenosSeleccionados.map(a => a.id));
  }

  esAlergenoSeleccionado(alergeno: any): boolean {
    return this.alergenosSeleccionados.some((a) => a.id === alergeno.id);
  }


}
