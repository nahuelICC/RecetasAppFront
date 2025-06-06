import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BotonComponent } from '../boton/boton.component';
import { NgClass, NgIf } from '@angular/common';
import {IonIcon} from "@ionic/angular/standalone";

/**
 * Componente de alerta de confirmación
 */
@Component({
  selector: 'app-alert-confirmar',
  imports: [
    BotonComponent,
    NgClass,
    NgIf,
    IonIcon
  ],
  templateUrl: './alert-confirmar.component.html',
  standalone: true,
  styleUrls: ['./alert-confirmar.component.css']
})
export class AlertConfirmarComponent {
  @Input() message: string = '¿Estás seguro?';
  @Input() confirmLabel: string = 'Sí';
  @Input() showCancelButton: boolean = true;
  @Input() showIcon: boolean = true;
  @Output() confirm: EventEmitter<void> = new EventEmitter<void>();
  @Output() cancel: EventEmitter<void> = new EventEmitter<void>();


  /**
  * Emitir evento de confirmación
   */
  onConfirm(): void {
    this.confirm.emit();
  }

  /**
  * Emitir evento de cancelación
   */
  onCancel(): void {
    this.cancel.emit();
  }
}
