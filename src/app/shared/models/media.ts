import { TelegramMedia } from "./telegram-media"

export enum MediaType {
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
    AUDIO = 'AUDIO',
    DOCUMENT = 'DOCUMENT',
    OTHER = 'OTHER',
}

export type SortDirection = 'asc' | 'desc';

export type MediaSortField = 'createdAt' | 'filename' | 'size';

export interface Media {
    id: string,
    userId: string,
    folderId: string | null,
    filename: string,
    mediaType: MediaType,
    mimeType: string,
    size: number,
    extension: string
    telegramMedia: TelegramMedia,
    createdAt: string,
    updatedAt: string,
};