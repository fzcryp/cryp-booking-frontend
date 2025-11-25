import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../Services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  loading = false;
  errorMessage = '';
  successMessage = '';
  referralCode: any = null; // add this

  constructor(private authService: AuthService, private router: Router,     private route: ActivatedRoute) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
     this.route.queryParams.subscribe(params => {
      this.referralCode = params['ref'] || null;
    });
  }

  onSignup(formValue: { name: string; email: string; password: string }) {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      name: formValue.name,
      email: formValue.email,
      password: formValue.password,
      referralCode: this.referralCode // send it to backend
    };

    this.authService.signup(payload.name, payload.email, payload.password, payload.referralCode).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = res.message || 'Signup successful!';
        setTimeout(() => this.router.navigate(['/signin']), 1000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Signup failed';
      }
    });
  }
}
