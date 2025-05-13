import {Component, Input, OnInit} from '@angular/core';
import {UsuarioExploradorDTO} from '../../models/UsuarioExploradorDTO';
import {RouterLink} from '@angular/router';

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

  constructor() { }

  ngOnInit() {}
  toggleFollow(event: MouseEvent): void {
    event.stopPropagation();
    console.log('Like clicked for recipe:', this.userData?.id);
    this.seguido = !this.seguido;

  }
}
