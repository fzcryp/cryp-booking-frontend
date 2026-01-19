import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SupportService {
    private apiUrl = `${environment.apiUrl}/support`;

    constructor(private http: HttpClient) { }

    // User: Submit Request
    submitRequest(userId: number, subject: string, message: string): Observable<any> {
        return this.http.post(this.apiUrl, { userId, subject, message });
    }

    // User: Get My Requests
    getUserRequests(userId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
    }

    // Admin: Get All Requests
    getAllRequests(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/admin/all`);
    }

    // Admin: Reply to Request
    replyToRequest(id: number, adminReply: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/admin/${id}/reply`, { adminReply });
    }
}
