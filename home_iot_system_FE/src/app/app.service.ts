import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private apiUrl = 'http://localhost:8080'; // Đảm bảo URL chính xác

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
  sendCommandToBackend(device: string, state: boolean): Observable<any> {
    const url = `${this.apiUrl}/api/publish`;
    const topic = "device/action";
    const message = `${device},${state ? 'On' : 'Off'}`;
    const payload = { topic, message };
    console.log("payload: ",payload);
    return this.http.post<any>(url, payload);
}

  
  
  
}
