import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DiscountService {
    private apiUrl = `${environment.apiUrl}/discounts`;

    constructor(private http: HttpClient) { }

    submitRequest(formData: FormData): Observable<any> {
        return this.http.post(this.apiUrl, formData);
    }

    getHistory(userId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/${userId}`);
    }

    // ✅ Admin: Get all requests
    getAllRequests(): Observable<any> {
        return this.http.get(`${this.apiUrl}/admin/all`);
    }

    // ✅ Admin: Update status
    updateStatus(requestId: number, status: string, amount?: number, userId?: number): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${requestId}/status`, { status, amount, userId });
    }
}
