import { Component, OnInit } from '@angular/core';
import {IonFooter, IonIcon, IonTabBar, IonTabButton, IonTabs, IonToolbar} from "@ionic/angular/standalone";
import {NgIf} from "@angular/common";
import {Platform} from '@ionic/angular';
import {AuthService} from '../../../core/services/auth.service';
import {Router, RouterLink} from '@angular/router';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css'],
    standalone: true,
  imports: [
    IonIcon,
    IonTabBar,
    IonTabButton,
    IonTabs,
    NgIf,
    IonFooter,
    IonToolbar,
    RouterLink
  ]
})
export class FooterComponent  implements OnInit {

  isMobile: boolean;

  constructor(private platform: Platform, public authService: AuthService, private router: Router) {
    this.isMobile = this.platform.width() < 768;
    this.platform.resize.subscribe(() => {
      this.isMobile = this.platform.width() < 768;
    });
  }

  ngOnInit(): void {
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }




}
