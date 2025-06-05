import { Component, OnInit } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {SidebarNavComponent} from './components/sidebar-nav/sidebar-nav.component';
import {AlertInfoComponent} from '../../shared/components/alert-info/alert-info.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  imports: [
    RouterOutlet,
    SidebarNavComponent,
    AlertInfoComponent
  ],
  standalone: true
})
export class AdminComponent  implements OnInit {

  sidebarNavItems = [
    { label: 'Ingredientes', path: './ingredientes', icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5' },
    { label: 'Productos', path: './productos', icon: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v.001c0 .621.504 1.125 1.125 1.125z' },
    {
      label: 'Recetas',
      path: './recetas',
      icon: "M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
    },
    { label: 'Usuarios', path: './usuarios', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
  ]

  constructor() { }

  ngOnInit() {}

}
