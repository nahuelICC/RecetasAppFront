import {Component, Input} from '@angular/core';
import {NgStyle} from '@angular/common';

/**
 * Componente Boton
 */
@Component({
  selector: 'app-boton',
  imports: [
    NgStyle
  ],
  templateUrl: './boton.component.html',
  standalone: true,
  styleUrl: './boton.component.css'
})
export class BotonComponent {
  @Input() size: 'small' | 'medium' | 'large' | 'no w-full' = 'medium';
  @Input() disabled: boolean = false;
  @Input() label: string = 'Button';
  @Input() color: string = 'var(--color-verde-boton)';


  /**
  *Metodo para obtener la clase de tamaño
   */

  getSizeClass(): string {
    switch (this.size) {
      case 'small':
        return 'px-4 py-2 text-sm md:w-48 sm:w-30 w-full';
      case 'large':
        return 'sm:w-72 py-2 px-3 text-lg w-full';
      case 'no w-full':
        return 'px-6 py-2 text-base';
      default:
        return 'px-6 py-2 text-base w-full';
    }
  }



}
