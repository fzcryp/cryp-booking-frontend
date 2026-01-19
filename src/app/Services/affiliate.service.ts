import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AffiliateService {
    private apiUrl = `${environment.apiUrl}/affiliates`;
    // private apiUrl = `${environment.apiUrl}/affiliates`;

    constructor(private http: HttpClient) { }

    // Get all partners (for admin or public)
    getPartners(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    // Add new partner
    addPartner(partner: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, partner);
    }

    // Update partner
    updatePartner(id: number, partner: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, partner);
    }

    // Delete partner
    deletePartner(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }

    // Reorder partners
    reorderPartners(orderedIds: number[]): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/reorder`, { orderedIds });
    }
}
