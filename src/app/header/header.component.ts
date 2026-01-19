import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../Services/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  menuOpen = false;
  profileMenuOpen = false;
  designMenuOpen = false;


  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    if (this.isLoggedIn) {
      const user = this.authService.getUser();
      // Check for isAdmin (handle boolean or 1/0)
      this.isAdmin = user?.isAdmin === 1;
    }
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
    if (this.profileMenuOpen) this.designMenuOpen = false; // Close other menu
  }

  toggleDesignMenu() {
    this.designMenuOpen = !this.designMenuOpen;
    if (this.designMenuOpen) this.profileMenuOpen = false; // Close other menu
  }

  closeProfileMenu() {
    this.profileMenuOpen = false;
  }

  // Optional: close menu when clicking outside
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-dropdown')) {
      this.profileMenuOpen = false;
      this.designMenuOpen = false;
    }
  }
}
