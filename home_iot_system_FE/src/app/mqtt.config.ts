import { IMqttServiceOptions } from 'ngx-mqtt';

interface ExtendedMqttServiceOptions extends IMqttServiceOptions {
  username?: string;
  password?: string;
}

export const MQTT_SERVICE_OPTIONS: ExtendedMqttServiceOptions = {
  hostname: 'localhost',
  port: 1884, // Cổng WebSocket của MQTT Broker, ví dụ: 8083 hoặc 1884
  path: '', // Đường dẫn, để trống nếu không có sub-path
  protocol: 'ws', // Giao thức WebSocket, hoặc 'wss' nếu dùng bảo mật
  username: 'trungduc', // Tên đăng nhập
  password: 'trungduc', // Mật khẩu
  connectOnCreate: true, // Tự động kết nối khi MQTT service được tạo
};