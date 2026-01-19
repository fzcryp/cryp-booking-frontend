import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Component({
    selector: 'app-contact-us',
    templateUrl: './contact-us.component.html',
    styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent {
    formData = {
        full_name: '',
        mobile_number: '',
        subject: ''
    };

    apiUrl = `${environment.apiUrl}/contact`; // Using IP as requested for mobile testing

    constructor(private http: HttpClient) { }

    submitForm() {
        if (!this.formData.full_name || !this.formData.mobile_number || !this.formData.subject) {
            alert('Please fill in all fields.');
            return;
        }

        // Validate mobile number (simple check)
        if (!/^\d{10,}$/.test(this.formData.mobile_number)) {
            alert('Please enter a valid mobile number (at least 10 digits).');
            return;
        }

        this.http.post(this.apiUrl, this.formData).subscribe({
            next: (response: any) => {
                alert('✅ ' + response.message);
                this.formData = { full_name: '', mobile_number: '', subject: '' }; // Reset form
            },
            error: (error) => {
                console.error('Submission failed', error);
                alert('❌ Failed to submit request. Please try again.');
            }
        });
    }
}
