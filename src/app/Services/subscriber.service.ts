import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SubscriberService {

    private apiUrl = `${environment.apiUrl} /subscribe`;

    constructor(private http: HttpClient) { }

    subscribe(email: string): Observable<any> {
        return this.http.post(this.apiUrl, { email });
    }

    getSubscribers(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    updateStatus(id: number, isActive: boolean): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}/status`, { is_active: isActive });
    }

    deleteSubscriber(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
