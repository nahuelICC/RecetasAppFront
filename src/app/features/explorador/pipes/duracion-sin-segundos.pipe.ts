import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duracionSinSegundos',
  standalone: true
})
export class DuracionSinSegundosPipe implements PipeTransform {
  /**
   * Transforma una cadena de duración en formato "HH:mm:ss" a "HH:mm".
   * Si la cadena no tiene segundos, se devuelve tal cual.
   * @param value La cadena de duración a transformar.
   * @returns La cadena transformada sin los segundos.
   */
  transform(value: string): string {
    if (!value) return value;
    const parts = value.split(':');
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : value;
  }

}
