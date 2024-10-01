// import { Injectable } from '@angular/core';
// import { connect, MqttClient } from 'mqtt';

// @Injectable({
//   providedIn: 'root'
// })
// export class MqttService {
//   private client!: MqttClient;
//   public temperature: number = 0;
//   public humidity: number = 0;
//   public light: number = 0;

//   constructor() {
//     this.connectToBroker();
//   }

//   private connectToBroker(): void {
//     this.client = connect({
//       host: 'localhost',
//       port: 1883,
//       protocol: 'mqtt',
//       username: 'trungduc',
//       password: 'trungduc',
//     });

//     this.client.on('connect', () => {
//       console.log('Connected to MQTT broker');
//       this.subscribeToTopic('environmental');
//     });

//     this.client.on('error', (err) => {
//       console.error('Connection error: ', err);
//       this.client.end();
//     });

//     this.client.on('message', (topic, message) => {
//       this.handleMessage(topic, message.toString());
//     });
//   }

//   private subscribeToTopic(topic: string): void {
//     if (this.client && this.client.connected) {
//       this.client.subscribe(topic, (err) => {
//         if (err) {
//           console.error(`Subscription error: ${err.message}`);
//         } else {
//           console.log(`Subscribed to topic: ${topic}`);
//         }
//       });
//     }
//   }

//   private handleMessage(topic: string, message: string): void {
//     console.log(`Received message: ${message} from topic: ${topic}`);
//     const [temperature, humidity, light] = message.split(',').map(Number);
//     this.temperature = temperature;
//     this.humidity = humidity;
//     this.light = light;

//     // Cập nhật giao diện hoặc thực hiện hành động khác với dữ liệu này
//     console.log(`Temperature: ${this.temperature} °C`);
//     console.log(`Humidity: ${this.humidity} %`);
//     console.log(`Light: ${this.light} Lux`);
//   }

//   public publishMessage(topic: string, message: string): void {
//     if (this.client && this.client.connected) {
//       this.client.publish(topic, message);
//     }
//   }
// }
