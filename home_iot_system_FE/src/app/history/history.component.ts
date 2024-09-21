import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { AppService } from '../app.service';

import { DatePipe } from '@angular/common';
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

  
  sortOrder: 'asc' | 'desc' = 'asc'; // Biến lưu thứ tự sắp xếp

  constructor(private appService: AppService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() : void{
    this.appService.getAllDeviceAction().subscribe({
      next: (data) => {
        
        this.DeviceAction = data;
        this.filteredData = this.DeviceAction;

        console.log('Received device action:', data);
      },
      error: (error) => {
        console.error('Error fetching device action:', error);
      }
    });
    
  }

  search() {
    const searchTerm = this.searchTerm.trim().toLowerCase();
    if (searchTerm) {
      this.filteredData = this.DeviceAction.filter(item => {
          const itemDate = item.time; // Tách ngày từ thời gian
          return itemDate.includes(searchTerm); // So sánh với ngày
      });
    } else {
      this.filteredData = this.DeviceAction;
    }
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
