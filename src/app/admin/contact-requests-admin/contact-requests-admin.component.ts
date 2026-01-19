import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface ContactRequest {
    id: number;
    full_name: string;
    mobile_number: string;
    subject: string;
    created_at: string;
}

import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-contact-requests-admin',
    templateUrl: './contact-requests-admin.component.html',
    styleUrls: ['./contact-requests-admin.component.css']
})
export class ContactRequestsAdminComponent implements OnInit {
    requests: ContactRequest[] = [];
    selectedRequest: ContactRequest | null = null;
    apiUrl = `${environment.apiUrl}/contact`;

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        this.fetchRequests();
    }

    fetchRequests() {
        this.http.get<{ status: string, data: ContactRequest[] }>(this.apiUrl)
            .subscribe({
                next: (res) => {
                    this.requests = res.data;
                },
                error: (err) => console.error('Failed to fetch contact requests', err)
            });
    }

    openModal(req: ContactRequest) {
        this.selectedRequest = req;
    }

    closeModal() {
        this.selectedRequest = null;
    }
}
