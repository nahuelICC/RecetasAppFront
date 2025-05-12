import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-usuario-explorador',
  templateUrl: './usuario-explorador.component.html',
  styleUrls: ['./usuario-explorador.component.css'],
  standalone: true
})
export class UsuarioExploradorComponent  implements OnInit {
  @Input() userData!: any;

  constructor() { }

  ngOnInit() {}

}
