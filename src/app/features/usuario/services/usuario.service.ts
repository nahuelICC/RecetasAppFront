import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ListaCompraDTO} from '../models/ListaCompraDTO';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = '/api/cooker';
  private apiUrlUsuario = '/api/usuario';
  private apiUrlReceta = '/api/receta';
  private apiUrlColeccion = '/api/coleccion';
  private apiUrlListaCompra = '/api/listaCompra';



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

  editarVisibilidadReceta(idReceta: number, esVisible: boolean) {
    return this.http.put(`${this.apiUrlReceta}/visibilidad`, null, {
      params: {
        recetaId: idReceta.toString(),
        visibilidad: esVisible.toString()
      }
    });
  }

  editarVisibilidadColeccion(idColeccion: number, esVisible: boolean) {
    return this.http.put(`${this.apiUrlColeccion}/visibilidad`, null, {
      params: {
        id: idColeccion.toString(),
        visibilidad: esVisible.toString()
      }
    });
  }

  perfilBloqueado(id:string) {
    return this.http.get(`${this.apiUrl}/perfilBloqueado`, {
    params: {
      idCooker: id
    }
    });
  }

  fotoPerfilVisita(id:string) {
    return this.http.get(`${this.apiUrl}/foto/${id}`,  {responseType: 'text'});
  }

  changeBloqueo(id: string) {
    const params = new HttpParams().set('idCooker', id);
    return this.http.post(`${this.apiUrl}/bloquear`, null, {
      params: params,
      responseType: 'text'
    });
  }

  changeSeguir(id: string) {
    const params = new HttpParams().set('idCooker', id);
    return this.http.post(`${this.apiUrl}/seguir`, null, {
      params: params,
      responseType: 'text'
    });
  }

  crearColeccion(titulo: string, recetasIds: number[]) {
    const params = new HttpParams().set('titulo', titulo);
    return this.http.post(`${this.apiUrlColeccion}/crear`, recetasIds, {
      params: params,
      responseType: 'text'
    });
  }

  eliminarColeccion(id: number) {
    return this.http.delete(`${this.apiUrlColeccion}/eliminar/${id}`, {
      responseType: 'text'
    });
  }

  editarColeccion(id: number, titulo: string, recetasIds: number[]) {
    const params = new HttpParams().set('titulo', titulo).set('id', id.toString());
    return this.http.put(`${this.apiUrlColeccion}/editar`, recetasIds, {
      params: params,
      responseType: 'text'
    });
  }

  ListaCompraByCooker(): Observable<ListaCompraDTO[]> {
    return this.http.get<ListaCompraDTO[]>(`${this.apiUrlListaCompra}/personal`);
  }

  eliminarRecetaListaCompra(idReceta: number): Observable<any> {
    const params = new HttpParams().set('idReceta', idReceta.toString());
    return this.http.delete(`${this.apiUrlListaCompra}/eliminar-receta`, { params: {idReceta},  responseType: 'text'  });
  }


  isBlocked(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/tieneBloqueado/${id}`, {
    });
  }

}
