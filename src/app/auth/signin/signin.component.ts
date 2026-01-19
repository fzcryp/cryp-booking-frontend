import { Component, OnInit, NgZone } from '@angular/core';
import { AuthService } from '../../Services/auth/auth.service';
import { Router } from '@angular/router';

declare var google: any;

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
})
export class SigninComponent implements OnInit {
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }

    // Initialize Google Button for Signin
    // Wait for Google Library to load
    this.ensureGoogleLibraryLoaded();
  }

  ensureGoogleLibraryLoaded() {
    if (typeof google !== 'undefined' && google.accounts) {
      // Already loaded
      this.initializeGoogleButton();
    } else {
      // Poll every 100ms
      const interval = setInterval(() => {
        if (typeof google !== 'undefined' && google.accounts) {
          clearInterval(interval);
          this.initializeGoogleButton();
        }
      }, 100);
    }
  }

  initializeGoogleButton() {
    google.accounts.id.initialize({
      client_id: '903106841554-vtbier17e7dhgkf03ohn1d48esq30l0g.apps.googleusercontent.com',
      callback: (resp: any) => this.handleGoogleLogin(resp)
    });

    if (document.getElementById("google-btn-signin")) {
      google.accounts.id.renderButton(document.getElementById("google-btn-signin"), {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: '320'
      });
    }
  }

  handleGoogleLogin(response: any) {
    if (response.credential) {
      this.authService.googleLogin(response.credential).subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            localStorage.setItem('referral', res.user.referral_code);
            this.router.navigate(['/']);
          });
        },
        error: (err) => {
          console.error("Google Login Failed", err);
          this.errorMessage = 'Google Sign-In Failed';
        }
      })
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
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Login error:', err);
        this.loading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please try again.';
      },
    });
  }
}
