import {Component, Input, OnInit} from '@angular/core';
import {RecetasExploradorDTO} from '../../models/RecetasExploradorDTO';
import {DuracionSinSegundosPipe} from '../../pipes/duracion-sin-segundos.pipe';
import {RouterLink} from '@angular/router';
import {DecimalPipe, NgIf} from '@angular/common';

@Component({
  selector: 'app-recetas',
  templateUrl: './recetas.component.html',
  styleUrls: ['./recetas.component.css'],
  imports: [
    DuracionSinSegundosPipe,
    RouterLink,
    NgIf,
    DecimalPipe
  ],
  standalone: true
})
export class RecetasComponent  implements OnInit {
  @Input() recipeData!: RecetasExploradorDTO;

  constructor() { }

  ngOnInit() {}

}
