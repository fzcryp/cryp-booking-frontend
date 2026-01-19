import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { environment } from '../../environments/environment';

@Component({
  selector: 'app-transaction',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  transactions: any[] = [];
  userEmail: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.userEmail = localStorage.getItem('userEmail') || '';
    if (this.userEmail) this.loadTransactions();
    else console.error('No user email found in localStorage');
  }

  loadTransactions(): void {
    this.http
      .get<any[]>(`${environment.apiUrl}/transactions/${this.userEmail}`)
      .subscribe({
        next: (res) => {
          console.log('✅ Transactions loaded:', res);
          this.transactions = res;
        },
        error: (err) => console.error('❌ Error loading transactions:', err)
      });
  }

  // ✅ PDF generator for each transaction
  downloadReceipt(tx: any): void {
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

    // Line separator
    doc.setDrawColor(0);
    doc.line(15, 32, 195, 32);

    // Transaction details
    // Transaction details
    // Note: Backend saves as 'amount_requested' for withdrawals, 'amount' for others. Check both.
    const amount = tx.amount || tx.amount_requested;
    const transactionData = [
      ['Transaction ID', tx.transaction_id],
      ['Name', tx.payer_name],
      ['Amount', `$${amount} ${tx.currency}`],
      ['Status', tx.status],
      ['Date', new Date(tx.date).toLocaleString()]
    ];

    (autoTable as any)(doc, {
      startY: 40,
      head: [['Field', 'Details']],
      body: transactionData,
      theme: 'grid',
      styles: { fontSize: 11, cellPadding: 5 },
      headStyles: { fillColor: [0, 163, 176], textColor: [255, 255, 255], halign: 'center' },
      bodyStyles: { halign: 'left', valign: 'middle' }
    });

    // Total section
    const totalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Amount: $${amount} ${tx.currency}`, 15, totalY);

    // Thank you message
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your payment!', 15, totalY + 15);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(siteName, 105, 285, { align: 'center' });

    // Save file
    doc.save(`Payment_Receipt_${tx.transaction_id}.pdf`);
  }
}
