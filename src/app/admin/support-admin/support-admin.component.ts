import { Component, OnInit } from '@angular/core';
import { SupportService } from '../../Services/support/support.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-support-admin',
    templateUrl: './support-admin.component.html',
    styleUrls: ['./support-admin.component.css']
})
export class SupportAdminComponent implements OnInit {
    requests: any[] = [];
    selectedRequest: any = null;
    replyText: string = '';
    isSending = false;

    constructor(private supportService: SupportService) { }

    ngOnInit(): void {
        this.loadRequests();
    }

    loadRequests() {
        this.supportService.getAllRequests().subscribe({
            next: (data) => this.requests = data,
            error: (err) => console.error('Error loading requests:', err)
        });
    }

    openReplyModal(req: any) {
        this.selectedRequest = req;
        this.replyText = '';
    }

    closeModal() {
        this.selectedRequest = null;
    }

    sendReply() {
        if (!this.selectedRequest || !this.replyText.trim()) return;

        this.isSending = true;
        this.supportService.replyToRequest(this.selectedRequest.id, this.replyText).subscribe({
            next: (res) => {
                this.selectedRequest.status = 'Replied';
                this.selectedRequest.admin_reply = this.replyText;

                // Update local list
                const idx = this.requests.findIndex(r => r.id === this.selectedRequest.id);
                if (idx !== -1) {
                    this.requests[idx].status = 'Replied';
                    this.requests[idx].admin_reply = this.replyText;
                }

                this.isSending = false;
                this.closeModal();
            },
            error: (err) => {
                console.error('Error sending reply:', err);
                this.isSending = false;
            }
        });
    }
}
