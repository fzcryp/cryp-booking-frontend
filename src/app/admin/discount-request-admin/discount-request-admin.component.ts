
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiscountService } from '../../Services/discount/discount.service';
import { UserService } from '../../Services/user/user.service'; // Added

import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-discount-request-admin',
    templateUrl: './discount-request-admin.component.html',
    styleUrls: ['./discount-request-admin.component.css']
})
export class DiscountRequestAdminComponent implements OnInit {
    requests: any[] = [];
    users: any[] = [];
    selectedUserId: string = '';
    userSearchText: string = ''; // Added for search
    selectedRequest: any = null;
    backendUrl = environment.backendUrl;

    // Approval Form State
    isVerified = false;
    totalBookingAmount: number = 0;
    discountPercentage: number = 0;
    calculatedDiscount: number = 0;

    constructor(
        private discountService: DiscountService,
        private userService: UserService // Inject UserService
    ) { }

    ngOnInit(): void {
        this.loadRequests();
        this.loadUsers();
    }

    loadRequests() {
        this.discountService.getAllRequests().subscribe({
            next: (data) => this.requests = data,
            error: (err) => console.error('Error loading requests:', err)
        });
    }

    loadUsers() {
        this.userService.getAllUsers().subscribe({
            next: (data) => this.users = data,
            error: (err) => console.error('Error loading users:', err)
        });
    }

    get filteredRequests() {
        let result = this.requests;

        // Filter by Dropdown Selection
        if (this.selectedUserId) {
            result = result.filter(req => req.user_id.toString() === this.selectedUserId.toString());
        }

        // Filter by Search Text (Directly Table)
        if (this.userSearchText) {
            const lowerSearch = this.userSearchText.toLowerCase();
            result = result.filter(req => req.user_name.toLowerCase().includes(lowerSearch));
        }

        return result;
    }

    getFileUrl(path: string): string {
        if (!path) return '';
        const normalizedPath = path.replace(/\\/g, '/');
        return `${this.backendUrl}${normalizedPath} `;
    }

    isImage(path: string): boolean {
        return path?.match(/\.(jpeg|jpg|gif|png)$/) != null;
    }

    openModal(request: any) {
        this.selectedRequest = request;
        // Reset form
        this.isVerified = false;
        this.totalBookingAmount = 0;
        this.discountPercentage = 0;
        this.calculatedDiscount = 0;
    }

    closeModal() {
        this.selectedRequest = null;
    }

    calculateDiscount() {
        if (this.totalBookingAmount && this.discountPercentage) {
            this.calculatedDiscount = (this.totalBookingAmount * this.discountPercentage) / 100;
        } else {
            this.calculatedDiscount = 0;
        }
    }

    updateStatus(status: 'Approved' | 'Rejected') {
        if (!this.selectedRequest) return;

        // Validate Approval
        if (status === 'Approved') {
            if (!this.isVerified) {
                alert('Please verify the booking details checkbox.');
                return;
            }
            if (this.calculatedDiscount <= 0) {
                alert('Please calculate a valid discount amount.');
                return;
            }
        }

        this.discountService.updateStatus(
            this.selectedRequest.id,
            status,
            status === 'Approved' ? this.calculatedDiscount : undefined,
            status === 'Approved' ? this.selectedRequest.user_id : undefined
        ).subscribe({
            next: (res) => {
                // Update local state
                this.selectedRequest.status = status;
                const reqIndex = this.requests.findIndex(r => r.id === this.selectedRequest.id);
                if (reqIndex !== -1) {
                    this.requests[reqIndex].status = status;
                }
                this.closeModal();
                alert(`Request ${status} successfully! ${status === 'Approved' ? 'Balance credited.' : ''} `);
            },
            error: (err) => console.error('Error updating status:', err)
        });
    }
}
