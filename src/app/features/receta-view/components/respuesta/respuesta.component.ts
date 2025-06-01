import { Component, Input, OnInit } from '@angular/core';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-respuesta',
  templateUrl: './respuesta.component.html',
  styleUrls: ['./respuesta.component.css'],
  standalone: true,
  imports: [
    TimeAgoPipe,
  ]
})
export class RespuestaComponent implements OnInit {


  @Input() respuesta!:any

  constructor() { }

  ngOnInit() {
  }

}
