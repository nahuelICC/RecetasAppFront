import { Component, OnInit } from '@angular/core';
import {IonContent, IonIcon} from '@ionic/angular/standalone';

@Component({
  selector: 'app-explorador',
  templateUrl: './explorador.component.html',
  styleUrls: ['./explorador.component.css'],
  standalone: true,
  imports: [
    IonContent,
    IonIcon
  ]
})
export class ExploradorComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
