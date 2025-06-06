import { Injectable } from '@angular/core';
import { Howl } from 'howler';

/**
 * Servicio para manejar la reproducción de sonidos en los mensajes.
 */
@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private sonidos: { [clave: string]: Howl } = {};
  private initialized = false;

  constructor() {}

  private initialize(): void {
    if (this.initialized) return;

    // Initialize sounds after a user gesture
    this.sonidos['mensaje'] = new Howl({
      src: ['assets/mensajeRecibido.wav'],
      volume: 1.0
    });

    this.initialized = true;
  }

  /**
   * Endpoint que reproduce un sonido específico.
   * @param sonido
   */
  reproducir(sonido: 'mensaje'): void {
    this.initialize(); // Ensure sounds are initialized
    const audio = this.sonidos[sonido];
    if (audio) {
      audio.play();
    } else {
      console.warn(`Sonido "${sonido}" no cargado.`);
    }
  }
}
