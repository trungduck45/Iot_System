import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { NgxPaginationModule } from 'ngx-pagination';
import { AppService, EnvironmentalData } from '../app.service';
import { DatePipe } from '@angular/common';
import { IMqttMessage, MqttService } from 'ngx-mqtt';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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

  searchParams = {
    temperature: null,
    humidity: null,
    light: null,
    smoke: null,
    time: null,
  };
  constructor(
    private appService: AppService,
    private mqttService: MqttService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {

    this.loadData();
  }


  loadData(): void {
    this.appService.getAllEnvironmentalData().subscribe({
      next: (data) => {
        this.environmentalData = data;
        this.filteredData = this.environmentalData.reverse();

          console.log('Received environmental data:', this.filteredData);
      },
      error: (error) => {
        console.error('Error fetching environmental data:', error);
      },
    });
  }

  searchType: string = 'temperature';
  searchValue: string = '';
  results: any[] = [];
  search() {
    const url = `http://localhost:8080/api/environmental-data/search?type=${this.searchType}&value=${this.searchValue}`;
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
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';

    this.filteredData.sort((a, b) => {
      if (this.sortOrder === 'asc') {
        return a.id - b.id; // Sắp xếp tăng dần
      } else {
        return b.id - a.id; // Sắp xếp giảm dần
      }
    });
  }
}
