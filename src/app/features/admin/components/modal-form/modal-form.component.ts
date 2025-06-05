import {Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges} from '@angular/core'; // Añadido OnChanges, SimpleChanges
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgForOf, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import {AlertInfoComponent} from '../../../../shared/components/alert-info/alert-info.component';


export interface FormOption {
  value: any;
  label: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'radio';
  options?: FormOption[];
  required?: boolean;
  placeholder?: string;
  min?: number;
  step?: number;
  disabledOnEdit?: boolean;
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
    NgSwitchCase,
    AlertInfoComponent
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
    if (!this.currentFormConfig || !this.fb) {
      return;
    }

    const group: any = {};
    // Determinar si estamos en modo edición (asumiendo que `initialData` con un `id` significa edición)
    const isEditMode = !!(this.initialData && this.initialData.id !== undefined && this.initialData.id !== null);

    console.log('[ModalForm] buildForm - Modo Edición:', isEditMode, 'Initial Data:', this.initialData);


    this.currentFormConfig.fields.forEach(field => {
      const validators = field.required ? [Validators.required] : [];
      let valueForControl: any = field.type === 'select' ? null : '';

      if (this.initialData && this.initialData.hasOwnProperty(field.name)) {
        valueForControl = this.initialData[field.name];
        if (field.type === 'select' && valueForControl === undefined) {
          valueForControl = null;
        }
      }

      // ****** LÓGICA PARA DESHABILITAR EL CAMPO ******
      const isDisabled = isEditMode && field.disabledOnEdit === true;
      // ************************************************

      group[field.name] = [{
        value: valueForControl,
        disabled: isDisabled // Aplicar el estado 'disabled' al crear el control
      }, validators];

      console.log(`[ModalForm] buildForm - Campo '${field.name}': Valor inicial:`, valueForControl, `Deshabilitado: ${isDisabled}`);
    });

    this.entityForm = this.fb.group(group);
    console.log('[ModalForm] buildForm - Formulario CREADO/ACTUALIZADO. Valor:', this.entityForm.getRawValue());
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
