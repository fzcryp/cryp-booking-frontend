import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'crypBooking';
  showHeader = true;

  showReferralTooltip = true; // tooltip open by default
  copied = false;

  // Example referral code
  referralCode:any = '';
  referralLink = ``;

  constructor(private router: Router) {
   
  }

  ngOnInit(): void {
    // Hide header on signin/signup pages
    this.router.events
      .pipe(filter((event:any) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const currentRoute = event.urlAfterRedirects;
        this.showHeader = !(currentRoute.includes('/signin') || currentRoute.includes('/signup'));
      });
  }

  toggleReferralTooltip() {
    this.referralCode = localStorage.getItem('referral');
    this.referralLink = `http://192.168.5.125:61451/signup?ref=${this.referralCode}`;
    this.showReferralTooltip = !this.showReferralTooltip;
  }

  closeReferralTooltip() {
    this.showReferralTooltip = false;
  }

copyReferralLink() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    // Modern browsers, HTTPS or localhost
    navigator.clipboard.writeText(this.referralLink).then(() => {
      this.showCopiedMessage();
    }).catch(err => {
      console.error('Failed to copy!', err);
    });
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = this.referralLink;
    textarea.style.position = 'fixed';  // avoid scrolling to bottom
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this.showCopiedMessage();
      } else {
        console.error('Fallback: Copy command failed');
      }
    } catch (err) {
      console.error('Fallback: Unable to copy', err);
    }

    document.body.removeChild(textarea);
  }
}

// Separate function to handle showing "Copied"
showCopiedMessage() {
  this.copied = true;
  setTimeout(() => this.copied = false, 2000);
}

}
