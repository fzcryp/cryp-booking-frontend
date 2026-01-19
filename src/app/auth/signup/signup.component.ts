import { Component, OnInit, NgZone } from '@angular/core';
import { AuthService } from '../../Services/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

declare var google: any;

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  loading = false;
  errorMessage = '';
  successMessage = '';
  referralCode = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {

    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/']);
    }
    // Check for referral code in URL query params
    this.route.queryParams.subscribe(params => {
      if (params['ref']) {
        this.referralCode = params['ref'];
      }
    });

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

    if (document.getElementById("google-btn")) {
      google.accounts.id.renderButton(document.getElementById("google-btn"), {
        theme: 'outline',
        size: 'large',
        text: 'signup_with',
        shape: 'rectangular',
        width: '320'
      });
    }
  }

  handleGoogleLogin(response: any) {
    if (response.credential) {
      this.auth.googleLogin(response.credential).subscribe({
        next: (res) => {
          this.ngZone.run(() => {
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

  onSignup(formValue: { name: string; email: string; password: string }) {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Call the signup service (implementation depends on existing service method signature)
    this.auth.signup(formValue.name, formValue.email, formValue.password, this.referralCode)
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.successMessage = 'Signup successful! Redirecting...';
          setTimeout(() => {
            this.router.navigate(['/signin']);
          }, 1500);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Signup failed';
        }
      });

  }
}
