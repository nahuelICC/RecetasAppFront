import {Component, Input, OnInit} from '@angular/core';
import {RecetaInicioDTO} from '../../models/RecetaInicioDTO';
import {IonicModule} from '@ionic/angular';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-publicacion',
  templateUrl: './publicacion.component.html',
  styleUrls: ['./publicacion.component.css'],
  standalone: true,
  imports: [
    IonicModule,
    NgForOf
  ]
})
export class PublicacionComponent  implements OnInit {

  @Input() receta!: RecetaInicioDTO;

  constructor() {}

  ngOnInit() {}

}
