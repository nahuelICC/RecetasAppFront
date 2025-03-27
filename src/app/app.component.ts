import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {IonicModule} from '@ionic/angular';
import {HeaderComponent} from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, IonicModule, HeaderComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'RecetasAppFront';
}
