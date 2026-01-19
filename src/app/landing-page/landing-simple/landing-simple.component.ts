import { Component, OnInit, ViewEncapsulation, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AffiliateService } from '../../Services/affiliate.service';
import { AmadeusService } from '../../Services/amadeus.service';
import { SavedHotelsService } from '../../Services/saved-hotels.service';
import { SavedFlightsService } from '../../Services/saved-flights.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import * as L from 'leaflet';

// Fix Leaflet Marker Icons
const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
    selector: 'app-landing-simple',
    templateUrl: './landing-simple.component.html',
    styleUrls: ['./landing-simple.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class LandingSimpleComponent implements OnInit {

    // Map Modal State
    showMapModal = false;
    private map: any;
    selectedMapHotel: any = null; // Stores the currently selected hotel for the map card

    // Placeholder message property
    placeholderMessage: string = '';

    isSearching = false;
    activeTab: 'stays' | 'flights' = 'stays'; // Default tab

    // ==========================================
    // FLIGHT PROPERTIES
    // ==========================================
    flightOriginInput: string = '';
    flightDestInput: string = '';
    flightOriginCode: string = '';
    flightDestCode: string = '';
    flightDepartDate: string = '';
    flightReturnDate: string = '';
    flightGuests: number = 1;

    originSuggestions: any[] = [];
    destSuggestions: any[] = [];
    isOriginLoading = false;
    isDestLoading = false;
    isFlightLoading = false;

    // Curated high-quality flight/airport placeholder images (Unsplash)
    flightImages: string[] = [
        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1542296332-2e44a99cfef0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1524592714635-d77511a4834d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1540962351504-03099e0a754b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1520437358207-323b43b50729?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1569154941061-e0032868fe6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1520183802803-06f731a2059f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1506012787146-5921ab4d6d09?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    ];

    // Curated high-quality hotel placeholder images (Unsplash)
    hotelImages: string[] = [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1551918120-9739cb430c6d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1535827841776-24afc1e255ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1496417263034-38ec4f0d665a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    ];


    // Flight Filters
    flightNameFilter: string = '';
    flightSortBy: string = 'relevant';

    // Subjects for Flight Autocomplete
    private originSearch$ = new Subject<string>();
    private destSearch$ = new Subject<string>();



    flightResults: any[] = [];

    get filteredFlights(): any[] {
        let flights = [...this.flightResults];

        // 1. Filter by Airline Name
        if (this.flightNameFilter.trim()) {
            const filter = this.flightNameFilter.toLowerCase();
            flights = flights.filter(f => f.airlineName && f.airlineName.toLowerCase().includes(filter));
        }

        // 2. Sort
        if (this.flightSortBy === 'price_asc') {
            flights.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
        } else if (this.flightSortBy === 'duration') {
            // Basic duration sort (parsing string like "5h 30m" -> minutes)
            // For simplicity, let's assume raw duration or just skip complex parse for now if not available
            // Or just sort by string which roughly works for "5h" vs "15h"
            flights.sort((a, b) => (a.duration || '').localeCompare(b.duration || ''));
        }
        // 'relevant' keeps API order

        return flights;
    }

    onFlightNameFilterChange() {
        // Trigger CD
    }

    onFlightSortChange(newValue: string) {
        this.flightSortBy = newValue;
    }

    flightTotalRecords = 0;
    flightCurrentPage = 1;
    flightErrorMessage = '';

    // ==========================================
    // HOTEL PROPERTIES
    // ==========================================

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
    errorMessage = '';
    isLoading = false;

    // Data handling
    hotels: any[] = [];
    fullListHotels: any[] = []; // Store ALL fetched hotels (cumulative)
    paginatedHotels: any[] = []; // Current page view
    totalRecords = 0;

    currentPage = 1;
    itemsPerPage = 100; // Standard Limit

    // Filter States for Client-Side Filtering
    propertyNameFilter: string = '';

    userEmail: string = '';

    constructor(
        private router: Router,
        private affiliateService: AffiliateService,
        private amadeusService: AmadeusService,
        private savedHotelsService: SavedHotelsService,
        private savedFlightsService: SavedFlightsService,
        private ngZone: NgZone
    ) { }

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

        // Init Flight Autocomplete
        this.setupFlightAutocomplete();
    }

    setupFlightAutocomplete() {
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

    // Flight Input Handlers
    onFlightOriginInput(value: string) {
        this.flightOriginInput = value;
        this.flightOriginCode = value.length === 3 ? value.toUpperCase() : '';
        if (value.length > 2) {
            this.isOriginLoading = true;
            this.originSearch$.next(value);
        } else {
            this.originSuggestions = [];
            this.isOriginLoading = false;
        }
    }

    onFlightDestInput(value: string) {
        this.flightDestInput = value;
        this.flightDestCode = value.length === 3 ? value.toUpperCase() : '';
        if (value.length > 2) {
            this.isDestLoading = true;
            this.destSearch$.next(value);
        } else {
            this.destSuggestions = [];
            this.isDestLoading = false;
        }
    }

    selectFlightOrigin(item: any) {
        this.flightOriginInput = `${item.name} (${item.iataCode})`;
        this.flightOriginCode = item.iataCode;
        this.originSuggestions = [];
    }

    selectFlightDest(item: any) {
        this.flightDestInput = `${item.name} (${item.iataCode})`;
        this.flightDestCode = item.iataCode;
        this.destSuggestions = [];
    }

    searchFlights() {
        const finalOrigin = this.flightOriginCode || this.flightOriginInput;
        const finalDest = this.flightDestCode || this.flightDestInput;

        if (!finalOrigin || !finalDest || !this.flightDepartDate) {
            alert('Please fill in Origin, Destination and Departure Date.');
            return;
        }

        this.isSearching = true;
        this.isLoading = true; // Use global loading state
        this.flightErrorMessage = '';
        this.flightResults = [];
        this.searchResults = []; // Clear hotel results
        this.flightCurrentPage = 1;

        this.amadeusService.searchFlights(
            finalOrigin,
            finalDest,
            this.flightDepartDate,
            this.flightReturnDate,
            this.flightGuests
        ).subscribe({
            next: (response) => {
                const rawData = response.data || [];
                this.flightResults = rawData;
                this.flightTotalRecords = rawData.length;

                if (this.flightResults.length === 0) {
                    this.flightErrorMessage = 'No flights found for this route.';
                }
                this.isLoading = false;
                this.checkSavedFlightsStatus(this.flightResults);
            },
            error: (error) => {
                console.error('Flight Search Error', error);
                this.flightErrorMessage = 'Failed to load flights.';
                this.isLoading = false;
            }
        });
    }

    toggleSaveFlight(flight: any) {
        if (!this.userEmail) {
            alert("Please log in to save flights.");
            return;
        }

        if (flight.isSaved) {
            // Remove
            this.savedFlightsService.removeFlight(this.userEmail, flight.id).subscribe({
                next: () => {
                    flight.isSaved = false;
                },
                error: (err) => {
                    console.error("Error removing flight", err);
                    alert("Failed to remove flight.");
                }
            });
        } else {
            // Save
            this.savedFlightsService.saveFlight(this.userEmail, flight).subscribe({
                next: () => {
                    flight.isSaved = true;
                },
                error: (err) => {
                    console.error("Error saving flight", err);
                    if (err.status === 409) {
                        flight.isSaved = true;
                    } else {
                        alert("Failed to save flight.");
                    }
                }
            });
        }
    }

    checkSavedFlightsStatus(flights: any[]) {
        if (!this.userEmail) return;

        this.savedFlightsService.getSavedFlights(this.userEmail).subscribe(saved => {
            const savedIds = new Set(saved.map(s => s.flight_id)); // DB field matches? Check route
            flights.forEach(f => {
                // saved_flights table uses flight_id. 
                // Flight object from Amadeus has 'id'. 
                // So if we saved f.id as flight_id, we check that.
                if (savedIds.has(f.id)) {
                    f.isSaved = true;
                }
            });
        });
    }

    openMap() {
        this.showMapModal = true;
        // Wait for DOM to render modal div
        setTimeout(() => {
            this.initMap();
        }, 300); // Increased timeout slightly to ensure transition is done
    }

    closeMap() {
        this.showMapModal = false;
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
    }

    private initMap() {
        if (this.map) {
            this.map.invalidateSize();
            return;
        }

        // Use fullListHotels for map data as requested
        const hotelsToDisplay = this.fullListHotels.length > 0 ? this.fullListHotels : this.paginatedHotels;

        // 1. Collect all valid coordinates first
        const validHotels = hotelsToDisplay.filter(h =>
            h.hotel &&
            h.hotel.latitude &&
            h.hotel.longitude &&
            h.hotel.latitude !== 0 &&
            h.hotel.longitude !== 0
        );

        if (validHotels.length === 0) {
            // Fallback if no valid coords
            this.map = L.map('map-container').setView([25.2048, 55.2708], 12);
            this.addTileLayer();
            return;
        }

        // 2. Calculate Median Location to identify the main cluster
        const lats = validHotels.map(h => h.hotel.latitude).sort((a, b) => a - b);
        const lngs = validHotels.map(h => h.hotel.longitude).sort((a, b) => a - b);

        const mid = Math.floor(lats.length / 2);
        const medianLat = lats.length % 2 !== 0 ? lats[mid] : (lats[mid - 1] + lats[mid]) / 2;
        const medianLng = lngs.length % 2 !== 0 ? lngs[mid] : (lngs[mid - 1] + lngs[mid]) / 2;

        // 3. Filter outliers: Keep only hotels within ~1.5 degree (approx 150km) of the median
        // This handles cases where data has wrong signs (e.g. 72 vs -72)
        const THRESHOLD_DEG = 1.5;
        const clusterHotels = validHotels.filter(h => {
            const dLat = Math.abs(h.hotel.latitude - medianLat);
            const dLng = Math.abs(h.hotel.longitude - medianLng);
            return dLat < THRESHOLD_DEG && dLng < THRESHOLD_DEG;
        });

        // Use the median as accurate center
        this.map = L.map('map-container').setView([medianLat, medianLng], 12);
        this.addTileLayer();

        const bounds = L.latLngBounds([]);
        let hasValidCoords = false;

        // 4. Add markers ONLY for the cluster (searched location area)
        clusterHotels.forEach(item => {
            const h = item.hotel;

            // Extract Price Info
            const offer = item.offers?.[0];
            const priceVal = offer?.price?.total;
            const currency = offer?.price?.currency || '';

            const priceText = priceVal ? `${currency} ${priceVal}` : 'View Deal';

            const popupContent = `
                <div style="text-align:center; min-width: 150px;">
                    <h4 style="margin:0 0 5px 0; font-size:14px; color:#003580;">${h.name}</h4>
                    <div style="font-weight:bold; margin-bottom:5px;">${priceText}</div>
                    <a href="${this.getExpediaLink(h)}" target="_blank"
                        style="display:inline-block; background:#1668e3; color:white; padding:5px 10px; border-radius:4px; text-decoration:none; font-size:12px;">
                        View Deal
                    </a>
                </div>
            `;

            // Custom Pill Marker (Name + Price)
            const hotelName = h.name || 'Hotel';

            // Use a subtler font size for price or keep same? User said "show price as well... in next line"
            const markerHtml = `
                <div class="map-marker-pill">
                    <span style="display:block; margin-bottom:2px;">${hotelName}</span>
                    <span style="display:block; font-weight:700; color:#fff; font-size:11px;">${priceText}</span>
                </div>
            `;

            const icon = L.divIcon({
                className: 'custom-div-icon',
                html: markerHtml,
                iconSize: undefined,
                iconAnchor: [50, 20] // Adjusted anchor slightly for taller pill
            });

            L.marker([h.latitude, h.longitude], { icon: icon })
                .addTo(this.map)
                .on('click', () => {
                    this.ngZone.run(() => {
                        this.selectedMapHotel = item;
                    });
                });

            bounds.extend([h.latitude, h.longitude]);
            hasValidCoords = true;
        });

        // Close card on map click
        this.map.on('click', () => {
            this.ngZone.run(() => {
                this.selectedMapHotel = null;
            });
        });

        if (hasValidCoords) {
            this.map.fitBounds(bounds, { padding: [50, 50] });
        }

        // Robust Resize Fix
        let resizeCount = 0;
        const resizeInterval = setInterval(() => {
            if (this.map) this.map.invalidateSize();
            resizeCount++;
            if (resizeCount > 10) clearInterval(resizeInterval);
        }, 100);
    }

    private addTileLayer() {
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(this.map);
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

    // Triggered by Property Name Input (Client-Side)
    onNameFilterChange() {
        this.applyNameFilter();
    }

    applyNameFilter() {
        if (!this.propertyNameFilter) {
            this.paginatedHotels = [...this.fullListHotels];
        } else {
            const lowerQuery = this.propertyNameFilter.toLowerCase();
            this.paginatedHotels = this.fullListHotels.filter(item =>
                item.hotel && item.hotel.name && item.hotel.name.toLowerCase().includes(lowerQuery)
            );
        }
    }

    private formatDate(date: any): string {
        if (!date) return '';
        if (date instanceof Date) {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        return date; // Assume it's already a string if not a Date object
    }

    fetchHotels() {
        if (!this.cityCode) return;

        this.isSearching = true;
        this.isLoading = true;
        this.errorMessage = '';
        this.paginatedHotels = []; // Clear current view
        this.fullListHotels = []; // Clear raw data

        // Format Dates for API
        const formattedCheckIn = this.formatDate(this.checkInDate);
        const formattedCheckOut = this.formatDate(this.checkOutDate);

        this.amadeusService.searchHotels(
            this.cityCode,
            formattedCheckIn,
            formattedCheckOut,
            this.guests,
            this.currentPage,
            this.itemsPerPage,
            this.sortBy,
            Array.from(this.selectedStars).join(','),
            Array.from(this.selectedAmenities).join(',')
        ).subscribe({
            next: (response) => {
                const rawData = response.data || [];

                // Store in full list for client-side filtering
                this.fullListHotels = rawData;

                // Apply filter immediately (in case user typed something while loading, though unlikely, good practice)
                this.applyNameFilter();

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

    // New: Instant Filter for Sidebar
    toggleAmenityFilter(amenity: string) {
        if (this.selectedAmenities.has(amenity)) {
            this.selectedAmenities.delete(amenity);
        } else {
            this.selectedAmenities.add(amenity);
        }
        this.currentPage = 1;
        this.fetchHotels();
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
        // Format dates if they are Date objects (reuse helper or duplicate logic simplicity)
        if (this.checkInDate) {
            const d = new Date(this.checkInDate);
            const formatted = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
            params += `&startDate=${formatted}`;
        }
        if (this.checkOutDate) {
            const d = new Date(this.checkOutDate);
            const formatted = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
            params += `&endDate=${formatted}`;
        }

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


    // Helper to get deterministic random image for a hotel
    getHotelImage(hotelId: any): string {
        if (!hotelId) return this.hotelImages[0];
        // Create simple hash from ID
        let hash = 0;
        const str = String(hotelId);
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        // Map to index
        const index = Math.abs(hash) % this.hotelImages.length;
        return this.hotelImages[index];
    }

    // Helper to get airline logo
    getAirlineLogo(airlineName: string): string {
        if (!airlineName) return '';
        // Using Clearbit Logo API which is standard for grabbing company logos
        // It requires domain, but often works with name too if simple. 
        // More reliable public free one is: https://logo.clearbit.com/[domain]
        // Since we don't have domain, we can guess or use another service.
        // Let's use a service that takes text/name better or try mapping common ones.

        // Simple mapping for demo/major airlines to ensure they look good
        const common: { [key: string]: string } = {
            'Delta': 'delta.com',
            'American Airlines': 'aa.com',
            'United Airlines': 'united.com',
            'Emirates': 'emirates.com',
            'Lufthansa': 'lufthansa.com',
            'Air France': 'airfrance.com',
            'British Airways': 'ba.com',
            'Qatar Airways': 'qatarairways.com',
            'Air India': 'airindia.com',
            'IndiGo': 'goindigo.in',
            'Singapore Airlines': 'singaporeair.com',
            'Turkish Airlines': 'turkishairlines.com',
            'KLM': 'klm.com',
            'Japan Airlines': 'jal.com',
            'ANA': 'ana.co.jp',
            'Cathay Pacific': 'cathaypacific.com',
            'Etihad Airways': 'etihad.com'
        };

        // Heuristic: Remove spaces for domain guess
        const domain = common[airlineName] || `${airlineName.replace(/\s+/g, '').toLowerCase()}.com`;

        return `https://logo.clearbit.com/${domain}`;
    }
    // Helper to get deterministic random image for an airline (flight)
    getAirlineImage(airlineName: string): string {
        if (!airlineName) return this.flightImages[0];

        // Specific image for Air India as per request
        if (airlineName.toLowerCase().includes('air india') || airlineName.toLowerCase().includes('airindia')) {
            return 'https://akm-img-a-in.tosshub.com/sites/dailyo//resources/202308/blob110823105239.png';
        }

        let hash = 0;
        const str = airlineName;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % this.flightImages.length;
        return this.flightImages[index];
    }
}
