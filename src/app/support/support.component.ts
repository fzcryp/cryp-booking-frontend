import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SupportService } from '../Services/support/support.service';

@Component({
    selector: 'app-support',
    templateUrl: './support.component.html',
    styleUrls: ['./support.component.css']
})
export class SupportComponent implements OnInit {
    supportForm: FormGroup;
    myRequests: any[] = [];
    isSubmitting = false;
    successMessage = '';
    userId: number | null = null;

    // FAQ Data moved to FaqComponent


    constructor(
        private fb: FormBuilder,
        private supportService: SupportService
    ) {
        this.supportForm = this.fb.group({
            subject: ['', Validators.required],
            message: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            this.userId = user.id;
            this.loadMyRequests();
        }
    }

    loadMyRequests() {
        if (this.userId) {
            this.supportService.getUserRequests(this.userId).subscribe({
                next: (data) => this.myRequests = data,
                error: (err) => console.error('Error loading history:', err)
            });
        }
    }

    submitRequest() {
        if (this.supportForm.invalid || !this.userId) return;

        this.isSubmitting = true;
        const { subject, message } = this.supportForm.value;

        this.supportService.submitRequest(this.userId, subject, message).subscribe({
            next: (res) => {
                this.successMessage = 'Your request has been submitted successfully!';
                this.supportForm.reset();
                this.supportForm.patchValue({ subject: '' }); // Reset select
                this.isSubmitting = false;
                this.loadMyRequests(); // Refresh list

                setTimeout(() => this.successMessage = '', 3000);
            },
            error: (err) => {
                console.error('Error submitting request:', err);
                this.isSubmitting = false;
            }
        });
    }
}
