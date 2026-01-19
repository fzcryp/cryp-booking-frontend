import { Component, OnInit } from '@angular/core';
import { SubscriberService } from '../../Services/subscriber.service';

@Component({
    selector: 'app-subscribers-admin',
    templateUrl: './subscribers-admin.component.html',
    styleUrls: ['./subscribers-admin.component.css']
})
export class SubscribersAdminComponent implements OnInit {

    subscribers: any[] = [];
    loading: boolean = true;

    constructor(private subscriberService: SubscriberService) { }

    ngOnInit(): void {
        this.loadSubscribers();
    }

    loadSubscribers(): void {
        this.loading = true;
        this.subscriberService.getSubscribers().subscribe({
            next: (data) => {
                this.subscribers = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading subscribers', err);
                this.loading = false;
            }
        });
    }

    toggleStatus(sub: any): void {
        const newStatus = !sub.is_active;
        const action = newStatus ? 'Unblock' : 'Block/Unsubscribe';

        if (confirm(`Are you sure you want to ${action} this user?`)) {
            this.subscriberService.updateStatus(sub.id, newStatus).subscribe({
                next: () => {
                    alert('Status updated successfully');
                    this.loadSubscribers();
                },
                error: (err) => alert('Failed to update status')
            });
        }
    }

    deleteSubscriber(id: number): void {
        if (confirm('Are you sure you want to PERMANENTLY delete this subscriber?')) {
            this.subscriberService.deleteSubscriber(id).subscribe({
                next: () => {
                    alert('Subscriber deleted');
                    this.loadSubscribers();
                },
                error: (err) => alert('Failed to delete')
            });
        }
    }
}
