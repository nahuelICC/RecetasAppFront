import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {IonicModule} from '@ionic/angular';
import {HeaderComponent} from './shared/components/header/header.component';
import {FooterComponent} from './shared/components/footer/footer.component';
import {BotonModoOscuroComponent} from './shared/components/boton-modo-oscuro/boton-modo-oscuro.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, IonicModule, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'RecetasAppFront';
}
