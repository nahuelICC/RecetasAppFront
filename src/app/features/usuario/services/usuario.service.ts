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

  /**
   * Obtiene el perfil del usuario actual.
   */
  getPerfil() {
    return this.http.get<any>(`${this.apiUrl}/perfil`);
  }

  /**
   * Obtiene el perfil de un usuario por su ID.
   * @param id El ID del usuario.
   */
  getPerfilId(id: string) {
    return this.http.get<any>(`${this.apiUrl}/perfil/${id}`);
  }

  /**
   * Función para editar el perfil del usuario.
   * @param datosEdicion
   */
  editarPerfil(datosEdicion: any) {
    return this.http.put(`${this.apiUrl}/perfil`, datosEdicion, { responseType: 'text' });
  }

  /**
   * Fucnion para cambiar la contraseña del usuario.
   * @param datos
   */
  cambiarContrasena(datos: any) {
    return this.http.put(`${this.apiUrlUsuario}/cambiarPassword`, datos, { responseType: 'text' });
  }

  /**
   * Función para subir una foto de perfil.
   * @param formData
   */
  subirFotoPerfil(formData: FormData) {
    return this.http.put<any>(`${this.apiUrlUsuario}/cambioImagen`, formData);
  }

  /**
   * Función para obtener la lista de usuarios que el usuario actual sigue.
   */
  listaSeguidos(esPerfilPropio: boolean = false, id: string = '') {
    return this.http.get<any>(`${this.apiUrl}/seguidos`, {
      params: {
        esPerfilPropio: esPerfilPropio.toString(),
        id
      }
    });
  }

  /**
   * Función para obtener la lista de seguidores del usuario actual.
   * @param esPerfilPropio Indica si es el perfil propio o no.
   * @param id ID del usuario (opcional).
   */
  listaSeguidores(esPerfilPropio: boolean = false, id: string = '') {
    return this.http.get<any>(`${this.apiUrl}/seguidores`, {
      params: {
        esPerfilPropio: esPerfilPropio.toString(),
        id
      }
    });
  }

  /**
   * Función para editar la visibilidad de una receta.
   */
  editarVisibilidadReceta(idReceta: number, esVisible: boolean) {
    return this.http.put(`${this.apiUrlReceta}/visibilidad`, null, {
      params: {
        recetaId: idReceta.toString(),
        visibilidad: esVisible.toString()
      }
    });
  }

  /**
   * Función para editar la visibilidad de una colección.
   * @param idColeccion ID de la colección.
   * @param esVisible Indica si la colección es visible o no.
   */
  editarVisibilidadColeccion(idColeccion: number, esVisible: boolean) {
    return this.http.put(`${this.apiUrlColeccion}/visibilidad`, null, {
      params: {
        id: idColeccion.toString(),
        visibilidad: esVisible.toString()
      }
    });
  }

  /**
   * Función para Comprobar si un perfil está bloqueado.
   */
  perfilBloqueado(id:string) {
    return this.http.get(`${this.apiUrl}/perfilBloqueado`, {
    params: {
      idCooker: id
    }
    });
  }

  /**
   * Función para obtener la foto de perfil de un usuario de una visita.
   * @param id ID del usuario.
   */
  fotoPerfilVisita(id:string) {
    return this.http.get(`${this.apiUrl}/foto/${id}`,  {responseType: 'text'});
  }

  /**
   * Función para cambiar el bloqueo de un usuario.
   */
  changeBloqueo(id: string) {
    const params = new HttpParams().set('idCooker', id);
    return this.http.post(`${this.apiUrl}/bloquear`, null, {
      params: params,
      responseType: 'text'
    });
  }

  /**
   * Función para seguir o dejar de seguir a un usuario.
   * @param id ID del usuario a seguir.
   */
  changeSeguir(id: string) {
    const params = new HttpParams().set('idCooker', id);
    return this.http.post(`${this.apiUrl}/seguir`, null, {
      params: params,
      responseType: 'text'
    });
  }

  /**
   * Función para crear una colección de recetas.
   */
  crearColeccion(titulo: string, recetasIds: number[]) {
    const params = new HttpParams().set('titulo', titulo);
    return this.http.post(`${this.apiUrlColeccion}/crear`, recetasIds, {
      params: params,
      responseType: 'text'
    });
  }

  /**
   * Función para eliminar una colección de recetas.
   */
  eliminarColeccion(id: number) {
    return this.http.delete(`${this.apiUrlColeccion}/eliminar/${id}`, {
      responseType: 'text'
    });
  }

  /**
   * Función para editar una colección de recetas.
   */
  editarColeccion(id: number, titulo: string, recetasIds: number[]) {
    const params = new HttpParams().set('titulo', titulo).set('id', id.toString());
    return this.http.put(`${this.apiUrlColeccion}/editar`, recetasIds, {
      params: params,
      responseType: 'text'
    });
  }

  /**
   * Función para obtener la lista de la compra del usuario actual.
   */
  ListaCompraByCooker(): Observable<ListaCompraDTO[]> {
    return this.http.get<ListaCompraDTO[]>(`${this.apiUrlListaCompra}/personal`);
  }

  /**
   * Función para eliminar una receta de la lista de la compra del usuario actual.
   */
  eliminarRecetaListaCompra(idReceta: number): Observable<any> {
    const params = new HttpParams().set('idReceta', idReceta.toString());
    return this.http.delete(`${this.apiUrlListaCompra}/eliminar-receta`, { params: {idReceta},  responseType: 'text'  });
  }


  /**
   * Función para cpmpronbar si un usuario te tiene bloqueado.
   */
  isBlocked(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/tieneBloqueado/${id}`, {
    });
  }

}
