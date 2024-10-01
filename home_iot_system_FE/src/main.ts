import { bootstrapApplication } from '@angular/platform-browser';
import { MqttService } from 'ngx-mqtt';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { MQTT_SERVICE_OPTIONS } from './app/mqtt.config'; // Import cấu hình MQTT

bootstrapApplication(AppComponent, {
  ...appConfig, // Giữ lại cấu hình hiện tại
  providers: [
    ...appConfig.providers || [], // Giữ lại các providers hiện có nếu có
    { provide: MqttService, useValue: new MqttService(MQTT_SERVICE_OPTIONS) } // Thêm MQTT Client vào providers
  ]
})
.catch((err) => console.error(err));
