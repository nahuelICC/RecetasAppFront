import {Component, Input, NgZone, OnInit} from '@angular/core';
import {UsuarioExploradorDTO} from '../../models/UsuarioExploradorDTO';
import {Router, RouterLink} from '@angular/router';
import {EncryptService} from '../../../../core/services/encrypt.service';

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

  constructor(private router:Router,private zone: NgZone,private encryptService:EncryptService) { }

  ngOnInit() {}
  toggleFollow(event: MouseEvent): void {
    event.stopPropagation();
    console.log('Like clicked for recipe:', this.userData?.id);
    this.seguido = !this.seguido;

  }

  redireccionarPerfil(id: string): void {
    this.zone.run(() => {
      const idEncrypt = this.encryptService.encriptar(id);
      this.router.navigate(['/perfil', idEncrypt]).then(() => {
        window.location.reload();
      });
    });
  }
}
