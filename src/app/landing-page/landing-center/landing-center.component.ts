import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AffiliateService } from '../../Services/affiliate.service';
import { AmadeusService } from '../../Services/amadeus.service';
import { SavedHotelsService } from '../../Services/saved-hotels.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

interface SearchResult {
    platform: string;
    url: string;
    price?: string;
    logo?: string;
}

@Component({
    selector: 'app-landing-center',
    templateUrl: './landing-center.component.html',
    styleUrls: ['./landing-center.component.css']
})
export class LandingCenterComponent implements OnInit {

    // Placeholder message property
    placeholderMessage: string = '';

    isSearching = false;

    // Search Fields
    location: string = '';

    // Autocomplete Fields
    cityInput: string = '';
    cityCode: string = ''; // Stores IATA code
    suggestions: any[] = [];
    isLoadingSuggestions = false;
    private searchSubject = new Subject<string>();

    checkInDate: string = ''; // Renamed to match HTML binding if needed, but existing was checkIn/checkOut
    checkOutDate: string = '';
    guests: number = 1;

    // Filters
    sortBy: string = 'relevant';
    selectedStars: Set<number> = new Set();
    availableAmenities: string[] = ['SWIMMING POOL', 'SPA', 'FITNESS CENTER', 'AIR CONDITIONING', 'RESTAURANT', 'PARKING', 'PETS ALLOWED', 'WIFI'];
    selectedAmenities: Set<string> = new Set();
    pendingAmenities: Set<string> = new Set();
    showAmenities = false;

    get hasActiveFilters(): boolean {
        return this.selectedStars.size > 0 || this.selectedAmenities.size > 0 || this.sortBy !== 'relevant';
    }

    // Dynamic Results
    searchResults: any[] = [];
    paginatedHotels: any[] = [];
    isLoading = false;
    errorMessage = '';

    currentPage = 1;
    itemsPerPage = 100; // Standard Limit
    totalRecords = 0;

    userEmail: string = '';

    constructor(private router: Router, private affiliateService: AffiliateService, private amadeusService: AmadeusService, private savedHotelsService: SavedHotelsService) { }

    ngOnInit(): void {
        // Setup Debounce
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term => this.amadeusService.searchLocations(term))
        ).subscribe({
            next: (res: any) => {
                this.suggestions = res.data || [];
                this.isLoadingSuggestions = false;
            },
            error: () => this.isLoadingSuggestions = false
        });

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        this.userEmail = user.email;
    }

    get totalPages(): number {
        return Math.ceil(this.totalRecords / this.itemsPerPage);
    }

    // Autocomplete Handlers
    onCityInput(value: string) {
        this.cityInput = value;
        if (value.length === 3) this.cityCode = value.toUpperCase();
        else this.cityCode = '';

        if (value.length > 2) {
            this.isLoadingSuggestions = true;
            this.searchSubject.next(value);
        } else {
            this.suggestions = [];
            this.isLoadingSuggestions = false;
        }
    }

    selectCity(item: any) {
        this.cityInput = `${item.name} (${item.iataCode})`;
        this.cityCode = item.iataCode;
        this.suggestions = [];
        this.isLoadingSuggestions = false;
    }

    // Mobile View Toggle
    showMobileSearchForm: boolean = false;

    toggleSearchForm() {
        this.showMobileSearchForm = !this.showMobileSearchForm;
    }

    search() {
        // Validation
        if (!this.cityCode && this.cityInput.length !== 3) {
            // Try to use raw input if it looks like a code, otherwise warn
            if (this.cityInput.length === 3) this.cityCode = this.cityInput.toUpperCase();
            else {
                alert('Please select a city from the suggestions or enter a valid 3-letter IATA code.');
                return;
            }
        }
        if (!this.checkInDate || !this.checkOutDate) {
            alert('Please select Check-in and Check-out dates.');
            return;
        }

        this.showMobileSearchForm = false; // Show results on mobile
        this.currentPage = 1;
        this.fetchHotels();
    }

    fetchHotels() {
        if (!this.cityCode) return;

        this.isSearching = true;
        this.isLoading = true;
        this.errorMessage = '';
        this.paginatedHotels = []; // Clear current view

        this.amadeusService.searchHotels(
            this.cityCode,
            this.checkInDate,
            this.checkOutDate,
            this.guests,
            this.currentPage,
            this.itemsPerPage,
            this.sortBy,
            Array.from(this.selectedStars).join(','),
            Array.from(this.selectedAmenities).join(',')
        ).subscribe({
            next: (response) => {
                const rawData = response.data || [];
                // Filter locally for safety
                this.paginatedHotels = rawData;

                // Use backend total if available, else fallback
                this.totalRecords = response.meta?.total || (this.paginatedHotels.length + (this.currentPage * this.itemsPerPage));

                this.isLoading = false;

                // Scroll to top
                const resultsPanel = document.querySelector('.results-panel');
                if (resultsPanel) resultsPanel.scrollIntoView({ behavior: 'smooth' });

                this.checkSavedStatus(this.paginatedHotels);
            },
            error: (error) => {
                console.error('Error fetching hotels:', error);
                this.errorMessage = 'Failed to load hotels. Please try again.';
                this.isLoading = false;
            }
        });
    }

    onSortChange(value: string) {
        this.sortBy = value;
        this.currentPage = 1;
        this.fetchHotels();
    }

    toggleStarFilter(star: number) {
        if (this.selectedStars.has(star)) {
            this.selectedStars.delete(star);
        } else {
            this.selectedStars.add(star);
        }
        this.currentPage = 1;
        this.fetchHotels();
    }

    // Updated Amenities Logic (Pending State)
    openAmenitiesDropdown() {
        this.pendingAmenities = new Set(this.selectedAmenities);
        this.showAmenities = true;
    }

    togglePendingAmenity(amenity: string) {
        if (this.pendingAmenities.has(amenity)) {
            this.pendingAmenities.delete(amenity);
        } else {
            this.pendingAmenities.add(amenity);
        }
    }

    applyAmenities() {
        this.selectedAmenities = new Set(this.pendingAmenities);
        this.showAmenities = false;
        this.currentPage = 1;
        this.fetchHotels();
    }

    isAmenityPending(amenity: string): boolean {
        return this.pendingAmenities.has(amenity);
    }

    isStarSelected(star: number): boolean {
        return this.selectedStars.has(star);
    }

    // Kept for backward compatibility if needed, but not used in new flow
    isAmenitySelected(amenity: string): boolean {
        return this.selectedAmenities.has(amenity);
    }

    changePage(page: number) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.fetchHotels();
    }

    // Infinite Scroll logic (Element Scrolled)
    // KEPT FOR INTERNAL SCROLL but doing nothing for pagination now
    onScroll(event: any) {
        // No-op for now unless we re-enable infinite scroll
    }


    getExpediaLink(hotel: any): string {
        if (!hotel) return '#';
        const baseUrl = 'https://www.expedia.com/Hotel-Search';

        // Construct Query: Name + City (Address sometimes confuses the matcher)
        const query = `${hotel.name}, ${hotel.cityCode || ''}`;
        const encodedQuery = encodeURIComponent(query.trim());

        // Build URL params
        let params = `destination=${encodedQuery}&affcid=US.DIRECT.PHG.1100l418021.0&ref_id=1110lJYuncK`;

        // Add Dates if selected
        if (this.checkInDate) params += `&startDate=${this.checkInDate}`;
        if (this.checkOutDate) params += `&endDate=${this.checkOutDate}`;

        // Add Guests
        if (this.guests) params += `&adults=${this.guests}`;

        return `${baseUrl}?${params}`;
    }

    toggleSave(hotel: any) {
        if (!this.userEmail) {
            alert("Please log in to save hotels.");
            return;
        }

        // Optimistically toggle UI (need a property on hotel object)
        if (hotel.isSaved) {
            // Remove
            this.savedHotelsService.removeHotel(this.userEmail, hotel.hotel.hotelId).subscribe({
                next: () => {
                    hotel.isSaved = false;
                },
                error: (err) => {
                    console.error("Error removing hotel", err);
                    alert("Failed to remove hotel.");
                }
            });
        } else {
            // Save
            this.savedHotelsService.saveHotel(this.userEmail, hotel).subscribe({
                next: () => {
                    hotel.isSaved = true;
                },
                error: (err) => {
                    console.error("Error saving hotel", err);
                    if (err.status === 409) {
                        hotel.isSaved = true; // Already saved
                    } else {
                        alert("Failed to save hotel.");
                    }
                }
            });
        }
    }

    // Check saved status when loading results
    checkSavedStatus(hotels: any[]) {
        if (!this.userEmail) return;

        // This might be heavy if many results, doing it one by one or getting all saved IDs first is better
        // For now, let's fetch all saved IDs for the user and map them
        this.savedHotelsService.getSavedHotels(this.userEmail).subscribe(saved => {
            const savedIds = new Set(saved.map(s => s.hotel_id));
            hotels.forEach(h => {
                if (savedIds.has(h.hotel.hotelId)) {
                    h.isSaved = true;
                }
            });
        });
    }
}
