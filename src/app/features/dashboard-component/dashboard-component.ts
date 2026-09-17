import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowDownTray,
  heroArrowUpTray,
  heroFolder,
  heroFolderPlus,
  heroEllipsisVertical,
  heroPencilSquare,
  heroTrash,
  heroMagnifyingGlass,
  heroChevronRight,
  heroXMark,
  heroArrowPath,
  heroDocument,
  heroPhoto,
  heroFilm,
  heroMusicalNote,
  heroHome,
  heroArrowsRightLeft,
  heroPlus,
} from '@ng-icons/heroicons/outline';

import { FolderService } from '../../core/services/folder-service';
import { MediaService } from '../../core/services/media-service';
import { Folder } from '../../shared/models/folder';
import { Media, MediaSortField, MediaType, SortDirection } from '../../shared/models/media';

/** A single entry rendered in the rename/delete modals — either a folder or a file. */
type DashboardItem =
  | { kind: 'folder'; data: Folder }
  | { kind: 'media'; data: Media };

@Component({
  selector: 'app-dashboard-component',
  imports: [DecimalPipe, DatePipe, NgIcon],
  providers: [
    provideIcons({
      heroArrowDownTray,
      heroArrowUpTray,
      heroFolder,
      heroFolderPlus,
      heroEllipsisVertical,
      heroPencilSquare,
      heroTrash,
      heroMagnifyingGlass,
      heroChevronRight,
      heroXMark,
      heroArrowPath,
      heroDocument,
      heroPhoto,
      heroFilm,
      heroMusicalNote,
      heroHome,
      heroArrowsRightLeft,
      heroPlus,
    }),
  ],
  templateUrl: './dashboard-component.html',
})
export class DashboardComponent {
  private folderService = inject(FolderService);
  private mediaService = inject(MediaService);

  readonly MediaType = MediaType;
  readonly mediaTypeOptions = Object.values(MediaType);
  readonly sortOptions: { value: MediaSortField; label: string }[] = [
    { value: 'createdAt', label: 'Date' },
    { value: 'filename', label: 'Name' },
    { value: 'size', label: 'Size' },
  ];

  // ----- Navigation -----
  /** Path from root to the currently open folder. Empty array = at root. */
  trail = signal<Folder[]>([]);
  currentFolder = computed<Folder | null>(() => {
    const t = this.trail();
    return t.length ? t[t.length - 1] : null;
  });

  // ----- Folder + file listing for the current directory -----
  folders = signal<Folder[]>([]);
  loadingFolders = signal(false);
  folderError = signal<string | null>(null);

  media = signal<Media[]>([]);
  loadingMedia = signal(false);
  mediaError = signal<string | null>(null);

  // ----- Search / filter / sort (search + type filter apply to files only) -----
  searchQuery = signal('');
  typeFilter = signal<MediaType | ''>('');
  sortBy = signal<MediaSortField>('createdAt');
  sortDir = signal<SortDirection>('desc');
  hasActiveFilters = computed(() => !!this.searchQuery() || !!this.typeFilter());

  // ----- Pagination (files only — folders aren't paginated by the backend) -----
  currentPage = signal(0);
  pageSize = signal(20);
  totalPages = signal(0);
  totalElements = signal(0);

  // ----- Flat list of every folder, used by the "move to" picker -----
  allFolders = signal<Folder[]>([]);

  // ----- "New" menu -----
  showNewMenu = signal(false);

  // ----- Create folder modal -----
  showCreateFolder = signal(false);
  newFolderName = signal('');
  creatingFolder = signal(false);
  createFolderError = signal<string | null>(null);

  // ----- Upload modal -----
  showUpload = signal(false);
  selectedFile = signal<File | null>(null);
  uploading = signal(false);
  uploadProgress = signal(0);
  uploadError = signal<string | null>(null);

  // ----- Per-item "..." menu -----
  openMenuId = signal<string | null>(null);

  // ----- Rename modal (folder or file) -----
  renameTarget = signal<DashboardItem | null>(null);
  renameValue = signal('');
  renaming = signal(false);
  renameError = signal<string | null>(null);

  // ----- Move modal (files only) -----
  moveTarget = signal<Media | null>(null);
  moveDestination = signal<string | null>(null); // null = root
  moving = signal(false);
  moveError = signal<string | null>(null);

  // ----- Move Folder -----
  moveFolderTarget = signal<Folder | null>(null);
  moveFolderDestination = signal<string | null>(null);

  // ----- Delete confirmation modal -----
  deleteTarget = signal<DashboardItem | null>(null);
  deleting = signal(false);
  deleteError = signal<string | null>(null);

  // ----- Download -----
  downloadingFileId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadAllFolders();
    this.loadCurrentFolder();
  }

  // ===================== Loading =====================

  private loadAllFolders(): void {
    this.folderService.getAllFolders().subscribe({
      next: (folders) => this.allFolders.set(folders),
      error: () => {
        // Only backs the "move to" picker — fails silently, picker just
        // shows "Root" if this doesn't come back.
      },
    });
  }

  loadCurrentFolder(): void {
    this.loadFolders();
    this.loadMedia();
  }

  private loadFolders(): void {
    this.loadingFolders.set(true);
    this.folderError.set(null);

    const folder = this.currentFolder();
    const request$ = folder
      ? this.folderService.getChildFolders(folder.id)
      : this.folderService.getAllFolders();

    request$.subscribe({
      next: (folders: any) => {
        // Root has no dedicated "children" endpoint, so getAllFolders() is
        // filtered down to top-level folders client-side.
        this.folders.set(folder ? folders : folders.filter((f: any) => !f.parentFolderId));
        this.loadingFolders.set(false);
      },
      error: (error: any) => {
        console.error('Failed to load folders:', error);
        this.loadingFolders.set(false);
        this.folderError.set('Unable to load folders.');
      },
    });
  }

  loadMedia(): void {
    this.loadingMedia.set(true);
    this.mediaError.set(null);

    const folder = this.currentFolder();

    this.mediaService
      .search({
        q: this.searchQuery() || undefined,
        type: this.typeFilter() || undefined,
        // NOTE: /api/media only supports filtering BY a given folderId —
        // there's no way to ask for "files with no folder". So at root
        // this lists every file across all folders rather than just
        // root-level ones. A real fix needs a backend change (e.g. a
        // reserved folderId value meaning "root only").
        folderId: folder ? folder.id : null,
        page: this.currentPage(),
        size: this.pageSize(),
        sortBy: this.sortBy(),
        sortDir: this.sortDir(),
      })
      .subscribe({
        next: (response) => {
          this.media.set(response.content);
          this.totalPages.set(response.totalPages);
          this.totalElements.set(response.totalElements);
          this.loadingMedia.set(false);
        },
        error: (error) => {
          console.error('Failed to load files:', error);
          this.loadingMedia.set(false);
          this.mediaError.set('Unable to load files.');
        },
      });
  }

  // ===================== Navigation =====================

  openFolder(folder: Folder): void {
    this.trail.update((t) => [...t, folder]);
    this.resetAndReload();
  }

  goToRoot(): void {
    this.trail.set([]);
    this.resetAndReload();
  }

  goToBreadcrumb(index: number): void {
    this.trail.update((t) => t.slice(0, index + 1));
    this.resetAndReload();
  }

  private resetAndReload(): void {
    this.currentPage.set(0);
    this.closeAllMenus();
    this.loadCurrentFolder();
  }

  // ===================== Search / filter / sort =====================

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(0);
    this.loadMedia();
  }

  onTypeFilterChange(value: string): void {
    this.typeFilter.set(value as MediaType | '');
    this.currentPage.set(0);
    this.loadMedia();
  }

  onSortByChange(value: string): void {
    this.sortBy.set(value as MediaSortField);
    this.loadMedia();
  }

  toggleSortDir(): void {
    this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    this.loadMedia();
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.typeFilter.set('');
    this.currentPage.set(0);
    this.loadMedia();
  }

  // ===================== Pagination =====================

  previousPage(): void {
    if (this.currentPage() === 0) return;
    this.currentPage.update((p) => p - 1);
    this.loadMedia();
  }

  nextPage(): void {
    if (this.currentPage() >= this.totalPages() - 1) return;
    this.currentPage.update((p) => p + 1);
    this.loadMedia();
  }

  // ===================== "New" menu =====================

  toggleNewMenu(): void {
    this.showNewMenu.update((v) => !v);
  }

  openCreateFolderFromMenu(): void {
    this.showNewMenu.set(false);
    this.openCreateFolder();
  }

  openUploadFromMenu(): void {
    this.showNewMenu.set(false);
    this.openUpload();
  }

  // ===================== Create folder =====================

  openCreateFolder(): void {
    this.newFolderName.set('');
    this.createFolderError.set(null);
    this.showCreateFolder.set(true);
  }

  closeCreateFolder(): void {
    if (this.creatingFolder()) return;
    this.showCreateFolder.set(false);
  }

  submitCreateFolder(): void {
    const name = this.newFolderName().trim();
    if (!name) {
      this.createFolderError.set('Please enter a folder name.');
      return;
    }

    this.creatingFolder.set(true);
    this.createFolderError.set(null);

    const parentFolderId = this.currentFolder()?.id ?? null;

    this.folderService.createFolder(name, parentFolderId).subscribe({
      next: (folder) => {
        this.creatingFolder.set(false);
        this.showCreateFolder.set(false);
        this.folders.update((list) => [...list, folder]);
        this.allFolders.update((list) => [...list, folder]);
      },
      error: (error) => {
        console.error('Failed to create folder:', error);
        this.creatingFolder.set(false);
        this.createFolderError.set(error?.error?.message ?? 'Unable to create folder.');
      },
    });
  }

  // ===================== Upload =====================

  openUpload(): void {
    this.selectedFile.set(null);
    this.uploadProgress.set(0);
    this.uploadError.set(null);
    this.showUpload.set(true);
  }

  closeUpload(): void {
    if (this.uploading()) return;
    this.showUpload.set(false);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedFile.set(input.files[0]);
    this.uploadError.set(null);
  }

  removeSelectedFile(): void {
    if (this.uploading()) return;
    this.selectedFile.set(null);
    this.uploadProgress.set(0);
    this.uploadError.set(null);
  }

  submitUpload(): void {
    const file = this.selectedFile();
    if (!file) {
      this.uploadError.set('Please choose a file.');
      return;
    }

    this.uploading.set(true);
    this.uploadProgress.set(0);
    this.uploadError.set(null);

    const folderId = this.currentFolder()?.id ?? null;

    this.mediaService.upload(file, folderId).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress.set(Math.round((event.loaded / event.total) * 100));
        } else if (event.type === HttpEventType.Response) {
          this.uploading.set(false);
          this.uploadProgress.set(100);
          this.showUpload.set(false);
          this.selectedFile.set(null);
          this.loadMedia();
        }
      },
      error: (error) => {
        console.error('Upload failed:', error);
        this.uploading.set(false);
        this.uploadProgress.set(0);
        this.uploadError.set(error?.error?.message ?? 'Unable to upload the file.');
      },
    });
  }

  // ===================== Per-item menu =====================

  toggleItemMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.openMenuId.update((current) => (current === id ? null : id));
  }

  closeAllMenus(): void {
    this.openMenuId.set(null);
    this.showNewMenu.set(false);
  }

  // ===================== Download =====================

  downloadFile(file: Media): void {
    if (this.downloadingFileId()) return;
    this.downloadingFileId.set(file.id);

    this.mediaService.download(file.id).subscribe({
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
        console.error('Download failed:', error);
        this.downloadingFileId.set(null);
        this.mediaError.set(`Unable to download "${file.filename}".`);
      },
    });
  }

  // ===================== Rename (folder or file) =====================

  openRenameFolder(folder: Folder): void {
    this.closeAllMenus();
    this.renameTarget.set({ kind: 'folder', data: folder });
    this.renameValue.set(folder.name);
    this.renameError.set(null);
  }

  openRenameMedia(file: Media): void {
    this.closeAllMenus();
    this.renameTarget.set({ kind: 'media', data: file });
    this.renameValue.set(file.filename);
    this.renameError.set(null);
  }

  closeRename(): void {
    if (this.renaming()) return;
    this.renameTarget.set(null);
  }

  submitRename(): void {
    const target = this.renameTarget();
    const value = this.renameValue().trim();
    if (!target || !value) {
      this.renameError.set('Please enter a name.');
      return;
    }

    this.renaming.set(true);
    this.renameError.set(null);

    if (target.kind === 'folder') {
      this.folderService.updateFolder(target.data.id, value).subscribe({
        next: (updated) => {
          this.renaming.set(false);
          this.renameTarget.set(null);
          this.folders.update((list) => list.map((f) => (f.id === updated.id ? updated : f)));
          this.allFolders.update((list) => list.map((f) => (f.id === updated.id ? updated : f)));
        },
        error: (error) => {
          this.renaming.set(false);
          this.renameError.set(error?.error?.message ?? 'Unable to rename folder.');
        },
      });
    } else {
      this.mediaService.update(target.data.id, { filename: value }).subscribe({
        next: (updated) => {
          this.renaming.set(false);
          this.renameTarget.set(null);
          this.media.update((list) => list.map((m) => (m.id === updated.id ? updated : m)));
        },
        error: (error) => {
          this.renaming.set(false);
          this.renameError.set(error?.error?.message ?? 'Unable to rename file.');
        },
      });
    }
  }

  // ===================== Move (files only) =====================

  openMove(file: Media): void {
    this.closeAllMenus();
    this.moveTarget.set(file);
    this.moveDestination.set(file.folderId ?? null);
    this.moveError.set(null);
  }

  closeMove(): void {
    if (this.moving()) return;
    this.moveTarget.set(null);
  }

  setMoveDestination(id: string | null): void {
    this.moveDestination.set(id);
  }

  submitMove(): void {
    const target = this.moveTarget();
    if (!target) return;

    this.moving.set(true);
    this.moveError.set(null);

    this.mediaService.update(target.id, { folderId: this.moveDestination() }).subscribe({
      next: () => {
        this.moving.set(false);
        this.moveTarget.set(null);
        // The file may have moved out of the folder that's currently open.
        this.loadMedia();
      },
      error: (error) => {
        this.moving.set(false);
        this.moveError.set(error?.error?.message ?? 'Unable to move file.');
      },
    });
  }

  // ===================== Mode Folder =====================
  openMoveFolder(folder: Folder): void {
    this.closeAllMenus();

    this.moveFolderTarget.set(folder);
    this.moveFolderDestination.set(folder.parentFolderId ?? null);
    this.moveError.set(null);
  }

  setMoveFolderDestination(id: string | null): void {
    this.moveFolderDestination.set(id);
  }

  closeMoveFolder(): void {
    if (this.moving()) return;

    this.moveFolderTarget.set(null);
  }

  submitMoveFolder(): void {
    const folder = this.moveFolderTarget();

    if (!folder) {
      return;
    }

    this.moving.set(true);
    this.moveError.set(null);

    this.folderService.updateFolder(
      folder.id,
      folder.name,
      this.moveFolderDestination()
    ).subscribe({
      next: (updated) => {
        this.moving.set(false);
        this.moveFolderTarget.set(null);

        this.loadFolders();
        this.loadAllFolders();
      },

      error: (error) => {
        console.error('Move folder failed:', error);

        this.moving.set(false);

        this.moveError.set(
          error?.error?.message ?? 'Unable to move folder.'
        );
      }
    });
  }

  // ===================== Delete (folder or file) =====================

  openDeleteFolder(folder: Folder): void {
    this.closeAllMenus();
    this.deleteTarget.set({ kind: 'folder', data: folder });
    this.deleteError.set(null);
  }

  openDeleteMedia(file: Media): void {
    this.closeAllMenus();
    this.deleteTarget.set({ kind: 'media', data: file });
    this.deleteError.set(null);
  }

  closeDelete(): void {
    if (this.deleting()) return;
    this.deleteTarget.set(null);
  }

  confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;

    this.deleting.set(true);
    this.deleteError.set(null);

    if (target.kind === 'folder') {
      this.folderService.deleteFolder(target.data.id).subscribe({
        next: () => {
          this.deleting.set(false);
          this.deleteTarget.set(null);
          this.folders.update((list) => list.filter((f) => f.id !== target.data.id));
          this.allFolders.update((list) => list.filter((f) => f.id !== target.data.id));
        },
        error: (error) => {
          this.deleting.set(false);
          this.deleteError.set(error?.error?.message ?? 'Unable to delete folder.');
        },
      });
    } else {
      this.mediaService.delete(target.data.id).subscribe({
        next: () => {
          this.deleting.set(false);
          this.deleteTarget.set(null);
          this.media.update((list) => list.filter((m) => m.id !== target.data.id));
          this.totalElements.update((n) => Math.max(0, n - 1));
        },
        error: (error) => {
          this.deleting.set(false);
          this.deleteError.set(error?.error?.message ?? 'Unable to delete file.');
        },
      });
    }
  }

  // ===================== Template helpers =====================

  iconFor(type: MediaType): string {
    switch (type) {
      case MediaType.IMAGE:
        return 'heroPhoto';
      case MediaType.VIDEO:
        return 'heroFilm';
      case MediaType.AUDIO:
        return 'heroMusicalNote';
      case MediaType.DOCUMENT:
        return 'heroDocument';
      default:
        return 'heroDocument';
    }
  }
}