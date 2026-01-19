import { Component } from '@angular/core';
import { SubscriberService } from '../Services/subscriber.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  email: string = '';

  constructor(private subscriberService: SubscriberService) { }

  onSubscribe(): void {
    if (!this.email || !this.email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    this.subscriberService.subscribe(this.email).subscribe({
      next: (res) => {
        alert(res.message);
        this.email = ''; // Clear input
      },
      error: (err) => {
        alert(err.error?.message || 'Subscription failed. Please try again.');
      }
    });
  }
}
