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
  ],
  standalone: true
})
export class AdminComponent  implements OnInit {

  sidebarNavItems = [
    { label: 'Ingredientes', path: './ingredientes', icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5' },
    { label: 'Usuarios', path: './usuarios', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
    { label: 'Productos', path: './productos', icon: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v.001c0 .621.504 1.125 1.125 1.125z' },
    { label: 'Pedidos', path: './pedidos', icon: 'M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V17.25m12-9.75v-3.375c0-.621-.504-1.125-1.125-1.125H4.5A1.125 1.125 0 003.375 7.5v3.375m12 0c0 .621-.504 1.125-1.125 1.125H4.5A1.125 1.125 0 013.375 12m12 0v3.375c0 .621-.504 1.125-1.125 1.125H4.5a1.125 1.125 0 01-1.125-1.125V12m12-9.75v-3.375c0-.621-.504-1.125-1.125-1.125H4.5A1.125 1.125 0 003.375 7.5v3.375' },

  ]

  constructor() { }

  ngOnInit() {}

}
