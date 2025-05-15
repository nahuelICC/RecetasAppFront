import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EncryptService {

  encriptarInicio(texto: string): string {
    return btoa(texto)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  desencriptarInicio(textoCodificado: string): string {
    textoCodificado = textoCodificado
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    while (textoCodificado.length % 4) {
      textoCodificado += '=';
    }

    return atob(textoCodificado);
  }

  encriptar(texto: string): string {
    const nonce = this.generarNonce(8);
    const textoCombinado = `${texto}|${nonce}`;
    return this.encriptarInicio(textoCombinado);
  }

  desencriptar(textoCodificado: string): string {
    const textoDecodificado = this.desencriptarInicio(textoCodificado);
    return textoDecodificado.split('|')[0];
  }


  private generarNonce(longitud: number): string {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: longitud }, () =>
      caracteres[Math.floor(Math.random() * caracteres.length)]
    ).join('');
  }
}
