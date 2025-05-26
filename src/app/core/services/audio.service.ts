import { Injectable } from '@angular/core';
import { Howl } from 'howler';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private sonidos: { [clave: string]: Howl } = {};

  constructor() {
    this.sonidos['mensaje'] = new Howl({
      src: ['assets/mensajeRecibido.wav'],
      volume: 1.0
    });
  }

  reproducir(sonido: 'mensaje'): void {
    const audio = this.sonidos[sonido];
    if (audio) {
      audio.play();
    } else {
      console.warn(`Sonido "${sonido}" no cargado.`);
    }
  }
}
