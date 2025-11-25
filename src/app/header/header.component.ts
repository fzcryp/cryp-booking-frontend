import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../Services/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  menuOpen = false;
  profileMenuOpen = false;


  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
  }

  logout() {
        this.isLoggedIn = false; // Immediately update UI
    this.authService.logout();
  }
  toggleMenu() {
  this.menuOpen = !this.menuOpen;
}
toggleProfileMenu() {
  this.profileMenuOpen = !this.profileMenuOpen;
}

// Optional: close menu when clicking outside
@HostListener('document:click', ['$event'])
clickOutside(event: Event) {
  const target = event.target as HTMLElement;
  if (!target.closest('.profile-dropdown')) {
    this.profileMenuOpen = false;
  }
}
}
