import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

    constructor(private router: Router) { }

    ngOnInit(): void {
    }

    navigateTo(path: string) {
        if (path === 'discount-requests') {
            this.router.navigate(['/admin/discount-requests']);
        } else if (path === 'users') {
            this.router.navigate(['/admin/users']);
        }
        else if (path === 'support') {
            this.router.navigate(['/admin/support']);
        }
        else if (path === 'subscribers') {
            this.router.navigate(['/admin/subscribers']);
        }
        else if (path === 'affiliate-partners') {
            this.router.navigate(['/admin/affiliate-partners']);
        }
        else if (path === 'contact-requests') {
            this.router.navigate(['/admin/contact-requests']);
        }
    }
}
