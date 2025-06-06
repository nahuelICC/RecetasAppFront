import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  private apiUrl = '/api/cooker';

  constructor(private http:HttpClient) { }

  /**
   * Obtiene la foto de perfil del cooker.
   */
  getFotoPerfil(): any {
    return this.http.get(`${this.apiUrl}/foto`, { responseType: 'text' });
  }
}
