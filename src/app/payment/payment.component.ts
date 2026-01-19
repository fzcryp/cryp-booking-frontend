import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  @ViewChild('paymentRef', { static: true }) paymentRef!: ElementRef;

  transactionCompleted: boolean = false;
  transactionDetails: any = null;
  userBalance: number = 0;

  // Withdrawal properties
  withdrawalAmount: number | null = null;
  withdrawalEmail: string = '';
  isWithdrawing: boolean = false;
  withdrawalMessage: string = '';
  withdrawalError: boolean = false;
  showVerifyModal: boolean = false;

  // Fee breakdown properties (Restored)
  paypalFee: number = 0;
  platformFee: number = 0;
  totalFee: number = 0;
  finalReceiveAmount: number = 0;

  // OTP properties
  otpSent: boolean = false;
  otpCode: string = '';
  isSendingOtp: boolean = false;
  isVerifyingOtp: boolean = false;
  otpMessage: string = '';
  otpError: boolean = false;

  constructor(private http: HttpClient) { }

  // Recalculate fees whenever amount changes (Restored)
  calculateFees() {
    if (!this.withdrawalAmount || this.withdrawalAmount <= 0) {
      this.paypalFee = 0;
      this.platformFee = 0;
      this.totalFee = 0;
      this.finalReceiveAmount = 0;
      return;
    }

    const amount = this.withdrawalAmount;
    // Match backend logic: 4.4% PayPal + 2% Platform
    this.paypalFee = Math.round((amount * 0.044 + Number.EPSILON) * 100) / 100;
    this.platformFee = Math.round((amount * 0.02 + Number.EPSILON) * 100) / 100;
    this.totalFee = Math.round((this.paypalFee + this.platformFee + Number.EPSILON) * 100) / 100;
    this.finalReceiveAmount = Math.round((amount - this.totalFee + Number.EPSILON) * 100) / 100;
  }

  openVerifyModal() {
    // Basic validation before opening modal
    if (!this.withdrawalAmount || this.withdrawalAmount <= 0) {
      this.withdrawalMessage = 'Please enter a valid amount.';
      this.withdrawalError = true;
      return;
    }
    if (!this.withdrawalEmail) {
      this.withdrawalMessage = 'Please enter your PayPal email.';
      this.withdrawalError = true;
      return;
    }
    if (this.withdrawalAmount > this.userBalance) {
      this.withdrawalMessage = 'Insufficient balance.';
      this.withdrawalError = true;
      return;
    }

    // Reset state
    this.withdrawalMessage = '';
    this.otpSent = false;
    this.otpCode = '';
    this.otpMessage = '';
    this.otpError = false;
    this.showVerifyModal = true;
  }

  closeVerifyModal() {
    this.showVerifyModal = false;
  }

  // Step 1: Send OTP
  sendOtp() {
    this.isSendingOtp = true;
    this.otpMessage = '';

    this.http.post(`${environment.apiUrl}/otp/send`, { email: this.withdrawalEmail })
      .subscribe({
        next: (res: any) => {
          console.log('✅ OTP Sent');
          this.isSendingOtp = false;
          this.otpSent = true;
          this.otpMessage = 'Verification code sent to your email.';
          this.otpError = false;
        },
        error: (err) => {
          console.error('❌ OTP Send Failed', err);
          this.isSendingOtp = false;
          this.otpMessage = 'Failed to send OTP. Please try again.';
          this.otpError = true;
        }
      });
  }

  // Step 2: Verify OTP
  verifyAndWithdraw() {
    if (!this.otpCode || this.otpCode.length < 6) {
      this.otpMessage = 'Please enter a valid 6-digit code';
      this.otpError = true;
      return;
    }

    this.isVerifyingOtp = true;
    this.otpMessage = '';

    this.http.post(`${environment.apiUrl}/otp/verify`, { email: this.withdrawalEmail, otp: this.otpCode })
      .subscribe({
        next: (res: any) => {
          console.log('✅ OTP Verified');
          // OTP is good, proceed to withdraw
          this.isVerifyingOtp = false;
          this.withdraw(); // Call original withdraw function
          this.closeVerifyModal();
        },
        error: (err) => {
          console.error('❌ OTP Verification Failed', err);
          this.isVerifyingOtp = false;
          this.otpMessage = err.error?.error || 'Invalid OTP. Please try again.';
          this.otpError = true;
        }
      });
  }

  saveTransactionToDB(transaction: any) {
    this.http.post(`${environment.apiUrl}/transactions`, transaction).subscribe({
      next: (res) => console.log('✅ Transaction saved:', res),
      error: (err) => console.error('❌ Error saving transaction:', err)
    });
  }

  // ✅ Withdraw Funds Logic
  withdraw() {
    if (!this.withdrawalAmount || this.withdrawalAmount <= 0) {
      this.withdrawalMessage = 'Please enter a valid amount.';
      this.withdrawalError = true;
      return;
    }
    if (!this.withdrawalEmail) {
      this.withdrawalMessage = 'Please enter your PayPal email.';
      this.withdrawalError = true;
      return;
    }
    if (this.withdrawalAmount > this.userBalance) {
      this.withdrawalMessage = 'Insufficient balance.';
      this.withdrawalError = true;
      return;
    }

    this.isWithdrawing = true;
    this.withdrawalMessage = '';
    this.withdrawalError = false;

    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');

    if (!token || !userEmail) {
      this.withdrawalMessage = 'User not authenticated.';
      this.withdrawalError = true;
      this.isWithdrawing = false;
      return;
    }

    const payload = {
      user_email: userEmail,
      amount: this.withdrawalAmount,
      paypal_email: this.withdrawalEmail
    };

    // Call Backend Withdraw API
    // Call Backend Withdraw API
    // Ensure "Bearer " prefix is standard, though backend handles both
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('🔹 Sending Withdraw Request with Token:', token ? 'Present' : 'Missing');

    this.http.post(`${environment.apiUrl}/withdraw`, payload, { headers })
      .subscribe({
        next: (res: any) => {
          console.log('✅ Withdrawal Successful:', res);
          this.isWithdrawing = false;
          this.withdrawalMessage = 'Withdrawal successful! Funds sent to your PayPal.';
          this.withdrawalError = false;

          // Refresh balance
          this.fetchUserBalance(userEmail);

          // Clear form
          this.withdrawalAmount = null;
          this.withdrawalEmail = '';
        },
        error: (err) => {
          console.error('❌ Withdrawal Failed:', err);
          this.isWithdrawing = false;
          this.withdrawalError = true;
          this.withdrawalMessage = err.error?.error || 'Withdrawal failed. Please try again.';
        }
      });
  }

  ngOnInit(): void {

    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      this.fetchUserBalance(userEmail);
    }

    // COMMENTED OUT ADD FUNDS LOGIC
    /*
    if (!(window as any).paypal) {
      console.error('❌ PayPal SDK not loaded!');
      return;
    }

    (window as any).paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal'
      },

      // 🧾 Create the order
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: '0.5', // You can make this dynamic later
              currency_code: 'USD'
            }
          }]
        });
      },

      // ✅ On successful payment
      onApprove: async (data: any, actions: any) => {
        try {
          const details = await actions.order.capture();
          console.log('✅ Payment Success:', details);

          this.transactionCompleted = true;
          this.transactionDetails = {
            transactionId: details.id,
            payerName: `${details.payer.name.given_name} ${details.payer.name.surname}`,
            amount: details.purchase_units[0].amount.value,
            currency: details.purchase_units[0].amount.currency_code,
            status: details.status,
            date: details.update_time,
            user_email: localStorage.getItem('userEmail')
          };

          // ✅ Save transaction to DB
          this.saveTransactionToDB(this.transactionDetails);

          // ✅ Deduct user balance after successful payment
          const email = localStorage.getItem('userEmail');
          const amount = parseFloat(this.transactionDetails.amount);
          if (email && amount) {
            this.http.patch(`${environment.apiUrl}/users/update-balance/${email}`, { amount })
              .subscribe({
                next: (res) => {
                  console.log('✅ Balance updated:', res);
                  // Refresh the displayed balance
                  this.fetchUserBalance(email);
                },
                error: (err) => console.error('❌ Error updating balance:', err)
              });
          }

        } catch (error) {
          console.error('❌ Capture Error:', error);
          const failedTx = {
            transactionId: 'N/A',
            payerName: 'Unknown',
            amount: '0.00',
            currency: 'USD',
            status: 'FAILED',
            date: new Date().toISOString()
          };
          this.saveTransactionToDB(failedTx);
        }
      },

      // ❌ On PayPal script or payment error
      onError: (err: any) => {
        console.error('❌ PayPal Error:', err);

        // Save failed transaction to DB
        const failedTx = {
          transactionId: 'N/A',
          payerName: 'Unknown',
          amount: '0.00',
          currency: 'USD',
          status: 'FAILED',
          date: new Date().toISOString()
        };
        this.saveTransactionToDB(failedTx);
      }
    }).render(this.paymentRef.nativeElement);
    */
  }
  fetchUserBalance(email: string) {
    this.http.get<{ balance: number }>(`${environment.apiUrl}/users/balance/${email}`)
      .subscribe({
        next: (res) => {
          this.userBalance = res.balance;
        },
        error: (err) => {
          console.error('Error fetching balance:', err);
        }
      });
  }
  // 📄 Generate professional PDF receipt
  downloadReceipt() {
    const doc = new jsPDF();
    const siteName = 'www.crypbooking.com';
    const title = 'Payment Receipt';

    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(title, 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 28, { align: 'center' });

    // Add a horizontal line
    doc.setDrawColor(0);
    doc.line(15, 32, 195, 32);

    // Transaction Table
    const transactionData = [
      ['Transaction ID', this.transactionDetails.transactionId],
      ['Name', this.transactionDetails.payerName],
      ['Amount', `$${this.transactionDetails.amount} ${this.transactionDetails.currency}`],
      ['Status', this.transactionDetails.status],
      ['Date', new Date(this.transactionDetails.date).toLocaleString()]
    ];

    (autoTable as any)(doc, {
      startY: 40,
      head: [['Field', 'Details']],
      body: transactionData,
      theme: 'grid',
      styles: {
        fontSize: 11,
        cellPadding: 5
      },
      headStyles: {
        fillColor: [0, 163, 176],
        textColor: [255, 255, 255],
        halign: 'center'
      },
      bodyStyles: {
        halign: 'left',
        valign: 'middle'
      }
    });

    // Total Section
    const totalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Amount: $${this.transactionDetails.amount} ${this.transactionDetails.currency}`, 15, totalY);

    // Thank You message
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your payment!', 15, totalY + 15);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(siteName, 105, 285, { align: 'center' });

    // Save PDF
    doc.save(`Payment_Receipt_${this.transactionDetails.transactionId}.pdf`);
  }
}
