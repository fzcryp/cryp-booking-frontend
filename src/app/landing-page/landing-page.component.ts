import { Component } from '@angular/core';
import { AuthService } from '../Services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {

    constructor(private authService: AuthService, private router: Router) {}
  
    ngOnInit(): void {
      if (this.authService.isAuthenticated()) {
        // Already logged in → redirect to home
        this.router.navigate(['/home']);
      }
    }
  

}
