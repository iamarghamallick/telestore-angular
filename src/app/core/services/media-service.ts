import { HttpClient, HttpEvent, HttpParams } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { Media } from "../../shared/models/media";
import { MediaPage } from "../../shared/models/media-page";

@Service()
export class MediaService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiBaseUrl;

    upload(file: File, folderId: string | null): Observable<HttpEvent<Media>> {
        const formData = new FormData();

        formData.append("file", file);
        if (folderId !== null) {
            formData.append('folderId', folderId);
        }

        return this.http.post<Media>(
            `${this.baseUrl}/api/media/upload`,
            formData,
            {
                reportUploadProgress: true,
                observe: "events"
            }
        );
    }

    getMedia(
        page: number = 0,
        size: number = 20,
        folderId?: string
    ): Observable<MediaPage> {

        let params = new HttpParams()
            .set('page', page)
            .set('size', size)
            .set('sortBy', 'createdAt')
            .set('sortDir', 'desc');

        if (folderId) {
            params = params.set('folderId', folderId);
        }

        return this.http.get<MediaPage>(
            `${this.baseUrl}/api/media`,
            { params }
        );
    }

    download(id: string): Observable<Blob> {

        return this.http.get(
            `${this.baseUrl}/api/media/${id}/download`,
            {
                responseType: 'blob'
            }
        );
    }
}