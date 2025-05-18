import { Component, Input, OnInit } from '@angular/core';
import { ComentarioResponse } from '../../../../core/models/ComentarioResponse';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component({
  selector: 'app-comentario',
  templateUrl: './comentario.component.html',
  styleUrls: ['./comentario.component.css'],
  imports: [TimeAgoPipe]
})
export class ComentarioComponent  implements OnInit {

  @Input() comentario!:ComentarioResponse;

  ngOnInit(): void {
      
  }


}
