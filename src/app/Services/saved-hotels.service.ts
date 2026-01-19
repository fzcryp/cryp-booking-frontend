import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SavedHotelsService {
    private apiUrl = `${environment.apiUrl}/saved-hotels`; // Adjust port if needed

    constructor(private http: HttpClient) { }

    saveHotel(email: string, hotel: any): Observable<any> {
        const payload = {
            user_email: email,
            hotel_id: hotel.hotel?.hotelId || hotel.hotelId, // Handle different structures if any
            hotel_name: hotel.hotel?.name || hotel.name,
            hotel_data: hotel
        };
        return this.http.post(this.apiUrl, payload);
    }

    removeHotel(email: string, hotelId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${email}/${hotelId}`);
    }

    getSavedHotels(email: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/${email}`);
    }

    isHotelSaved(email: string, hotelId: string): Observable<{ isSaved: boolean }> {
        return this.http.get<{ isSaved: boolean }>(`${this.apiUrl}/check/${email}/${hotelId}`);
    }
}
