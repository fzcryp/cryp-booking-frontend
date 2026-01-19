import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../Services/user/user.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-user-list-admin',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './user-list-admin.component.html',
    styleUrls: ['./user-list-admin.component.css']
})
export class UserListAdminComponent implements OnInit {
    users: any[] = [];
    selectedUsers: Set<number> = new Set();

    // Modal State
    isEditModalOpen = false;
    editingUser: any = { id: 0, name: '', email: '', isAdmin: false };

    constructor(private userService: UserService) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers() {
        this.userService.getAllUsers().subscribe({
            next: (data) => this.users = data,
            error: (err) => console.error('Error loading users:', err)
        });
    }

    // Checkbox Logic
    toggleSelection(userId: number) {
        if (this.selectedUsers.has(userId)) {
            this.selectedUsers.delete(userId);
        } else {
            this.selectedUsers.add(userId);
        }
    }

    toggleAll(event: any) {
        if (event.target.checked) {
            this.users.forEach(u => this.selectedUsers.add(u.id));
        } else {
            this.selectedUsers.clear();
        }
    }

    isSelected(userId: number): boolean {
        return this.selectedUsers.has(userId);
    }

    isAllSelected(): boolean {
        return this.users.length > 0 && this.selectedUsers.size === this.users.length;
    }

    // Actions
    deleteUser(userId: number) {
        if (confirm('Are you sure you want to delete this user?')) {
            this.userService.deleteUser(userId).subscribe(() => {
                this.users = this.users.filter(u => u.id !== userId);
                this.selectedUsers.delete(userId);
            });
        }
    }

    deleteSelected() {
        if (confirm(`Delete ${this.selectedUsers.size} users?`)) {
            const ids = Array.from(this.selectedUsers);
            this.userService.deleteUsersBulk(ids).subscribe(() => {
                this.users = this.users.filter(u => !this.selectedUsers.has(u.id));
                this.selectedUsers.clear();
            });
        }
    }

    // Edit Modal
    openEditModal(user: any) {
        this.editingUser = { ...user, isAdmin: !!user.isAdmin }; // Copy object
        this.isEditModalOpen = true;
    }

    closeEditModal() {
        this.isEditModalOpen = false;
    }

    saveUser() {
        this.userService.updateUser(this.editingUser.id, this.editingUser).subscribe({
            next: () => {
                alert('User updated successfully');
                this.loadUsers(); // Reload to refresh list
                this.closeEditModal();
            },
            error: (err) => alert('Failed to update user')
        });
    }
}
