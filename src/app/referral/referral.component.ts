import { Component } from '@angular/core';
import { ReferralService } from '../Services/referral.service';

@Component({
  selector: 'app-referral',
  templateUrl: './referral.component.html',
  styleUrl: './referral.component.css'
})
export class ReferralComponent {

  user: any;
  referralHistory: any[] = [];
  loading = true;

  constructor(private referralService: ReferralService) {}

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');

    if (this.user?.id) {
      this.loadReferralHistory();
    }
  }

  loadReferralHistory() {
    this.referralService.getReferralHistory(this.user.id).subscribe({
      next: (res) => {
        this.referralHistory = res.history;
        this.loading = false;
      },
      error: (err) => {
        console.error("Error loading referral history:", err);
        this.loading = false;
      }
    });
  }
}
