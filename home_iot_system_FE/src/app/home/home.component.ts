import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgxChartsModule,
  Color,
  ScaleType,
  LegendPosition,
} from '@swimlane/ngx-charts';
import { AppService } from '../app.service';
import { Subscription } from 'rxjs';
import { MqttService, IMqttMessage } from 'ngx-mqtt';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  temperature: any;
  humidity: any;
  light: any;
  smoke: any;

  progressBarWidth: number = 100;

  showAlert: boolean = false;
  private subscription: Subscription | undefined;

  isFanOn: boolean = false;
  isLED1On: boolean = false;
  isLED2On: boolean = false;

  isAlertVisible: boolean = false;
  isAlertSomke: boolean = false;
  alertMessage: string = '';
  alertMessageSmoke: string = '';
  pendingCommands = new Set<string>();

   // Biến để đếm số lần bật quạt và số lần khói >= 80
   fanOnCount: number = 0;
   smokeHighCount: number = 0;
  valuesHistory: {
    temperature: number;
    humidity: number;
    light: number;
    smoke: number;
    time: string;
  }[] = [];

  smokeData: any[] = [];
  constructor(
    private appService: AppService,
    private mqttService: MqttService
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
    domain: ['#FFD700'],
  };

  fullStatisticsData: any[] = [];
  saveData: any[] = [];

  ngOnInit(): void {
    this.restoreDeviceStates();

    this.mqttService.connect();

    this.mqttService.onConnect.subscribe(() => {
      console.log('Kết nối MQTT thành công');
      this.subscribeToTopic();
    });

    this.mqttService.onError.subscribe((error) => {
      console.error('Lỗi kết nối MQTT:', error);
    });

    this.mqttService
      .observe('device/action/callback')
      .subscribe((message: any) => {
        const payload = message.payload.toString();
        this.handleMQTTMessage(payload);
        console.log('Received device/action/callback + message:', payload);
      });
    this.loadInitialData();
  //  this.loadChartData();
  }

  subscribeToTopic(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = this.mqttService
      .observe('environmental/data')
      .subscribe((message: IMqttMessage) => {
        const payload = message.payload.toString();
        console.log('Tin nhắn nhận được1:', payload); // In ra thông điệp nhận được
        const [temp, hum, light, smoke] = payload.split(',').map(Number);

        this.temperature = temp;
        this.humidity = hum;
        this.light = light;
        this.smoke = smoke;
        this.loadChartData();
        
        if (this.smoke >= 80) {
          if(this.isFanOn == false) {
          this.toggleFan(true); 
          this.showAlertSmoke('Cảnh báo: Mức khói cao! Quạt đang được bật...');
          }
        } 
        else if (this.smoke < 50) {
          if(this.isFanOn == true) {
          this.toggleFan(false); 
          this.showAlertSmoke('Mức khói giảm, Quạt đang được tắt.');
          }
        }
       

      });
  }

  
  handleMQTTMessage(payload: string): void {
    const [device, state] = payload.split(',');
    const isOn = state === 'On';

    switch (device) {
      case 'Fan':
        this.isFanOn = isOn;
        localStorage.setItem('Fan', isOn ? 'On' : 'Off'); // Lưu trạng thái Fan
        this.pendingCommands.delete('Fan');
        break;
      case 'Led-1':
        this.isLED1On = isOn;
        localStorage.setItem('Led-1', isOn ? 'On' : 'Off'); // Lưu trạng thái LED-1
        this.pendingCommands.delete('Led-1');
        break;
      case 'Led-2':
        this.isLED2On = isOn;
        localStorage.setItem('Led-2', isOn ? 'On' : 'Off'); // Lưu trạng thái LED-2
        this.pendingCommands.delete('Led-2');
        break;
    }
   // this.showAlertDevice(` ${device} is turning ${state}`);
  }

  restoreDeviceStates(): void {
    this.isFanOn = localStorage.getItem('Fan') === 'On';
    this.isLED1On = localStorage.getItem('Led-1') === 'On';
    this.isLED2On = localStorage.getItem('Led-2') === 'On';
  }

  toggleFan(turnOn: boolean): void {
    if (this.pendingCommands.has('Fan')) return; // Đã có lệnh đang chờ, bỏ qua
    this.pendingCommands.add('Fan');
    const command = `Fan,${turnOn ? 'On' : 'Off'}`;
    this.publishCommand(command);
    this.showAlertDevice(` Fan is turning ${turnOn ? 'On' : 'Off'}`);
  }

  toggleLED1(turnOn: boolean): void {
    if (this.pendingCommands.has('Led-1')) return;
    this.pendingCommands.add('Led-1');
    const command = `Led-1,${turnOn ? 'On' : 'Off'}`;
    this.publishCommand(command);
    this.showAlertDevice(` Led-1 is turning ${turnOn ? 'On' : 'Off'}`);
  }

  toggleLED2(turnOn: boolean): void {
    if (this.pendingCommands.has('Led-2')) return;
    this.pendingCommands.add('Led-2');
    const command = `Led-2,${turnOn ? 'On' : 'Off'}`;
    this.publishCommand(command);
    this.showAlertDevice(` Led-2 is turning ${turnOn ? 'On' : 'Off'}`);
  }

  publishCommand(command: string): void {
    this.mqttService.unsafePublish('device/action', command);
    console.log('Published "device/action "+ command:', command);
   // this.showAlertDevice(`Published: ${command}`);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadInitialData(): void {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0);

    // console.log("Start of Day:", startOfDay);
    // console.log("End of Day:", endOfDay);s
    this.appService.getAllEnvironmentalData().subscribe({
        next: (data) => {
            this.smokeData = data.filter(item => 
                item.smoke >= 80 && 
                new Date(item.time) >= startOfDay && 
                new Date(item.time) < endOfDay
            );
            if (this.smokeData.length > 0) {
                this.smoke = this.smokeData[this.smokeData.length - 1].smoke; 
            }
        },
        error: (error) => {
            console.error('Lỗi khi lấy dữ liệu khói:', error);
        },
    });

    
    this.appService.getAllDeviceAction().subscribe({
        next: (deviceActions) => {
            this.fanOnCount = deviceActions.filter(action => 
                action.device === 'Fan' && 
                action.action === 'On' && 
                new Date(action.time) >= startOfDay && 
                new Date(action.time) < endOfDay
            ).length;
        },
        error: (error) => {
            console.error('Lỗi khi lấy số lần bật quạt:', error);
        },
    });
}

  loadChartData(): void {
    console.log('Loading chart data...');
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
    if (!this.fullStatisticsData || this.fullStatisticsData.length === 0) {
      console.error('No data available to update charts.');
      return;
    }

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

    const filteredData = this.fullStatisticsData.slice(-15);

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
      {
        name: 'Smoke',
        series: filteredData.map((data) => ({
          name: formatDateTime(data.time),
          value: data.smoke,
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

    if (this.light > 400) {
      this.showAlert = true;
    }
    console.log('Charts updated.');
  }

  getTemperatureColor() {
    return this.temperature < 15
      ? 'Tmuc1'
      : this.temperature < 22
      ? 'Tmuc2'
      : this.temperature < 27
      ? 'Tmuc3'
      : this.temperature < 32
      ? 'Tmuc4'
      : this.temperature < 35
      ? 'Tmuc5'
      : this.temperature <= 42
      ? 'Tmuc6'
      : 'Tmuc7';
  }

  getHumidityColor() {
    return this.humidity < 15
      ? 'Hmuc1'
      : this.humidity < 45
      ? 'Hmuc2'
      : this.humidity < 70
      ? 'Hmuc3'
      : this.humidity < 90
      ? 'Hmuc4'
      : 'Hmuc5';
  }

  getLightColor() {
    return this.light < 50
      ? 'Lmuc1'
      : this.light < 100
      ? 'Lmuc2'
      : this.light < 200
      ? 'Lmuc3'
      : this.light < 300
      ? 'Lmuc4'
      : this.light < 400
      ? 'Lmuc5'
      : 'Lmuc6';
  }
  getSmokeColor(): string {
    if (this.smoke >= 80) {
      return 'smoke-danger'; 
    } else if (this.smoke >= 60) {
      return 'smoke-warning'; 
    } else if (this.smoke >= 30) {
      return 'smoke-normal'; 
    } else {
      return 'smoke-low'; 
    }
  }
  

  showAlertDevice(message: string) {
    this.alertMessage = message;
    this.isAlertVisible = true;
    this.progressBarWidth = 100;  // Thanh tiến trình bắt đầu từ 100%

  const interval = setInterval(() => {
    this.progressBarWidth -= 2;  // Giảm chiều rộng thanh tiến trình
    if (this.progressBarWidth <= 0) {
      clearInterval(interval);
    }
  }, 60);  // Cứ 100ms giảm chiều rộng 2%
    setTimeout(() => {
      this.isAlertVisible = false;
    }, 3000);
  }
  showAlertSmoke(message: string) {
    this.alertMessageSmoke = message;
    this.isAlertSomke = true;

    setTimeout(() => {
      this.isAlertSomke = false;
    }, 3000);
  }

  closeAlert(): void {
    this.showAlert = false;
  }
}
