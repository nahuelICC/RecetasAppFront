import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgForOf, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';

export interface FormOption {
  id: any;
  nombre: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select';
  options?: FormOption[];
  required?: boolean;
  placeholder?: string;
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

export class ModalFormComponent  implements OnInit {

  @Input() isVisible: boolean = true;
  @Input() title: string = 'Formulario';
  @Input() initialData: any | null = null;
  @Input('formConfig') set setFormConfig(config: FormConfig) { // Usar setter para reconstruir el form si la config cambia
    this.currentFormConfig = config;
    this.buildForm();
  }
  currentFormConfig!: FormConfig; // Guardar la config internamente

  @Output() formSubmitted = new EventEmitter<any>();
  @Output() modalClosed = new EventEmitter<void>();

  entityForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // El form se construye cuando setFormConfig es llamado
  }

  buildForm(): void {
    if (!this.currentFormConfig) return;
    const group: any = {};
    this.currentFormConfig.fields.forEach(field => {
      const validators = field.required ? [Validators.required] : [];
      group[field.name] = [this.initialData ? this.initialData[field.name] : '', validators];
    });
    this.entityForm = this.fb.group(group);

    if (this.initialData) {
      this.entityForm.patchValue(this.initialData);
    }
  }

  submitForm(): void {
    if (this.entityForm.valid) {
      this.formSubmitted.emit(this.entityForm.value);
    }
  }

  close(): void {
    this.modalClosed.emit();
  }

}
