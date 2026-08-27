import { Component, inject, signal } from '@angular/core';
import { UserProfile } from '../../shared/models/user-profile';
import { UserService } from '../../core/services/user-service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowPath } from '@ng-icons/heroicons/outline';
import { heroPencilSquareMini } from '@ng-icons/heroicons/mini';

@Component({
	imports: [FormsModule, DatePipe, NgIcon],
	providers: [
		provideIcons({ heroArrowPath, heroPencilSquareMini })
	],
	selector: 'app-profile-component',
	templateUrl: './profile-component.html',
})
export class ProfileComponent {
	private userService = inject(UserService);

	profile = this.userService.profile;

	ngOnInit(): void {
		if (!this.profile()) {
			this.userService.fetchProfie().subscribe({
				error: (err) => console.error("Failed to load user profile", err),
			});
		}
	}

	isEditing = false;
	editedName = '';

	startEditing(): void {
		this.editedName = this.profile()?.name ?? '';
		this.isEditing = true;
	}

	cancelEditing(): void {
		this.isEditing = false;
		this.editedName = '';
	}

	saveProfile(): void {
		const name = this.editedName.trim();

		if (!name || !this.profile()) {
			return;
		}

		this.userService.updateProfile({ name }).subscribe({
			next: () => this.isEditing = false,
			error: (err) => console.error("Failed to update profile", err),
		});
	}
}
