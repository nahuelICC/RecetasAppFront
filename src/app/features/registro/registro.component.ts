import {Component, input, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {BotonComponent} from '../../shared/components/boton/boton.component';
import {RegistroService} from './services/registro.service';


@Component({
  selector: 'app-registro',
  imports: [
    NgClass,
    NgIf,
    NgForOf,
    BotonComponent,
    ReactiveFormsModule,
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

  formStep1;
  formStep2;
  formStep3;

  constructor(private fb: FormBuilder, private registroService: RegistroService) {
    this.formStep1 = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8) , Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)]],
      confirmPassword: ['', Validators.required],
      fotoPerfil: ['']
    });

    this.formStep2 = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      fecha: ['', [Validators.required, this.fechaValidator]],
      descripcionBreve: [''],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    });

    this.formStep3 = this.fb.group({
      telefono: [''],
      direccion: ['']
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

  nextStep() {
    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isCurrentStepValid(): boolean {
    switch(this.currentStep) {
      case 1: return this.formStep1.valid;
      case 2: return this.formStep2.valid;
      case 3: return this.formStep3.valid;
      default: return true;
    }
  }

  submitForm() {
    // Lógica para enviar el formulario completo
    const formData = {
      ...this.formStep1.value,
      ...this.formStep2.value,
      ...this.formStep3.value
    };
    console.log(formData);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.limpiarVistaPrevia();
      return;
    }

    // Guarda el archivo seleccionado
    this.portadaSeleccionada = input.files[0];

    // Crea la vista previa
    const reader = new FileReader();
    reader.onload = () => {
      this.imagenPreview = reader.result as string;
    };
    reader.readAsDataURL(this.portadaSeleccionada);

    // Actualiza el valor del FormControl
    this.formStep1.get('fotoPerfil')?.setValue(this.portadaSeleccionada.name);
  }

  limpiarVistaPrevia(): void {
    this.imagenPreview = null;
    this.portadaSeleccionada = null;

    // Limpiar el valor del FormControl
    this.formStep1.get('fotoPerfil')?.setValue('');

    // Limpiar el input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }



  fechaValidator(control: AbstractControl): { [key: string]: any } | null {
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



}
