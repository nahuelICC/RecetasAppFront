import { Injectable } from '@angular/core';


/**
 * Servicio para encriptar y desencriptar texto.
 */
@Injectable({
  providedIn: 'root',
})
export class EncryptService {

  /**
   * Endpoint que encripta un texto utilizando Base64 y un nonce aleatorio.
   * @param texto
   */
  encriptarInicio(texto: string): string {
    return btoa(texto)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Endpoint que desencripta un texto codificado en Base64.
   * @param textoCodificado
   */
  desencriptarInicio(textoCodificado: string): string {
    textoCodificado = textoCodificado
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    while (textoCodificado.length % 4) {
      textoCodificado += '=';
    }

    return atob(textoCodificado);
  }

  /**
   * Endpoint que encripta un texto combinando el texto original con un nonce aleatorio.
   * @param texto
   */
  encriptar(texto: string): string {
    const nonce = this.generarNonce(8);
    const textoCombinado = `${texto}|${nonce}`;
    return this.encriptarInicio(textoCombinado);
  }

  /**
   * Endpoint que desencripta un texto codificado, extrayendo el texto original y descartando el nonce.
   * @param textoCodificado
   */
  desencriptar(textoCodificado: string): string {
    const textoDecodificado = this.desencriptarInicio(textoCodificado);
    return textoDecodificado.split('|')[0];
  }


  /**
   * Endpoint que genera un nonce aleatorio de la longitud especificada.
   * @param longitud
   * @private
   */
  private generarNonce(longitud: number): string {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: longitud }, () =>
      caracteres[Math.floor(Math.random() * caracteres.length)]
    ).join('');
  }
}
