import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {IonicModule} from '@ionic/angular';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, IonicModule],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'RecetasAppFront';
}
