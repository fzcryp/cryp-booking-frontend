import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../Services/auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: any;
  referralHistory: any[] = [];
  totalBookings: number = 0;
  totalRewards: number = 0;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadReferralHistory();
  }

  loadUserProfile() {
    const id = JSON.parse(localStorage.getItem('user') || '{}').id;
    // Assuming your AuthService stores the logged-in user
    this.auth.getCurrentUser(id).subscribe({
      next: (res) => {
        // res should include user info + referral history + totals
        this.user = res.user;
        this.referralHistory = res.referralHistory;
        this.totalBookings = res.totalBookings;
        this.totalRewards = res.totalRewards;
      },
      error: (err) => console.error('Error loading profile', err)
    });
  }

    // Example API call for total bookings & rewards
  //   this.http.get<any>(`/api/users/${this.user.id}/stats`).subscribe({
  //     next: (res) => {
  //       this.totalBookings = res.totalBookings;
  //       this.totalRewards = res.totalRewards;
  //     },
  //     error: (err) => console.error(err)
  //   });
  // }

  loadReferralHistory() {
    this.http.get<any>(`/api/referral/history/${this.user.id}`).subscribe({
      next: (res) => {
        this.referralHistory = res.history;
      },
      error: (err) => console.error(err)
    });
  }
}
