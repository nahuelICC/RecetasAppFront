import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  private apiUrl = 'https://cookersback.onrender.com/cooker';

  constructor(private http:HttpClient) { }

  /**
   * Obtiene la foto de perfil del cooker.
   */
  getFotoPerfil(): any {
    return this.http.get(`${this.apiUrl}/foto`, { responseType: 'text' });
  }
}
