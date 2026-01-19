import { Component, OnInit } from '@angular/core';
import { AffiliateService } from '../../Services/affiliate.service';
import { CommonModule } from '@angular/common'; // If standalone or importing
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-admin-affiliate-partner',
    templateUrl: './admin-affiliate-partner.component.html',
    styleUrls: ['./admin-affiliate-partner.component.css']
})
export class AdminAffiliatePartnerComponent implements OnInit {

    partners: any[] = [];
    isModalOpen = false;
    isEditMode = false;

    currentPartner: any = {
        id: null,
        platform_name: '',
        logo_url: '',
        link_template: '',
        is_active: true
    };

    constructor(private affiliateService: AffiliateService) { }

    ngOnInit(): void {
        this.loadPartners();
    }

    loadPartners() {
        this.affiliateService.getPartners().subscribe(
            (data) => {
                this.partners = data;
            },
            (error) => {
                console.error('Error fetching partners', error);
            }
        );
    }

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.partners, event.previousIndex, event.currentIndex);

        // Extract new order of IDs
        const orderedIds = this.partners.map(p => p.id);

        // Send to backend
        this.affiliateService.reorderPartners(orderedIds).subscribe(
            () => console.log('Reorder saved'),
            (error) => console.error('Error saving reorder', error)
        );
    }

    openAddModal() {
        this.isEditMode = false;
        this.currentPartner = {
            id: null,
            platform_name: '',
            logo_url: '',
            link_template: '',
            is_active: true
        };
        this.isModalOpen = true;
    }

    openEditModal(partner: any) {
        this.isEditMode = true;
        this.currentPartner = { ...partner }; // Copy object
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    savePartner() {
        if (this.isEditMode) {
            this.affiliateService.updatePartner(this.currentPartner.id, this.currentPartner).subscribe(
                () => {
                    this.loadPartners();
                    this.closeModal();
                },
                (error) => console.error('Error updating partner', error)
            );
        } else {
            this.affiliateService.addPartner(this.currentPartner).subscribe(
                () => {
                    this.loadPartners();
                    this.closeModal();
                },
                (error) => console.error('Error adding partner', error)
            );
        }
    }

    deletePartner(id: number) {
        if (confirm('Are you sure you want to delete this partner?')) {
            this.affiliateService.deletePartner(id).subscribe(
                () => {
                    this.loadPartners();
                },
                (error) => console.error('Error deleting partner', error)
            );
        }
    }
}
