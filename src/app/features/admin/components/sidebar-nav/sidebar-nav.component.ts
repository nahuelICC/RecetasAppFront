import {Component, Input, OnInit} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';


export interface NavItem {
  label: string;
  path: string;
  icon?: string;
}

@Component({
  selector: 'app-sidebar-nav',
  templateUrl: './sidebar-nav.component.html',
  styleUrls: ['./sidebar-nav.component.css'],
  imports: [
    RouterLink,
    NgForOf,
    RouterLinkActive,
    NgIf
  ],
  standalone: true
})
export class SidebarNavComponent  implements OnInit {
  @Input() navItems: NavItem[] = [];

  constructor() { }

  ngOnInit() {}

}
