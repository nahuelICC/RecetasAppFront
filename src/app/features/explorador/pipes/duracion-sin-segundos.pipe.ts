import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duracionSinSegundos',
  standalone: true
})
export class DuracionSinSegundosPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return value;
    const parts = value.split(':');
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : value;
  }

}
