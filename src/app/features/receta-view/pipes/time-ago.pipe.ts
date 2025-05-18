import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | { year: number, month: number, day: number }): string {
    if (!value) return '';

    if (typeof value === 'object' && 'year' in value) {
      const { year, month, day } = value;
      const fechaStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T00:00:00`;
      value = fechaStr;
    }

    // Convertir a objeto Date
    const fecha = new Date(value);
    if (isNaN(fecha.getTime())) {
      console.error('Fecha inválida:', value);
      return '';
    }

    const ahora = new Date();
    const diferenciaMilisegundos = ahora.getTime() - fecha.getTime();
    const diferenciaSegundos = Math.floor(diferenciaMilisegundos / 1000);

    if (diferenciaSegundos < 60) {
      return 'Hace unos segundos';
    }

    const diferenciaMinutos = Math.floor(diferenciaSegundos / 60);
    if (diferenciaMinutos < 60) {
      return diferenciaMinutos === 1 ? 'Hace 1 minuto' : `Hace ${diferenciaMinutos} minutos`;
    }

    const diferenciaHoras = Math.floor(diferenciaMinutos / 60);
    if (diferenciaHoras < 24) {
      return diferenciaHoras === 1 ? 'Hace 1 hora' : `Hace ${diferenciaHoras} horas`;
    }

    const diferenciaDias = Math.floor(diferenciaHoras / 24);
    if (diferenciaDias === 1) {
      return 'Ayer';
    } else if (diferenciaDias < 7) {
      return `Hace ${diferenciaDias} días`;
    } else if (diferenciaDias < 30) {
      const semanas = Math.floor(diferenciaDias / 7);
      return semanas === 1 ? 'Hace 1 semana' : `Hace ${semanas} semanas`;
    } else if (diferenciaDias < 365) {
      const meses = Math.floor(diferenciaDias / 30);
      return meses === 1 ? 'Hace 1 mes' : `Hace ${meses} meses`;
    } else {
      const años = Math.floor(diferenciaDias / 365);
      return años === 1 ? 'Hace 1 año' : `Hace ${años} años`;
    }
  }
}