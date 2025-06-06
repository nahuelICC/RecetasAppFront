import {Component, Input, NgZone, OnInit} from '@angular/core';
import {UsuarioExploradorDTO} from '../../models/UsuarioExploradorDTO';
import {Router, RouterLink} from '@angular/router';
import {EncryptService} from '../../../../core/services/encrypt.service';
import {UsuarioService} from '../../../usuario/services/usuario.service';

@Component({
  selector: 'app-usuario-explorador',
  templateUrl: './usuario-explorador.component.html',
  styleUrls: ['./usuario-explorador.component.css'],
  imports: [
    RouterLink
  ],
  standalone: true
})
export class UsuarioExploradorComponent  implements OnInit {
  @Input() userData!: UsuarioExploradorDTO;
  @Input() seguido: boolean = false;

  constructor(private router:Router,private zone: NgZone,private encryptService:EncryptService,private usuarioService: UsuarioService) { }

  ngOnInit() {}
  toggleFollow(event: MouseEvent): void {
    event.stopPropagation();
    this.usuarioService.changeSeguir(this.userData.id.toString()).subscribe({
      next: () => {
        this.seguido = !this.seguido;
        console.log(`${this.seguido ? 'Seguido' : 'Dejado de seguir'} al usuario:`, this.userData.id);
      },
      error: err => {
        console.error('Error al intentar seguir/dejar de seguir:', err);
      }
    });

  }


  redireccionarPerfil(id: string): void {
    this.zone.run(() => {
      const idEncrypt = this.encryptService.encriptar(id);
      this.router.navigate(['/perfil', idEncrypt]).then(() => {
      });
    });
  }
}
