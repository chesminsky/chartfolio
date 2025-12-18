import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GuessCategoryService {
  private apiUrl = environment.apiUrl;
  private baseUrl = 'guess';

  constructor(private http: HttpClient) {}

  guessCategories(assetName: string, assetCode: string, assetType: string): Observable<Record<string, string>> {
    return this.http.get<Record<string, string>>(
      `${this.apiUrl}/${this.baseUrl}/categories?assetName=${assetName}&assetCode=${assetCode}&assetType=${assetType}`
    );
  }
}
