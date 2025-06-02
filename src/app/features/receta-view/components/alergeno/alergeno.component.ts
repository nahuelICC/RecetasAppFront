import { Component, Input, OnInit } from '@angular/core';
import { Alergeno } from '../../models/Alergeno';

@Component({
  selector: 'app-alergeno',
  standalone: true,
  templateUrl: './alergeno.component.html',
  styleUrls: ['./alergeno.component.css'],
})
export class AlergenoComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

  @Input() alergeno!: Alergeno
}
