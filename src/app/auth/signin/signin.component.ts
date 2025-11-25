import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../Services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
})
export class SigninComponent implements OnInit {
  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  onSignin(formValue: { email: string; password: string }) {
    this.loading = true;
    this.errorMessage = '';

    this.authService.signin(formValue.email, formValue.password).subscribe({
      next: (res) => {
        this.loading = false;
        // alert('Login successful!');
        localStorage.setItem('referral', res.user.referral_code);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Login error:', err);
        this.loading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please try again.';
      },
    });
  }
}
