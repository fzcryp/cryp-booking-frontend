import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DiscountService } from '../Services/discount/discount.service';
import { AuthService } from '../Services/auth/auth.service';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-discount',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './discount.component.html',
    styleUrls: ['./discount.component.css']
})
export class DiscountComponent implements OnInit {
    discountForm: FormGroup;
    requests: any[] = [];
    selectedFile: File | null = null;
    message: string = '';
    isSubmitting = false;
    previewUrl: string | null = null;
    backendUrl = environment.backendUrl; // Base URL for static files

    isImage(path: string): boolean {
        return path?.match(/\.(jpeg|jpg|gif|png)$/) != null;
    }

    getFileUrl(path: string): string {
        if (!path) return '';
        // Create correct URL from path (handling Windows backslashes if any)
        const normalizedPath = path.replace(/\\/g, '/');
        return `${this.backendUrl}${normalizedPath}`;
    }

    openPreview(path: string) {
        this.previewUrl = this.getFileUrl(path);
    }

    closePreview() {
        this.previewUrl = null;
    }

    constructor(
        private fb: FormBuilder,
        private discountService: DiscountService,
        private authService: AuthService
    ) {
        this.discountForm = this.fb.group({
            bookingId: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.loadHistory();
    }

    onFileSelected(event: any) {
        this.selectedFile = event.target.files[0];
    }

    submitRequest() {
        if (this.discountForm.invalid || !this.selectedFile) {
            this.message = 'Please provide a Booking ID and proof file.';
            return;
        }

        this.isSubmitting = true;
        const user = this.authService.getUser();
        const userId = user ? user.id : localStorage.getItem('userId');

        // Debug: If authService.getUser() doesn't return id, use localStorage 'userId'
        const finalUserId = userId;

        const formData = new FormData();
        formData.append('userId', finalUserId);
        formData.append('bookingId', this.discountForm.get('bookingId')?.value);
        formData.append('proof', this.selectedFile);

        this.discountService.submitRequest(formData).subscribe({
            next: (res) => {
                this.message = 'Request submitted successfully!';
                this.isSubmitting = false;
                this.discountForm.reset();
                this.selectedFile = null;
                this.loadHistory();
            },
            error: (err) => {
                console.error(err);
                this.message = 'Failed to submit request.';
                this.isSubmitting = false;
            }
        });
    }

    loadHistory() {
        // Use the same logic as submitRequest to ensure consistency
        const user = this.authService.getUser();
        const userId = user ? user.id : localStorage.getItem('userId');

        console.log('Loading history for User ID:', userId); // Debug log

        if (userId) {
            this.discountService.getHistory(Number(userId)).subscribe({
                next: (data) => {
                    console.log('Request History Data:', data); // Debug log
                    this.requests = data;
                },
                error: (err) => console.error('Error loading history:', err)
            });
        } else {
            console.error('No User ID found for loading history');
        }
    }
}
