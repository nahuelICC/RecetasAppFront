import {Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges} from '@angular/core'; // Añadido OnChanges, SimpleChanges
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgForOf, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';


export interface FormOption {
  value: any;
  label: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select';
  options?: FormOption[];
  required?: boolean;
  placeholder?: string;
  min?: number;
  step?: number;
}

export interface FormConfig {
  fields: FormField[];
}

@Component({
  selector: 'app-modal-form',
  templateUrl: './modal-form.component.html',
  styleUrls: ['./modal-form.component.css'],
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    NgForOf,
    NgSwitch,
    NgSwitchCase
  ]
})
export class ModalFormComponent implements OnInit, OnChanges { // Implementa OnChanges

  @Input() isVisible: boolean = true;
  @Input() title: string = 'Formulario';
  @Input() initialData: any | null = null;
  // El setter ya llama a buildForm(), lo cual es bueno si formConfig puede cambiar.
  @Input('formConfig') set setFormConfig(config: FormConfig) {
    this.currentFormConfig = config;
    if (this.fb) { // Asegurarse que fb (FormBuilder) está disponible
      this.buildForm();
    }
  }
  currentFormConfig!: FormConfig;

  @Output() formSubmitted = new EventEmitter<any>();
  @Output() modalClosed = new EventEmitter<void>();

  entityForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    // Es mejor inicializar el form group aquí para que exista desde el principio
    this.entityForm = this.fb.group({});
  }

  ngOnInit(): void {
    // Si currentFormConfig ya está seteado por el input setter, buildForm ya se llamó.
    // Si no, y necesitas construirlo con el valor inicial de currentFormConfig:
    if (this.currentFormConfig && !this.entityForm.controls[this.currentFormConfig.fields[0]?.name]) { // Comprueba si el form no está construido
      this.buildForm();
    }
  }

  // ngOnChanges para manejar cambios en initialData después de que el form ya está construido
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && this.entityForm && this.currentFormConfig) {
      // Si initialData cambia y el formulario ya existe,
      // vuelve a construir o parchea los valores.
      // La reconstrucción es más simple si la estructura de initialData
      // puede influir en qué controles tener (aunque no es el caso aquí).
      // Un patchValue es más eficiente si solo los valores cambian.
      if (this.initialData) {
        this.entityForm.patchValue(this.initialData);
      } else {
        this.entityForm.reset(); // Resetea a los valores por defecto o vacíos
        // Podrías querer resetear a los valores por defecto definidos en buildForm
        // this.buildForm(); // Si quieres reconstruir con defaults
      }
    }
    // Si formConfig cambia y el componente ya está inicializado, el setter se encarga.
  }

  buildForm(): void {
    if (!this.currentFormConfig || !this.fb) return; // Comprobar fb también

    const group: any = {};
    this.currentFormConfig.fields.forEach(field => {
      const validators = field.required ? [Validators.required] : [];
      let initialValueForControl: any;

      // Determinar el valor inicial del control
      if (this.initialData && this.initialData.hasOwnProperty(field.name)) {
        initialValueForControl = this.initialData[field.name];
      } else {
        // Default para diferentes tipos si no hay initialData o la propiedad no existe
        initialValueForControl = field.type === 'select' ? null : ''; // null para selects, '' para otros
      }

      // Asegurar que si el valor es undefined para un select, se use null
      if (field.type === 'select' && initialValueForControl === undefined) {
        initialValueForControl = null;
      }
      // Para números, si el valor es '' o undefined y no es requerido, podría ser null o 0
      if (field.type === 'number' && (initialValueForControl === '' || initialValueForControl === undefined) && !field.required) {
        initialValueForControl = null;
      }


      group[field.name] = [initialValueForControl, validators];
    });

    // Si el formulario ya existe, podemos actualizar sus controles en lugar de reemplazar el FormGroup
    // Esto es mejor si tienes suscripciones a valueChanges en el formulario.
    // Pero para este caso, reemplazar el grupo si la config cambia es más simple via el setter.
    this.entityForm = this.fb.group(group);

    // El patchValue después de crear el grupo con valores iniciales es redundante
    // si los valores iniciales ya se tomaron de initialData.
    // Sin embargo, si initialData llega después de la primera construcción del form via formConfig,
    // un patchValue (posiblemente en ngOnChanges) es necesario.
    // La lógica actual con el setter de formConfig y el ngOnChanges para initialData debería cubrirlo.
  }

  submitForm(): void {
    if (this.entityForm.valid) {
      this.formSubmitted.emit(this.entityForm.value);
    } else {
      // Marcar todos los campos como "touched" para mostrar errores de validación
      Object.values(this.entityForm.controls).forEach(control => {
        control.markAsTouched();
      });
      console.warn("Formulario inválido:", this.entityForm.value);
    }
  }

  close(): void {
    this.modalClosed.emit();
  }
}
