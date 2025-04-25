import { Component, Input, OnInit } from '@angular/core';
import { Alergeno } from '../../models/Alergeno';

@Component({
  selector: 'app-alergeno',
  templateUrl: './alergeno.component.html',
  styleUrls: ['./alergeno.component.scss'],
})
export class AlergenoComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

  @Input() alergeno!: Alergeno
}
