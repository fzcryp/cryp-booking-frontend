import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AffiliateService } from '../Services/affiliate.service';

interface SearchResult {
    platform: string;
    url: string;
    price?: string;
    logo?: string;
}

@Component({
    selector: 'app-hotels',
    templateUrl: './hotels.component.html',
    styleUrls: ['./hotels.component.css']
})
export class HotelsComponent implements OnInit {

    isSearching = false;

    // Search Fields
    location: string = '';
    checkIn: string = '';
    checkOut: string = '';
    guests: number = 1;

    // Dynamic Results
    searchResults: SearchResult[] = [];
    affiliates: any[] = [];

    constructor(private router: Router, private affiliateService: AffiliateService) { }

    ngOnInit(): void {
        alert("welcome to actual hotel page")
        this.fetchAffiliates();
    }

    fetchAffiliates() {
        this.affiliateService.getPartners().subscribe(
            (data) => {
                // Filter only active partners just in case endpoint returns all
                this.affiliates = data.filter(p => p.is_active);
            },
            (error) => console.error('Error loading affiliates', error)
        );
    }

    searchHotels() {
        if (!this.location || !this.checkIn || !this.checkOut) {
            alert('Please fill in all search fields');
            return;
        }

        this.isSearching = true;

        // Parse Date Components for granular placeholders
        const [cInYear, cInMonth, cInDay] = this.checkIn.split('-');
        const [cOutYear, cOutMonth, cOutDay] = this.checkOut.split('-');

        // Generate dynamic results from affiliates
        this.searchResults = this.affiliates.map(partner => {
            let url = partner.link_template;

            // Standard Replacements
            url = url.replace(/\$\{location\}/g, encodeURIComponent(this.location));
            url = url.replace(/\$\{guests\}/g, this.guests.toString());
            url = url.replace(/\$\{checkIn\}/g, this.checkIn);
            url = url.replace(/\$\{checkOut\}/g, this.checkOut);

            // "Global" JS-style Replacements (for templates like ${this.checkIn})
            url = url.replace(/\$\{this\.location\}/g, encodeURIComponent(this.location));
            url = url.replace(/\$\{this\.checkIn\}/g, this.checkIn);
            url = url.replace(/\$\{this\.checkOut\}/g, this.checkOut);
            url = url.replace(/\$\{this\.guests\}/g, this.guests.toString());

            // Detailed Date Replacements (for Booking.com etc)
            // Expects templates like: checkin_year=${checkInYear}
            url = url.replace(/\$\{checkInYear\}/g, cInYear || '');
            url = url.replace(/\$\{checkInMonth\}/g, cInMonth || '');
            url = url.replace(/\$\{checkInDay\}/g, cInDay || '');

            url = url.replace(/\$\{checkOutYear\}/g, cOutYear || '');
            url = url.replace(/\$\{checkOutMonth\}/g, cOutMonth || '');
            url = url.replace(/\$\{checkOutDay\}/g, cOutDay || '');

            // Fallback for user's attempted JS syntax (converting their specific pattern to values if they don't update DB immediately)
            // This is a "best effort" to handle the string "${this.checkIn.split('-')[0]}" literally
            url = url.replace(/\$\{this\.checkIn\.split\('-'\)\[0\]\}/g, cInYear || '');
            url = url.replace(/\$\{this\.checkIn\.split\('-'\)\[1\]\}/g, cInMonth || '');
            url = url.replace(/\$\{this\.checkIn\.split\('-'\)\[2\]\}/g, cInDay || '');

            url = url.replace(/\$\{this\.checkOut\.split\('-'\)\[0\]\}/g, cOutYear || '');
            url = url.replace(/\$\{this\.checkOut\.split\('-'\)\[1\]\}/g, cOutMonth || '');
            url = url.replace(/\$\{this\.checkOut\.split\('-'\)\[2\]\}/g, cOutDay || '');

            console.log('Processed URL for ' + partner.platform_name + ':', url);

            return {
                platform: partner.platform_name,
                url: url,
                logo: partner.logo_url
            };
        });

        console.log('Generated Results:', this.searchResults);
    }
}
