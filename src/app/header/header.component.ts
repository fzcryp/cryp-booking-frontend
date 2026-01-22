import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../Services/auth/auth.service';
import { CurrencyService } from '../Services/currency/currency.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  menuOpen = false;
  profileMenuOpen = false;
  designMenuOpen = false;
  isScrolled = false;

  currencyMenuOpen = false;
  selectedCurrency = { code: 'USD', name: 'United States Dollar', flagCode: 'us' };

  currencies = [
    { code: 'USD', name: 'United States Dollar', flagCode: 'us' },
    { code: 'EUR', name: 'Euro', flagCode: 'eu' },
    { code: 'GBP', name: 'British Pound', flagCode: 'gb' },
    { code: 'INR', name: 'Indian Rupee', flagCode: 'in' },
    { code: 'AED', name: 'UAE Dirham', flagCode: 'ae' },
    { code: 'AUD', name: 'Australian Dollar', flagCode: 'au' },
    { code: 'CAD', name: 'Canadian Dollar', flagCode: 'ca' },
    { code: 'CHF', name: 'Swiss Franc', flagCode: 'ch' },
    { code: 'CNY', name: 'Chinese Yuan', flagCode: 'cn' },
    { code: 'JPY', name: 'Japanese Yen', flagCode: 'jp' },
    { code: 'NZD', name: 'New Zealand Dollar', flagCode: 'nz' },
    { code: 'SGD', name: 'Singapore Dollar', flagCode: 'sg' },
    { code: 'HKD', name: 'Hong Kong Dollar', flagCode: 'hk' },
    { code: 'SEK', name: 'Swedish Krona', flagCode: 'se' },
    { code: 'NOK', name: 'Norwegian Krone', flagCode: 'no' },
    { code: 'DKK', name: 'Danish Krone', flagCode: 'dk' },
    { code: 'KRW', name: 'South Korean Won', flagCode: 'kr' },
    { code: 'TRY', name: 'Turkish Lira', flagCode: 'tr' },
    { code: 'RUB', name: 'Russian Ruble', flagCode: 'ru' },
    { code: 'BRL', name: 'Brazilian Real', flagCode: 'br' },
    { code: 'ZAR', name: 'South African Rand', flagCode: 'za' },
    { code: 'TWD', name: 'New Taiwan Dollar', flagCode: 'tw' },
    { code: 'PLN', name: 'Polish Zloty', flagCode: 'pl' },
    { code: 'THB', name: 'Thai Baht', flagCode: 'th' },
    { code: 'IDR', name: 'Indonesian Rupiah', flagCode: 'id' },
    { code: 'MYR', name: 'Malaysian Ringgit', flagCode: 'my' },
    { code: 'PHP', name: 'Philippine Peso', flagCode: 'ph' },
    { code: 'VND', name: 'Vietnamese Dong', flagCode: 'vn' },
    { code: 'SAR', name: 'Saudi Riyal', flagCode: 'sa' },
    { code: 'MXN', name: 'Mexican Peso', flagCode: 'mx' },
    { code: 'ARS', name: 'Argentine Peso', flagCode: 'ar' },
    { code: 'CLP', name: 'Chilean Peso', flagCode: 'cl' },
    { code: 'COP', name: 'Colombian Peso', flagCode: 'co' },
    { code: 'EGP', name: 'Egyptian Pound', flagCode: 'eg' },
    { code: 'ILS', name: 'Israeli New Shekel', flagCode: 'il' },
    { code: 'HUF', name: 'Hungarian Forint', flagCode: 'hu' },
    { code: 'CZK', name: 'Czech Koruna', flagCode: 'cz' },
    { code: 'RON', name: 'Romanian Leu', flagCode: 'ro' },
    { code: 'PKR', name: 'Pakistani Rupee', flagCode: 'pk' },
    { code: 'BDT', name: 'Bangladeshi Taka', flagCode: 'bd' },
    { code: 'LKR', name: 'Sri Lankan Rupee', flagCode: 'lk' },
    { code: 'NPR', name: 'Nepalese Rupee', flagCode: 'np' }
  ];

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;

    // Close Profile Menus
    if (!target.closest('.profile-dropdown') && !target.closest('.profile-btn-circle')) {
      this.profileMenuOpen = false;
      this.designMenuOpen = false;
    }

    // Close Currency Menu
    if (!target.closest('.currency-item') && !target.closest('.mobile-currency-selector')) {
      this.currencyMenuOpen = false;
    }
  }

  toggleCurrencyMenu() {
    this.currencyMenuOpen = !this.currencyMenuOpen;
    if (this.currencyMenuOpen) {
      this.menuOpen = false; // Close mobile menu if open
      this.profileMenuOpen = false;
    }
  }

  constructor(private authService: AuthService, private currencyService: CurrencyService) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    if (this.isLoggedIn) {
      const user = this.authService.getUser();
      // Check for isAdmin (handle boolean or 1/0)
      this.isAdmin = user?.isAdmin === 1;
    }

    // Subscribe to currency changes
    this.currencyService.currentCurrency$.subscribe(curr => {
      this.selectedCurrency = curr;
    });
  }

  logout() {
    this.isLoggedIn = false; // Immediately update UI
    this.authService.logout();
  }

  selectCurrency(currency: any) {
    this.currencyService.setCurrency(currency);
    this.currencyMenuOpen = false;
  }
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  toggleProfileMenu() {
    this.profileMenuOpen = !this.profileMenuOpen;
    if (this.profileMenuOpen) this.designMenuOpen = false; // Close other menu
  }

  toggleDesignMenu() {
    this.designMenuOpen = !this.designMenuOpen;
    if (this.designMenuOpen) this.profileMenuOpen = false; // Close other menu
  }

  closeProfileMenu() {
    this.profileMenuOpen = false;
  }

}
