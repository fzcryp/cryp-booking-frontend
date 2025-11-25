import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  constructor(private http: HttpClient) {}

saveTransactionToDB(transaction: any) {
  this.http.post('http://localhost:4000/api/transactions', transaction).subscribe({
    next: (res) => console.log('✅ Transaction saved:', res),
    error: (err) => console.error('❌ Error saving transaction:', err)
  });
}

  ngOnInit(): void {

     const userEmail = localStorage.getItem('userEmail');
  if (userEmail) {
    this.fetchUserBalance(userEmail);
  }
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
      this.http.patch(`http://localhost:4000/api/users/update-balance/${email}`, { amount })
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
  }
fetchUserBalance(email: string) {
  this.http.get<{ balance: number }>(`http://localhost:4000/api/users/balance/${email}`)
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
