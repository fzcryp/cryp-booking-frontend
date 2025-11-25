import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  constructor(private http: HttpClient) {}

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

    // Request backend to process withdrawal
    const withdrawalData = {
      email: userEmail,
      amount: this.withdrawAmount,
      finalAmount: this.finalAmount,
      paypalFee: this.paypalFee,
      platformFee: this.platformFee
    };

    this.http.post(`${this.apiUrl}/paypal/withdraw`, withdrawalData)
      .subscribe({
        next: (res: any) => {
          alert('✅ Withdrawal successful!');
          this.getBalance(userEmail); // refresh balance
          this.withdrawAmount = 0;
          this.calculateFees();
        },
        error: (err) => {
          console.error('Withdrawal failed:', err);
          alert('❌ Withdrawal failed. Please try again.');
        }
      });
  }
}
