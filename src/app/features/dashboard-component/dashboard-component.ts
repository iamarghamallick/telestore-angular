import { Component, inject, signal } from '@angular/core';
import { MediaService } from '../../core/services/media-service';
import { DecimalPipe } from '@angular/common';
import { HttpEventType } from '@angular/common/http';

@Component({
  imports: [DecimalPipe],
  selector: 'app-dashboard-component',
  templateUrl: './dashboard-component.html',
})
export class DashboardComponent {
  private mediaService = inject(MediaService);

  selectedFile = signal<File | null>(null);
  selectedFolderId = signal<string | null>(null);

  uploading = signal(false);
  uploadProgress = signal(0);
  uploadSuccess = signal(false);
  uploadError = signal<string | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    this.selectedFile.set(file);
    this.uploadSuccess.set(false);
    this.uploadError.set(null);
  }

  uploadFile(): void {

    const file = this.selectedFile();
    const folderId = this.selectedFolderId();

    if (!file) {
      this.uploadError.set('Please select a file.');
      return;
    }

    if (!folderId) {
      this.uploadError.set('Please select a folder.');
      return;
    }

    this.uploading.set(true);
    this.uploadProgress.set(0);
    this.uploadSuccess.set(false);
    this.uploadError.set(null);

    this.mediaService.upload(file, folderId).subscribe({

      next: (event) => {

        if (event.type === HttpEventType.UploadProgress) {

          if (event.total) {
            const progress = Math.round(
              (event.loaded / event.total) * 100
            );

            this.uploadProgress.set(progress);
          }

        } else if (event.type === HttpEventType.Response) {

          this.uploading.set(false);
          this.uploadProgress.set(100);
          this.uploadSuccess.set(true);

          this.selectedFile.set(null);
          this.selectedFolderId.set(null);

          console.log('Uploaded media:', event.body);
        }
      },

      error: (error) => {

        console.error('Upload failed:', error);

        this.uploading.set(false);
        this.uploadProgress.set(0);

        this.uploadError.set(
          error?.error?.message ??
          'Unable to upload the file.'
        );
      }
    });
  }

  removeSelectedFile(): void {

    if (this.uploading()) {
      return;
    }

    this.selectedFile.set(null);
    this.uploadProgress.set(0);
    this.uploadSuccess.set(false);
    this.uploadError.set(null);
  }
}
