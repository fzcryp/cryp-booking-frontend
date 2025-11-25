import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReferralService {
  private baseUrl = 'http://192.168.5.125:4000/api/referral'; // backend URL
  // change to your backend URL

  constructor(private http: HttpClient) {}

  getReferralHistory(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/history/${userId}`);
  }
}
