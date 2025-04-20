import { Component, OnInit } from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {IonIcon} from '@ionic/angular/standalone';
import {UsuarioService} from './services/usuario.service';
import {HeaderService} from '../../shared/services/header.service';
import {BotonComponent} from '../../shared/components/boton/boton.component';
import {BotonAddRecetaComponent} from '../../shared/components/boton-add-receta/boton-add-receta.component';
import {CuadroRecetaComponent} from './components/cuadro-receta/cuadro-receta.component';
import {CuadroRecetaGuardadaComponent} from './components/cuadro-receta-guardada/cuadro-receta-guardada.component';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css'],
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    IonIcon,
    BotonComponent,
    BotonAddRecetaComponent,
    CuadroRecetaComponent,
    CuadroRecetaGuardadaComponent
  ]
})
export class UsuarioComponent  implements OnInit {

  perfil: any;
  activeTab: string = 'recetas';
  recetas: any[] = [];
  colecciones: any[] = [];
  recetasGuardadas: any[] = [];
  imagenPerfil: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  esPerfilPropio: boolean = true;

  constructor(private usuarioService:UsuarioService,private headerService: HeaderService,private route: ActivatedRoute,) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.usuarioService.getPerfilId(id).subscribe((response) => {
        console.log(response);
        this.perfil = response;
        this.recetas = response.recetas;
        this.colecciones = response.colecciones;
      });
      this.esPerfilPropio = false;
    } else {
      this.esPerfilPropio = true;
      this.usuarioService.getPerfil().subscribe((response) => {
        this.perfil = response;
        this.recetas = response.recetas;
        this.colecciones = response.colecciones;
        this.recetasGuardadas = response.recetasGuardadas;
      });
    }


    this.headerService.getFotoPerfil().subscribe((response: any) => {
      if (response !== 'sin foto') {
        this.imagenPerfil = response;
      }
    });
  }

}
