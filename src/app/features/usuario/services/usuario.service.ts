import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = '/api/cooker';
  private apiUrlUsuario = '/api/usuario';


  constructor(private http: HttpClient) { }

  getPerfil() {
    return this.http.get<any>(`${this.apiUrl}/perfil`);
  }

  getPerfilId(id: string) {
    return this.http.get<any>(`${this.apiUrl}/perfil/${id}`);
  }

  editarPerfil(datosEdicion: any) {
    return this.http.put(`${this.apiUrl}/perfil`, datosEdicion, { responseType: 'text' });
  }

  cambiarContrasena(datos: any) {
    return this.http.put(`${this.apiUrlUsuario}/cambiarPassword`, datos, { responseType: 'text' });
  }

  subirFotoPerfil(formData: FormData) {
    return this.http.put<any>(`${this.apiUrlUsuario}/cambioImagen`, formData);
  }

  listaSeguidos(esPerfilPropio: boolean = false, id: string = '') {
    return this.http.get<any>(`${this.apiUrl}/seguidos`, {
      params: {
        esPerfilPropio: esPerfilPropio.toString(),
        id
      }
    });
  }

  listaSeguidores(esPerfilPropio: boolean = false, id: string = '') {
    return this.http.get<any>(`${this.apiUrl}/seguidores`, {
      params: {
        esPerfilPropio: esPerfilPropio.toString(),
        id
      }
    });
  }
}
