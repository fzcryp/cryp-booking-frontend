import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AmadeusService } from '../Services/amadeus.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
    selector: 'app-flight',
    templateUrl: './flight.component.html',
    styleUrls: ['./flight.component.css']
})
export class FlightComponent implements OnInit {

    isSearching = false;
    isLoading = false;
    errorMessage = '';

    // Display Values (Input text)
    originInput: string = '';
    destinationInput: string = '';

    // Actual Codes for API
    originCode: string = '';
    destinationCode: string = '';

    departureDate: string = '';
    returnDate: string = '';
    guests: number = 1;

    // Suggestions
    originSuggestions: any[] = [];
    destSuggestions: any[] = [];
    isOriginLoading = false;
    isDestLoading = false;

    // Search Subjects for Debouncing
    private originSearch$ = new Subject<string>();
    private destSearch$ = new Subject<string>();

    // Data
    allFlights: any[] = [];
    paginatedFlights: any[] = [];
    currentPage = 1;
    itemsPerPage = 10;
    totalRecords = 0;

    constructor(private router: Router, private amadeusService: AmadeusService) { }

    ngOnInit(): void {
        // Setup Debounced Search for Origin
        this.originSearch$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term => this.amadeusService.searchLocations(term))
        ).subscribe({
            next: (res: any) => {
                this.originSuggestions = res.data || [];
                this.isOriginLoading = false;
            },
            error: () => this.isOriginLoading = false
        });

        // Setup Debounced Search for Destination
        this.destSearch$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term => this.amadeusService.searchLocations(term))
        ).subscribe({
            next: (res: any) => {
                this.destSuggestions = res.data || [];
                this.isDestLoading = false;
            },
            error: () => this.isDestLoading = false
        });
    }

    // Input Handlers
    onOriginInput(value: string) {
        this.originInput = value;
        // Reset code if user types manually (force selection or simple fallback)
        this.originCode = value.length === 3 ? value.toUpperCase() : '';
        if (value.length > 2) {
            this.isOriginLoading = true;
            this.originSearch$.next(value);
        } else {
            this.originSuggestions = [];
            this.isOriginLoading = false;
        }
    }

    onDestInput(value: string) {
        this.destinationInput = value;
        this.destinationCode = value.length === 3 ? value.toUpperCase() : '';
        if (value.length > 2) {
            this.isDestLoading = true;
            this.destSearch$.next(value);
        } else {
            this.destSuggestions = [];
            this.isDestLoading = false;
        }
    }

    // Selection Handlers
    selectOrigin(item: any) {
        this.originInput = `${item.name} (${item.iataCode})`;
        this.originCode = item.iataCode;
        this.originSuggestions = [];
        this.isOriginLoading = false;
    }

    selectDest(item: any) {
        this.destinationInput = `${item.name} (${item.iataCode})`;
        this.destinationCode = item.iataCode;
        this.destSuggestions = [];
        this.isDestLoading = false;
    }

    get totalPages(): number {
        return Math.ceil(this.totalRecords / this.itemsPerPage);
    }

    search() {
        // Use Code if set, otherwise try to use the raw input (maybe user typed 'LHR' directly)
        const finalOrigin = this.originCode || this.originInput;
        const finalDest = this.destinationCode || this.destinationInput;

        if (!finalOrigin || !finalDest || !this.departureDate) {
            alert('Please fill in Origin, Destination and Departure Date.');
            return;
        }

        this.isSearching = true;
        this.isLoading = true;
        this.errorMessage = '';
        this.allFlights = [];
        this.paginatedFlights = [];
        this.currentPage = 1;

        // CALL API
        this.amadeusService.searchFlights(
            finalOrigin,
            finalDest,
            this.departureDate,
            this.returnDate,
            this.guests
        ).subscribe({
            next: (response) => {
                const rawData = response.data || [];
                this.allFlights = rawData;
                this.totalRecords = rawData.length;

                if (this.allFlights.length === 0) {
                    this.errorMessage = 'No flights found for this route/date.';
                } else {
                    this.updatePagination();
                }

                this.isLoading = false;
            },
            error: (error) => {
                console.error('Flight Search Error', error);
                this.errorMessage = 'Failed to load flights. Please try again.';
                this.isLoading = false;
            }
        });
    }

    updatePagination() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        this.paginatedFlights = this.allFlights.slice(start, end);

        const resultsPanel = document.querySelector('.results-panel');
        if (resultsPanel) resultsPanel.scrollIntoView({ behavior: 'smooth' });
    }

    changePage(page: number) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.updatePagination();
    }
}
