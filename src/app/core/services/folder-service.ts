import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { Folder } from "../../shared/models/folder";

@Service()
export class FolderService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiBaseUrl;

    getAllFolders(): Observable<Folder[]> {
        return this.http.get<Folder[]>(
            `${this.baseUrl}/api/folder`
        );
    }

    getFolder(id: string): Observable<Folder> {
        return this.http.get<Folder>(
            `${this.baseUrl}/api/folder/${id}`
        );
    }

    getChildFolders(parentFolderId: string): Observable<Folder[]> {
        return this.http.get<Folder[]>(
            `${this.baseUrl}/api/folder/children/${parentFolderId}`
        );
    }

    createFolder(
        name: string,
        parentFolderId: string | null = null
    ): Observable<Folder> {

        return this.http.post<Folder>(
            `${this.baseUrl}/api/folder`,
            {
                name,
                parentFolderId
            }
        );
    }

    updateFolder(
        id: string,
        name: string
    ): Observable<Folder> {

        return this.http.put<Folder>(
            `${this.baseUrl}/api/folder/${id}`,
            { name }
        );
    }

    deleteFolder(id: string): Observable<void> {

        return this.http.delete<void>(
            `${this.baseUrl}/api/folder/${id}`
        );
    }
}