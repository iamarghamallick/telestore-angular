import { Media } from "./media";

export interface MediaPage {
    content: Media[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
};