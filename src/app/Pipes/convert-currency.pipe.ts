
import { Pipe, PipeTransform, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CurrencyService } from '../Services/currency/currency.service';
import { Subscription, merge } from 'rxjs';

@Pipe({
    name: 'convertCurrency',
    pure: false
})
export class ConvertCurrencyPipe implements PipeTransform, OnDestroy {
    private subscription: Subscription;

    constructor(private currencyService: CurrencyService, private _ref: ChangeDetectorRef) {
        // Subscribe to both currency changes AND rate loads
        this.subscription = merge(
            this.currencyService.currentCurrency$,
            this.currencyService.rates$
        ).subscribe(() => {
            this._ref.markForCheck();
        });
    }

    transform(priceInUsd: number): number {
        if (priceInUsd === null || priceInUsd === undefined) return 0;

        // We can rely on the service to hold the latest rates and current currency
        return this.currencyService.convertPrice(priceInUsd);
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
