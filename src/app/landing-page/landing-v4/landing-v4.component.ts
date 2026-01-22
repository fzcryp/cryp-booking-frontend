import { AfterViewInit, Component } from '@angular/core';

@Component({
    selector: 'app-landing-v4',
    templateUrl: './landing-v4.component.html',
    styleUrls: ['./landing-v4.component.css']
})
export class LandingV4Component implements AfterViewInit {

    activeTab: string = 'hotels'; // Default tab

    setActiveTab(tab: string) {
        this.activeTab = tab;
    }

    ngAfterViewInit(): void {
        // --- Hotel Widget Setup ---
        (window as any).TP_FORM_SETTINGS = {
            marker: "697922",
            type: "hotel",
            currency: "usd",
            language: "en",
            width: "100%"
        };

        const hotelScript = document.createElement('script');
        hotelScript.type = 'text/javascript';
        hotelScript.async = true;
        hotelScript.src = "https://www.travelpayouts.com/widgets/hotel-search.js";

        const hotelContainer = document.getElementById('tp-hotel-widget');
        if (hotelContainer) {
            hotelContainer.appendChild(hotelScript);
        }

        // --- Flight Widget Setup ---
        const flightScript = document.createElement('script');
        flightScript.async = true;
        flightScript.src = 'https://tpwdg.com/content?currency=usd&trs=491029&shmarker=697922&locale=en&powered_by=true&limit=4&primary_color=00AE98&results_background_color=FFFFFF&form_background_color=FFFFFF&campaign_id=111&promo_id=3411';
        flightScript.charset = 'utf-8';

        const flightContainer = document.getElementById('tp-flight-widget');
        if (flightContainer) {
            flightContainer.appendChild(flightScript);
        }

        // --- Car Widget Setup ---
        const carScript = document.createElement('script');
        carScript.async = true;
        // Removed fixed city/country params to allow open search
        carScript.src = '//tpwdg.com/content?trs=491029&shmarker=697922&locale=en&powered_by=true&campaign_id=87&promo_id=2466';
        carScript.charset = 'utf-8';

        const carContainer = document.getElementById('tp-car-widget');
        if (carContainer) {
            carContainer.appendChild(carScript);
        }
    }
}
