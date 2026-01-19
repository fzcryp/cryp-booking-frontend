import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AmadeusService {
  // Pointing to our new local backend
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  searchHotels(cityCode: string, checkIn?: string, checkOut?: string, guests?: number, page: number = 1, limit: number = 100, sort?: string, stars?: string, amenities?: string): Observable<any> {
    let url = `${this.baseUrl}/hotels?city=${cityCode}&page=${page}&limit=${limit}`;
    if (checkIn) url += `&checkIn=${checkIn}`;
    if (checkOut) url += `&checkOut=${checkOut}`;
    if (guests) url += `&adults=${guests}`;
    if (sort) url += `&sort=${sort}`;
    if (stars) url += `&stars=${stars}`;
    if (amenities) url += `&amenities=${amenities}`;
    return this.http.get(url);
  }

  searchCars(pickUpLocation: string, pickUpDate: string, pickUpTime: string, dropOffLocation?: string): Observable<any> {
    let url = `${this.baseUrl}/cars?pickUpLocation=${pickUpLocation}&pickUpDate=${pickUpDate}&pickUpTime=${pickUpTime}`;
    // Add DropOff if different (Optional logic, backend handles simple search for now)
    if (dropOffLocation) url += `&dropOffLocation=${dropOffLocation}`;

    return this.http.get(url);
  }

  searchFlights(origin: string, destination: string, date: string, returnDate?: string, adults: number = 1): Observable<any> {
    let url = `${this.baseUrl}/flights?origin=${origin}&destination=${destination}&date=${date}&adults=${adults}`;
    if (returnDate) url += `&returnDate=${returnDate}`;
    return this.http.get(url);
  }

  searchLocations(keyword: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/locations?keyword=${keyword}`);
  }
}
