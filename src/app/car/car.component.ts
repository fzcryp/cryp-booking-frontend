import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AmadeusService } from '../Services/amadeus.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap, tap, finalize } from 'rxjs';

@Component({
    selector: 'app-car',
    templateUrl: './car.component.html',
    styleUrls: ['./car.component.css']
})
export class CarComponent implements OnInit {

    isSearching = false;
    isLoading = false;
    errorMessage = '';

    // Form Inputs
    pickUpInput: string = '';
    pickUpCode: string = ''; // Store IATA

    dropOffInput: string = '';
    dropOffCode: string = ''; // Optional

    pickUpDate: string = '';
    pickUpTime: string = '10:00';
    dropOffDate: string = '';
    dropOffTime: string = '10:00';

    // Autocomplete
    pickUpSuggestions: any[] = [];
    dropOffSuggestions: any[] = [];
    isPickUpLoading = false;
    isDropOffLoading = false;

    private pickUpSearch$ = new Subject<string>();
    private dropOffSearch$ = new Subject<string>();

    // Data
    allCars: any[] = [];
    paginatedCars: any[] = [];
    currentPage = 1;
    itemsPerPage = 10;
    totalRecords = 0;

    constructor(private router: Router, private amadeusService: AmadeusService) { }

    ngOnInit(): void {
        // PickUp Autocomplete
        this.pickUpSearch$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term => this.amadeusService.searchLocations(term))
        ).subscribe({
            next: (res: any) => {
                this.pickUpSuggestions = res.data || [];
                this.isPickUpLoading = false;
            },
            error: () => this.isPickUpLoading = false
        });

        // DropOff Autocomplete
        this.dropOffSearch$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term => this.amadeusService.searchLocations(term))
        ).subscribe({
            next: (res: any) => {
                this.dropOffSuggestions = res.data || [];
                this.isDropOffLoading = false;
            },
            error: () => this.isDropOffLoading = false
        });
    }

    // Input Handlers
    onPickUpInput(value: string) {
        this.pickUpInput = value;
        // Reset code if typing manually
        if (value.length === 3) this.pickUpCode = value.toUpperCase();
        else this.pickUpCode = '';

        if (value.length > 2) {
            this.isPickUpLoading = true;
            this.pickUpSearch$.next(value);
        } else {
            this.pickUpSuggestions = [];
            this.isPickUpLoading = false;
        }
    }

    onDropOffInput(value: string) {
        this.dropOffInput = value;
        if (value.length === 3) this.dropOffCode = value.toUpperCase();
        else this.dropOffCode = '';

        if (value.length > 2) {
            this.isDropOffLoading = true;
            this.dropOffSearch$.next(value);
        } else {
            this.dropOffSuggestions = [];
            this.isDropOffLoading = false;
        }
    }

    selectPickUp(item: any) {
        this.pickUpInput = `${item.name} (${item.iataCode})`;
        this.pickUpCode = item.iataCode;
        this.pickUpSuggestions = [];
        this.isPickUpLoading = false;
    }

    selectDropOff(item: any) {
        this.dropOffInput = `${item.name} (${item.iataCode})`;
        this.dropOffCode = item.iataCode;
        this.dropOffSuggestions = [];
        this.isDropOffLoading = false;
    }

    get totalPages(): number {
        return Math.ceil(this.totalRecords / this.itemsPerPage);
    }

    search() {
        // Prioritize Code, fallback to Input if it looks like a code (3 chars)
        let finalPickUp = this.pickUpCode;
        if (!finalPickUp && this.pickUpInput.length === 3) finalPickUp = this.pickUpInput.toUpperCase();

        // DropOff is optional, if empty use same as pickup (usually) OR let backend handle one-way
        // But Amadeus requires dropOff location code if different.
        // If user leaves drop off empty, we usually assume same location, but let's check params.
        // My backend expects 'pickUpLocation' and 'dropOffLocation' (optional).

        if (!finalPickUp || !this.pickUpDate) {
            alert('Please fill in Pick Up Location and Date.');
            return;
        }

        this.isSearching = true;
        this.isLoading = true;
        this.errorMessage = '';
        this.allCars = [];
        this.paginatedCars = [];
        this.currentPage = 1;

        // Use DropOff Code if set, else input if valid, else empty
        let finalDropOff = this.dropOffCode;
        if (!finalDropOff && this.dropOffInput.length === 3) finalDropOff = this.dropOffInput.toUpperCase();

        // If user provided drop off input but we couldn't resolve a code, we might want to send it as is?
        // Amadeus usually needs IATA. For now, strict on IATA if provided.
        // If drop off is empty, pass empty string (backend defaults/handles?)
        // Actually simpler: pass what we have.

        this.amadeusService.searchCars(
            finalPickUp,
            this.pickUpDate,
            this.pickUpTime,
            finalDropOff
        ).subscribe({
            next: (response) => {
                const rawData = response.data || [];
                this.allCars = rawData;
                this.totalRecords = rawData.length;

                if (this.allCars.length === 0) {
                    this.errorMessage = 'No cars found.';
                } else {
                    this.updatePagination();
                }
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Car Search Error', error);
                this.errorMessage = 'Failed to load cars. Please try again.';
                this.isLoading = false;
            }
        });
    }

    updatePagination() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        this.paginatedCars = this.allCars.slice(start, end);

        const resultsPanel = document.querySelector('.results-panel');
        if (resultsPanel) resultsPanel.scrollIntoView({ behavior: 'smooth' });
    }

    changePage(page: number) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.updatePagination();
    }

    getExpediaLink(item: any): string {
        // Basic deep link
        return `https://www.expedia.com/carsearch?locn=${this.pickUpCode || 'LON'}&dpln=${item.sipp || ''}`;
    }
}
