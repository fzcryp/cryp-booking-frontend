import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SavedFlightsService {
    private apiUrl = `${environment.apiUrl}/saved-flights`;

    constructor(private http: HttpClient) { }

    saveFlight(userEmail: string, flight: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/save`, { userEmail, flight });
    }

    getSavedFlights(userEmail: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/${userEmail}`);
    }

    removeFlight(userEmail: string, flightId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${userEmail}/${flightId}`);
    }
}
