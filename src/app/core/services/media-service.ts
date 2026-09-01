import { HttpClient, HttpEvent } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { Media } from "../../shared/models/media";

@Service()
export class MediaService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiBaseUrl;

    upload(file: File, folderId: string): Observable<HttpEvent<Media>> {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("folderId", folderId);

        return this.http.post<Media>(
            `${this.baseUrl}/api/media/upload`,
            formData,
            {
                reportUploadProgress: true,
                observe: "events"
            }
        );
    }
}