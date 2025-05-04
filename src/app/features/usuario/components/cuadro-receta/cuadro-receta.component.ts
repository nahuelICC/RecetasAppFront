import {Component, Input, OnInit} from '@angular/core';
import {IonIcon} from '@ionic/angular/standalone';
import {NgIf} from '@angular/common';
import {UsuarioService} from '../../services/usuario.service';

@Component({
  selector: 'app-cuadro-receta',
  templateUrl: './cuadro-receta.component.html',
  styleUrls: ['./cuadro-receta.component.css'],
  standalone: true,
  imports: [IonIcon, NgIf]
})
export class CuadroRecetaComponent  implements OnInit {

  constructor(private usuarioService:UsuarioService) { }

  ngOnInit() {}

  @Input() receta!: {
    nombre: string;
    fotoReceta: string;
    esVisible: boolean;
    meGusta: number;
    guardados: number;
    idReceta: number;
  };
  @Input() esPerfilPropio: boolean = true;

  toggleVisibilidad() {
    this.receta.esVisible = !this.receta.esVisible;
    this.usuarioService.editarVisibilidadReceta(this.receta.idReceta, this.receta.esVisible).subscribe();
  }

}
