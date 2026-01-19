import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {

  userBalance: number = 0;
  withdrawAmount: number = 0;

  paypalFee: number = 0;
  platformFee: number = 0;
  totalFee: number = 0;
  finalAmount: number = 0;

  apiUrl = 'http://localhost:4000/api'; // backend base URL

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      this.getBalance(userEmail);
    }
  }

  getBalance(email: string) {
    this.http.get<{ balance: number }>(`${this.apiUrl}/users/balance/${email}`)
      .subscribe({
        next: (res) => this.userBalance = res.balance,
        error: (err) => console.error('Error fetching balance:', err)
      });
  }

  calculateFees() {
    if (!this.withdrawAmount || this.withdrawAmount <= 0) {
      this.paypalFee = this.platformFee = this.totalFee = this.finalAmount = 0;
      return;
    }

    this.paypalFee = this.withdrawAmount * 0.044;
    this.platformFee = this.withdrawAmount * 0.02;
    this.totalFee = this.paypalFee + this.platformFee;
    this.finalAmount = this.withdrawAmount - this.totalFee;
  }

  withdrawFunds() {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      alert('User not logged in');
      return;
    }

    if (this.withdrawAmount <= 0) {
      alert('Please enter a valid withdrawal amount.');
      return;
    }

    if (this.withdrawAmount > this.userBalance) {
      alert('You do not have enough balance to withdraw this amount.');
      return;
    }

    // Prompt for PayPal email (since it might be different from user email, or we could just use userEmail if that's the design. 
    // For now, let's assume the user's registered email is their PayPal email OR prompts. 
    // Looking at the code, there was no input for paypal email in the component, it just used the user email impliedly or missed it.
    // The backend `withdraw.js` expects `paypal_email`. 
    // I will use `userEmail` as `paypal_email` for now to keep it simple, but ideally UI should ask.
    // However, looking at the previous implementation, it didn't even send paypal email properly (it sent email: userEmail).

    const withdrawalData = {
      user_email: userEmail,
      amount: this.withdrawAmount,
      paypal_email: userEmail // Default to user email for now
    };

    this.http.post(`${this.apiUrl}/withdraw`, withdrawalData)
      .subscribe({
        next: (res: any) => {
          alert('✅ Withdrawal successful! Payout processed.');
          this.getBalance(userEmail); // refresh balance
          this.withdrawAmount = 0;
          this.calculateFees();
        },
        error: (err) => {
          console.error('Withdrawal failed:', err);
          const errorMsg = err.error?.error || 'Withdrawal failed. Please try again.';
          alert(`❌ ${errorMsg}`);
        }
      });
  }
}
