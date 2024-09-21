import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, Color, ScaleType, LegendPosition } from '@swimlane/ngx-charts';
import { AppService } from '../app.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  temperature: any;
  humidity: any;
  light: any;

  constructor(
    private appService: AppService,
    private http: HttpClient
  ) {}

  legendPosition: LegendPosition = LegendPosition.Right;
  multi: any[] = [];
  lightChartData: any[] = [];

  colorScheme: Color = {
    name: 'cool',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#0000ff', '#C7B42C', '#AAAAAA'],
  };
  lightColorScheme: Color = {
    name: 'lightScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#FFD700'], // Yellow color for the light chart
  };

  fullStatisticsData: any[] = [];
  saveData: any[] = [];

  ngOnInit(): void {
    this.loadChartData();
  }
  
  LoadData(): void {
    this.appService.getAllEnvironmentalData().subscribe({
      next: (data) => {
        this.fullStatisticsData = data;
        this.updateCharts();
      },
      error: (error) => {
        console.error('Lỗi khi lấy dữ liệu môi trường:', error);
      },
    });
  }

  loadChartData(): void {
    this.appService.getAllEnvironmentalData().subscribe({
      next: (data) => {
        this.fullStatisticsData = data;
        this.updateCharts();
      },
      error: (error) => {
        console.error('Lỗi khi lấy dữ liệu môi trường:', error);
      },
    });
  }

  updateCharts(): void {
    this.fullStatisticsData = this.fullStatisticsData.reverse();
    this.temperature = this.fullStatisticsData[0].temperature;
    this.humidity = this.fullStatisticsData[0].humidity;
    this.light = this.fullStatisticsData[0].light;

    const statisticsData = this.fullStatisticsData.reverse();

    const formatDateTime = (time: string) => {
      const date = new Date(time);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const filteredData = statisticsData.filter((_, index) => index % 15 === 0);

    this.multi = [
      {
        name: 'Temperature',
        series: filteredData.map((data) => ({
          name: formatDateTime(data.time),
          value: data.temperature,
        })),
      },
      {
        name: 'Humidity',
        series: filteredData.map((data) => ({
          name: formatDateTime(data.time),
          value: data.humidity,
        })),
      },
    ];

    this.lightChartData = [
      {
        name: 'Light',
        series: filteredData.map((data) => ({
          name: formatDateTime(data.time),
          value: data.light,
        })),
      },
    ];
  }

  getTemperatureColor() {
    if (this.temperature < 15) {
      return 'Tmuc1';
    } else if (this.temperature >= 15 && this.temperature < 22) {
      return 'Tmuc2';
    } else if (this.temperature >= 22 && this.temperature < 27) {
      return 'Tmuc3';
    } else if (this.temperature >= 27 && this.temperature < 32) {
      return 'Tmuc4';
    } else if (this.temperature >= 32 && this.temperature < 35) {
      return 'Tmuc5';
    } else if (this.temperature >= 35 && this.temperature <= 42) {
      return 'Tmuc6';
    } else {
      return 'Tmuc7';
    }
  }

  getHumidityColor() {
    if (this.humidity < 15) {
      return 'Hmuc1';
    } else if (this.humidity >= 15 && this.humidity < 45) {
      return 'Hmuc2';
    } else if (this.humidity >= 45 && this.humidity < 70) {
      return 'Hmuc3';
    } else if (this.humidity >= 70 && this.humidity < 90) {
      return 'Hmuc4';
    } else {
      return 'Hmuc5';
    }
  }

  getLightColor() {
    if (this.light < 100) {
      return 'Lmuc6';
    } else if (this.light >= 100 && this.light < 200) {
      return 'Lmuc5';
    } else if (this.light >= 200 && this.light < 400) {
      return 'Lmuc4';
    } else if (this.light >= 400 && this.light < 600) {
      return 'Lmuc3';
    } else if (this.light >= 600 && this.light < 800) {
      return 'Lmuc2';
    } else {
      return 'Lmuc1';
    }
  }

  isFanOn: boolean = false;
  isLED1On: boolean = false;
  isLED2On: boolean = false;
 
  
  async toggleFan(state: boolean): Promise<void> {
    if (state === this.isFanOn) return; // Nếu trạng thái không thay đổi, không làm gì cả
    this.isFanOn = state; // Cập nhật trạng thái trước khi gửi lệnh
    try {
      const response = await this.appService.sendCommandToBackend('Fan', state).toPromise();
      if (response && response.status === 200) {
        console.log('Fan toggled successfully:', response);
      } else {
        console.error('Error toggling fan:', response);
      }
    } catch (error) {
      console.error('Error toggling fan:', error);
    }
  }
  
  toggleLED1(state: boolean): void {
    if (state === this.isLED1On) return; // Nếu trạng thái không thay đổi, không làm gì cả
    this.isLED1On = state; // Cập nhật trạng thái sau khi gửi lệnh
    this.appService.sendCommandToBackend('Led-1', state).subscribe({
      next: (response) => {
        console.log('LED1 toggled successfully:', response);
      },
      error: (error) => console.error('Error toggling LED1:', error)
    });
  }
  
  toggleLED2(state: boolean): void {
    if (state === this.isLED2On) return; // Nếu trạng thái không thay đổi, không làm gì cả
    this.isLED2On = state; // Cập nhật trạng thái sau khi gửi lệnh
    this.appService.sendCommandToBackend('Led-2', state).subscribe({
      next: (response) => {
        console.log('LED2 toggled successfully:', response);
      },
      error: (error) => console.error('Error toggling LED2:', error)
    });
  }
  
  
  
}
