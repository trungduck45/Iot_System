import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface EnvironmentalData {
  id: number;
  temperature: number;
  humidity: number;
  light: number;
  smoke: number;
  time: string;
}
@Injectable({
  providedIn: 'root'
})
export class AppService {
  private apiUrl = 'http://localhost:8080'; // Đảm bảo URL chính xác
  private apisearch = 'http://localhost:8080/api/environmental-data/search';
  constructor(private http: HttpClient) { }

  // Sử dụng Observable để lấy dữ liệu từ backend
  getAllEnvironmentalData(): Observable<any[]> {
    const url =`${this.apiUrl}/api/environmental-data`;
    return this.http.get<any[]>(url).pipe(
      catchError((error) => {
        console.error('Error fetching environmental data:', error);
        return throwError(() => error);
      })
    );
  }
  getAllDeviceAction(): Observable<any[]> {
    const url =`${this.apiUrl}/api/device-action`;
    return this.http.get<any[]>(url).pipe(
      catchError((error) => {
        console.error('Error fetching environmental data:', error);
        return throwError(() => error);
      })
    );
  }

  searchEnvironmentalData( params: any ): Observable<EnvironmentalData[]> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get<EnvironmentalData[]>(this.apisearch, { params: httpParams });
  }
//   sendCommandToBackend(device: string, state: boolean): Observable<any> {
//     const url = `${this.apiUrl}/api/publish`;
//     const topic = "device/action";
//     const message = `${device},${state ? 'On' : 'Off'}`;
//     const payload = { topic, message };
//     console.log("payload: ",payload);
//     return this.http.post<any>(url, payload);
// }
 
}