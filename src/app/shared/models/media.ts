import { TelegramMedia } from "./telegram-media"

export interface Media {
    id: string,
    userId: string,
    folderId: string | null,
    filename: string,
    mediaType: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'OTHER',
    mimeType: string,
    size: number,
    extension: string
    telegramMedia: TelegramMedia,
    createdAt: string,
    updatedAt: string,
};