import { Component, inject, signal } from '@angular/core';
import { MediaService } from '../../core/services/media-service';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { FolderService } from '../../core/services/folder-service';
import { Folder } from '../../shared/models/folder';
import { Media } from '../../shared/models/media';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowDownTray } from '@ng-icons/heroicons/outline';

@Component({
  imports: [DecimalPipe, DatePipe, NgIcon],
  providers: [
    provideIcons({
      heroArrowDownTray
    })
  ],
  selector: 'app-dashboard-component',
  templateUrl: './dashboard-component.html',
})
export class DashboardComponent {

  private mediaService = inject(MediaService);
  private folderService = inject(FolderService);

  // Folders
  folders = signal<Folder[]>([]);
  loadingFolders = signal(false);
  folderError = signal<string | null>(null);

  selectedFolderId = signal<string>('');

  creatingFolder = signal(false);

  newFolderName = signal('');

  createFolderError = signal<string | null>(null);
  createFolderSuccess = signal(false);

  showCreateFolder = signal(false);

  // Files
  media = signal<Media[]>([]);
  loadingMedia = signal(false);
  mediaError = signal<string | null>(null);

  currentPage = signal(0);
  pageSize = signal(20);
  totalPages = signal(0);
  totalElements = signal(0);

  // Upload
  selectedFile = signal<File | null>(null);

  uploading = signal(false);
  uploadProgress = signal(0);
  uploadSuccess = signal(false);
  uploadError = signal<string | null>(null);

  // download
  downloadingFileId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadFolders();
    this.loadMedia();
  }

  // Folder
  loadFolders(): void {
    this.loadingFolders.set(true);
    this.folderError.set(null);

    this.folderService.getAllFolders().subscribe({
      next: (folders) => {
        this.folders.set(folders);
        this.loadingFolders.set(false);
      },
      error: (error) => {
        console.error(
          'Failed to load folders:',
          error
        );
        this.loadingFolders.set(false);
        this.folderError.set(
          'Unable to load your folders.'
        );
      }
    });
  }

  createFolder(): void {

    const name = this.newFolderName().trim();

    if (!name) {
      this.createFolderError.set(
        'Please enter a folder name.'
      );
      return;
    }

    this.creatingFolder.set(true);
    this.createFolderError.set(null);
    this.createFolderSuccess.set(false);

    this.folderService
      .createFolder(name, null)
      .subscribe({
        next: (folder) => {
          this.creatingFolder.set(false);
          this.createFolderSuccess.set(true);
          this.newFolderName.set('');

          // Add the new folder to the list
          this.folders.update(
            folders => [...folders, folder]
          );

          // Automatically select the new folder
          this.selectedFolderId.set(folder.id);
        },

        error: (error) => {
          console.error(
            'Failed to create folder:',
            error
          );

          this.creatingFolder.set(false);

          this.createFolderError.set(
            error?.error?.message ??
            'Unable to create folder.'
          );
        }
      });
  }

  onFolderChange(event: Event): void {
    const select = event.target as HTMLSelectElement;

    this.selectedFolderId.set(select.value);
    this.currentPage.set(0);
    this.loadMedia();
  }

  // Media
  loadMedia(): void {
    this.loadingMedia.set(true);
    this.mediaError.set(null);

    const folderId = this.selectedFolderId();

    this.mediaService
      .getMedia(
        this.currentPage(),
        this.pageSize(),
        folderId || undefined
      )
      .subscribe({
        next: (response) => {
          this.media.set(response.content);
          this.totalPages.set(
            response.totalPages
          );
          this.totalElements.set(
            response.totalElements
          );
          this.loadingMedia.set(false);
        },
        error: (error) => {

          console.error(
            'Failed to load media:',
            error
          );

          this.loadingMedia.set(false);

          this.mediaError.set(
            'Unable to load your files.'
          );
        }
      });
  }

  downloadFile(file: Media): void {
    if (this.downloadingFileId()) {
      return;
    }

    this.downloadingFileId.set(file.id);

    this.mediaService
      .download(file.id)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);

          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = file.filename;
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
          window.URL.revokeObjectURL(url);
          this.downloadingFileId.set(null);
        },

        error: (error) => {
          console.error(
            'Download failed:',
            error
          );
          this.downloadingFileId.set(null);
          this.mediaError.set(
            `Unable to download "${file.filename}".`
          );
        }
      });
  }

  // Pagination
  previousPage(): void {
    if (this.currentPage() === 0) {
      return;
    }
    this.currentPage.update(
      page => page - 1
    );
    this.loadMedia();
  }

  nextPage(): void {

    if (
      this.currentPage() >=
      this.totalPages() - 1
    ) {
      return;
    }

    this.currentPage.update(
      page => page + 1
    );

    this.loadMedia();
  }

  // Upload
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    this.selectedFile.set(input.files[0]);
    this.uploadSuccess.set(false);
    this.uploadError.set(null);
  }

  uploadFile(): void {
    const file = this.selectedFile();
    const folderId = this.selectedFolderId() || null;

    if (!file) {
      this.uploadError.set(
        'Please select a file.'
      );
      return;
    }

    this.uploading.set(true);
    this.uploadProgress.set(0);

    this.uploadSuccess.set(false);
    this.uploadError.set(null);

    this.mediaService
      .upload(file, folderId)
      .subscribe({

        next: (event) => {

          if (
            event.type ===
            HttpEventType.UploadProgress
          ) {

            if (event.total) {

              const progress =
                Math.round(
                  event.loaded /
                  event.total *
                  100
                );
              this.uploadProgress.set(
                progress
              );
            }
          }

          else if (
            event.type ===
            HttpEventType.Response
          ) {
            this.uploading.set(false);
            this.uploadProgress.set(100);
            this.uploadSuccess.set(true);

            // Clear selected file
            this.selectedFile.set(null);

            // Refresh file list
            this.loadMedia();
          }
        },

        error: (error) => {
          console.error(
            'Upload failed:',
            error
          );

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