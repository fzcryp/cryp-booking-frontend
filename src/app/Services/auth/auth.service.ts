import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://192.168.5.125:4000/api/auth'; // backend URL
  private profileUrl = 'http://192.168.5.125:4000/api/users'; // backend URL

  constructor(private http: HttpClient, private router: Router) {}

  // =====================
  // SIGNUP
  // =====================
// auth.service.ts
signup(name: string, email: string, password: string, referralCode?: string): Observable<any> {
  const payload: any = { name, email, password };
  if (referralCode) {
    payload.referral_code = referralCode; // send referral_code as backend expects
  }
  return this.http.post(`${this.baseUrl}/signup`, payload);
}


  // =====================
  // LOGIN
  // =====================
  signin(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, { email, password }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userEmail', email);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      })
    );
  }

  // =====================
  // AUTH CHECK
  // =====================
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUser(): any {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/signin']);
  }

  getCurrentUser(id:any): Observable<any> {
    return this.http.get(`${this.profileUrl}/profile/${id}`);
  }
}
