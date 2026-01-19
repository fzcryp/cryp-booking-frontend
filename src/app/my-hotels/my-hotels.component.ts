import { Component, OnInit } from '@angular/core';
import { SavedHotelsService } from '../Services/saved-hotels.service';
import { SavedFlightsService } from '../Services/saved-flights.service';

@Component({
    selector: 'app-my-hotels',
    templateUrl: './my-hotels.component.html',
    styleUrls: ['./my-hotels.component.css']
})
export class MyHotelsComponent implements OnInit {
    activeTab: 'hotels' | 'flights' = 'hotels';

    savedHotels: any[] = [];
    savedFlights: any[] = [];

    isLoading = true;
    userEmail: string = '';

    constructor(
        private savedHotelsService: SavedHotelsService,
        private savedFlightsService: SavedFlightsService
    ) { }

    ngOnInit(): void {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        this.userEmail = user.email;

        if (this.userEmail) {
            this.fetchSavedHotels();
            this.fetchSavedFlights();
        } else {
            this.isLoading = false;
        }
    }

    fetchSavedHotels() {
        this.savedHotelsService.getSavedHotels(this.userEmail).subscribe({
            next: (data) => {
                this.savedHotels = data.map(item => {
                    let hotelData = item.hotel_data;
                    if (typeof hotelData === 'string') {
                        try {
                            hotelData = JSON.parse(hotelData);
                        } catch (e) {
                            console.error("Error parsing hotel data", e);
                        }
                    }
                    return { ...item, hotel_data: hotelData };
                });
                this.checkLoading();
            },
            error: (err) => {
                console.error('Error fetching saved hotels:', err);
                this.checkLoading();
            }
        });
    }

    fetchSavedFlights() {
        this.savedFlightsService.getSavedFlights(this.userEmail).subscribe({
            next: (data) => {
                this.savedFlights = data.map(item => {
                    let flightData = item.flight_data;
                    if (typeof flightData === 'string') {
                        try {
                            flightData = JSON.parse(flightData);
                        } catch (e) { console.error("Error parsing flight data", e); }
                    }
                    return { ...item, flight_data: flightData };
                });
                this.checkLoading();
            },
            error: (err) => {
                console.error('Error fetching saved flights:', err);
                this.checkLoading();
            }
        });
    }

    checkLoading() {
        // Simple Logic: just turn off loading when at least one request completes? 
        // Or handle separate loading states? For simplicity, we turn off global loading here.
        this.isLoading = false;
    }

    removeHotel(hotelId: string) {
        if (!confirm('Are you sure you want to remove this hotel?')) return;

        this.savedHotelsService.removeHotel(this.userEmail, hotelId).subscribe({
            next: () => {
                this.savedHotels = this.savedHotels.filter(h => h.hotel_id !== hotelId);
            },
            error: (err) => console.error('Error removing hotel:', err)
        });
    }

    removeFlight(flightId: string) {
        if (!confirm('Are you sure you want to remove this flight?')) return;

        this.savedFlightsService.removeFlight(this.userEmail, flightId).subscribe({
            next: () => {
                this.savedFlights = this.savedFlights.filter(f => f.flight_id !== flightId);
            },
            error: (err) => console.error('Error removing flight:', err)
        });
    }
}
