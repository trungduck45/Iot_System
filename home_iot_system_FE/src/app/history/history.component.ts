import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { AppService } from '../app.service';

import { DatePipe } from '@angular/common';
import { IMqttMessage, MqttService } from 'ngx-mqtt';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, FormsModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
  providers: [DatePipe]
})
export class HistoryComponent implements OnInit {

  currentPage = 1;
  searchTerm: string = '';
  filteredData: any[] = [];
  itemsPerPage = 10;

  searchBy = 'date' ; // Tiêu chí tìm kiếm mặc định là ngày
  DeviceAction: any[] = [];

  
  sortOrder: 'asc' | 'desc' = 'desc'; // Biến lưu thứ tự sắp xếp
private subscription: any;
  constructor(private appService: AppService,
    private mqttService: MqttService,
    private http: HttpClient,
  ) { }

  
  ngOnInit(): void {
    this.mqttService.connect(); // Kết nối lại nếu cần
    // Lắng nghe sự kiện khi kết nối thành công
    this.mqttService.onConnect.subscribe(() => {
      console.log('Kết nối MQTT thành công');
      // Đăng ký nhận dữ liệu từ topic
      this.subscribeToTopic();
    });

    // Lắng nghe sự kiện khi không kết nối được
    this.mqttService.onError.subscribe((error) => {
      console.error('Lỗi kết nối MQTT:', error);
    });
    this.loadData();
  }

  subscribeToTopic(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = this.mqttService
      .observe('device/action/callback')
      .subscribe((message: IMqttMessage) => {
        const payload = message.payload.toString();
        console.log('Tin nhắn nhận được:', payload); // In ra thông điệp nhận được
        const [device,action] = payload.split(',').map(Number);
        this.loadData();
      });
  }

  loadData() : void{
    this.appService.getAllDeviceAction().subscribe({
      next: (data) => {
        this.DeviceAction = data;
        this.filteredData = this.DeviceAction.reverse();
        console.log('Received device action:', data);
      },
      error: (error) => {
        console.error('Error fetching device action:', error);
      }
    });
    
  }

  searchType: string = 'date';
  searchValue: string = '';
  results: any[] = [];
  search() {
    const url = `http://localhost:8080/api/device-action/search?type=${this.searchType}&value=${this.searchValue}`;
    console.log('Kết quả tìm kiếm:', url);
    this.http.get<any[]>(url).subscribe(
      (response) => {
        this.results = response;
        this.filteredData = this.results.reverse();
      
      },
      (error) => {
        console.error('Lỗi khi tìm kiếm:', error);
      }
    );
  }
  

  updateRows() {
    this.currentPage = 1;
  }

  
  sortById() {
    // Đổi thứ tự sắp xếp
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';

    // Sắp xếp filteredData theo ID
    this.filteredData.sort((a, b) => {
      if (this.sortOrder === 'asc') {
        return a.id - b.id; // Sắp xếp tăng dần
      } else {
        return b.id - a.id; // Sắp xếp giảm dần
      }
    });
  }
}
