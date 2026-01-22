import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Currency {
    code: string;
    name: string;
    flagCode: string; // e.g. 'us', 'in'
}

@Injectable({
    providedIn: 'root'
})
export class CurrencyService {
    private apiUrl = 'https://api.unirateapi.com/api/rates?api_key=XqUQHX5l9ZeSIW0VJxef8nA1ZbNWIhXoNHwmAgkM8Q3qPE0JzD0soogf0o4PeriB&from=USD';

    // Default currency
    private currentCurrencySubject = new BehaviorSubject<Currency>({
        code: 'USD',
        name: 'United States Dollar',
        flagCode: 'us'
    });

    public currentCurrency$ = this.currentCurrencySubject.asObservable();

    // Exchange rates cache (USD base)
    // Relying on live API for rates
    private rates: { [key: string]: number } = {};
    private ratesSubject = new BehaviorSubject<{ [key: string]: number }>({});
    public rates$ = this.ratesSubject.asObservable();

    constructor(private http: HttpClient) {
        this.fetchRates();
    }

    // Fetch live rates
    fetchRates() {
        this.http.get<any>(this.apiUrl).subscribe({
            next: (data) => {
                console.log('CurrencyService: UniRateAPI response', data);
                // Adjust this if UniRateAPI returns a different structure (e.g. data.data)
                // Assuming data.rates based on query 'rates'
                this.rates = data.rates || data.data || {};
                this.ratesSubject.next(this.rates);
            },
            error: (error) => {
                console.error('CurrencyService: Error fetching exchange rates:', error);
                // We still have fallback rates, so we don't need to panic
            }
        });
    }

    // Update selected currency
    setCurrency(currency: Currency) {
        console.log('CurrencyService: Setting currency to', currency.code);
        this.currentCurrencySubject.next(currency);
    }

    getCurrentCurrencyValue(): Currency {
        return this.currentCurrencySubject.value;
    }

    // Convert amount from USD to selected currency
    convertPrice(amountInUsd: number): number {
        const targetCode = this.currentCurrencySubject.value.code;

        // If rates not loaded or USD selected, return original
        if (!this.rates[targetCode] || targetCode === 'USD') {
            if (targetCode !== 'USD') {
                console.warn(`CurrencyService: Rate not found for ${targetCode} or rates not loaded yet.`);
            }
            return amountInUsd;
        }

        const rate = this.rates[targetCode];
        const converted = amountInUsd * rate;
        // console.log(`Converting ${amountInUsd} USD to ${targetCode} (Rate: ${rate}) = ${converted}`);
        return converted;
    }
}
