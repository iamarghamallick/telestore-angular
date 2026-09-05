import { Component, inject, signal } from '@angular/core';
import { UserService } from '../../core/services/user-service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowPath, heroExclamationTriangle } from '@ng-icons/heroicons/outline';
import { heroPencilSquareMini, heroCheckCircleMini } from '@ng-icons/heroicons/mini';

@Component({
	imports: [FormsModule, DatePipe, NgIcon],
	providers: [
		provideIcons({ heroArrowPath, heroPencilSquareMini, heroExclamationTriangle, heroCheckCircleMini }),
	],
	selector: 'app-profile-component',
	templateUrl: './profile-component.html',
})
export class ProfileComponent {
	private userService = inject(UserService);

	profile = this.userService.profile;

	// Initial load
	isLoadingProfile = signal(false);
	loadError = signal<string | null>(null);

	// Editing
	isEditing = false;
	editedName = '';
	isSaving = signal(false);
	saveError = signal<string | null>(null);
	saveSuccess = signal(false);

	private successTimeout?: ReturnType<typeof setTimeout>;

	ngOnInit(): void {
		this.loadProfile();
	}

	loadProfile(): void {
		if (this.profile()) return;

		this.isLoadingProfile.set(true);
		this.loadError.set(null);

		this.userService.fetchProfie().subscribe({
			next: () => this.isLoadingProfile.set(false),
			error: (err: HttpErrorResponse) => {
				this.isLoadingProfile.set(false);
				this.loadError.set(this.resolveLoadError(err));
			},
		});
	}

	startEditing(): void {
		this.editedName = this.profile()?.name ?? '';
		this.saveError.set(null);
		this.isEditing = true;
	}

	cancelEditing(): void {
		this.isEditing = false;
		this.editedName = '';
		this.saveError.set(null);
	}

	saveProfile(): void {
		const name = this.editedName.trim();
		if (!name || !this.profile()) return;

		// No-op save — just close the editor.
		if (name === this.profile()!.name) {
			this.isEditing = false;
			return;
		}

		this.isSaving.set(true);
		this.saveError.set(null);

		this.userService.updateProfile({ name }).subscribe({
			next: () => {
				this.isSaving.set(false);
				this.isEditing = false;
				this.flashSaveSuccess();
			},
			error: (err: HttpErrorResponse) => {
				this.isSaving.set(false);
				this.saveError.set(this.resolveSaveError(err));
			},
		});
	}

	private flashSaveSuccess(): void {
		this.saveSuccess.set(true);
		clearTimeout(this.successTimeout);
		this.successTimeout = setTimeout(() => this.saveSuccess.set(false), 3000);
	}

	private resolveLoadError(err: HttpErrorResponse): string {
		if (err.status === 0) return "Can't reach the server. Check your connection and try again.";
		if (err.status === 401) return 'Your session has expired. Please log in again.';
		return "We couldn't load your profile. Please try again.";
	}

	private resolveSaveError(err: HttpErrorResponse): string {
		if (err.status === 0) return "Can't reach the server. Check your connection and try again.";
		if (err.status === 409) return 'That name is already in use.';
		if (err.status === 400) return 'Please enter a valid name.';
		return "We couldn't save your changes. Please try again.";
	}
}