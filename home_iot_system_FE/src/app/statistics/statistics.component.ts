import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { NgxPaginationModule } from 'ngx-pagination';
import { AppService } from '../app.service';
import { DatePipe } from '@angular/common';
import { IMqttMessage, MqttService } from 'ngx-mqtt';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule], // Add FormsModule here
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
  providers: [DatePipe],
})
export class StatisticsComponent implements OnInit {
  // constructor(private readonly appService: AppService) { }

  searchBy: 'date' | 'temperature' | 'humidity' | 'smoke' | 'light' | 'all' =
    'date';

  // Biến lưu trữ trang hiện tại
  currentPage = 1;

  // Biến lưu trữ từ khóa tìm kiếm
  searchTerm: any;

  // Biến lưu trữ kết quả sau khi tìm kiếm
  filteredData: any[] = [];

  // Biến lưu trữ số lượng hàng hiển thị trên mỗi trang
  itemsPerPage = 10; // Giá trị mặc định là 10

  environmentalData: any[] = [];

  sortOrder: 'asc' | 'desc' = 'desc'; // Biến lưu thứ tự sắp xếp

  private subscription: Subscription | undefined;

  constructor(
    private appService: AppService,
    private mqttService: MqttService
  ) {}

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
      .observe('environmental/data')
      .subscribe((message: IMqttMessage) => {
        const payload = message.payload.toString();
        console.log('Tin nhắn nhận được:', payload); // In ra thông điệp nhận được
        const [temp, hum, light, smoke] = payload.split(',').map(Number);
        this.loadData();
      });
  }
  loadData(): void {
    this.appService.getAllEnvironmentalData().subscribe({
      next: (data) => {
        this.environmentalData = data;
        this.filteredData = this.environmentalData.reverse();

        //  console.log('Received environmental data:', data);
      },
      error: (error) => {
        console.error('Error fetching environmental data:', error);
      },
    });
  }

  // Hàm tìm kiếm chỉ theo thời gian
  search() {
    const searchTerm: string = this.searchTerm
      ? this.searchTerm.toLowerCase()
      : ''; // Convert search term to lowercase

    if (searchTerm) {
      this.filteredData = this.environmentalData.filter((item) => {
        const itemDate = item.time.toLowerCase();
        const tempMatch = item.temperature.toString().includes(searchTerm);
        const humidityMatch = item.humidity.toString().includes(searchTerm);
        const lightMatch = item.light.toString().includes(searchTerm);
        const smokeMatch = item.smoke.toString().includes(searchTerm);
        const dateMatch = itemDate.includes(searchTerm);

        if (this.searchBy === 'all') {
          // Search across all fields
          return dateMatch || tempMatch || humidityMatch || lightMatch;
        } else if (this.searchBy === 'date') {
          return dateMatch;
        } else if (this.searchBy === 'temperature') {
          return tempMatch;
        } else if (this.searchBy === 'humidity') {
          return humidityMatch;
        } else if (this.searchBy === 'light') {
          return lightMatch;
        } else if (this.searchBy === 'smoke') {
          return smokeMatch;
        }
        return false; // Default case
      });
    } else {
      this.filteredData = this.environmentalData; // Show all data if no search term
    }
  }

  // Hàm cập nhật số lượng hàng hiển thị
  updateRows() {
    this.currentPage = 1; // Reset lại trang về trang đầu tiên khi thay đổi số hàng hiển thị
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
