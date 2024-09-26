package com.example.iot_system_BE;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.iot_system_BE.entity.DeviceAction;
import com.example.iot_system_BE.entity.EnvironmentalData;
import com.example.iot_system_BE.repository.DeviceActionRepository;
import com.example.iot_system_BE.repository.EnvironmentalDataRepository;

@Service
public class MqttSubscriber implements MqttCallback {

    private MqttClient client;

    @Autowired
    private EnvironmentalDataRepository environmentalDataRepository;

    @Autowired
    private DeviceActionRepository deviceActionRepository;

    public MqttSubscriber() {
        String broker = "tcp://localhost:1883"; // Địa chỉ Mosquitto broker
        String clientId = "spring-mqtt-subscriber";
        try {
            client = new MqttClient(broker, clientId);
            client.setCallback(this);

            // Thiết lập các tùy chọn kết nối
            MqttConnectOptions options = new MqttConnectOptions();
            options.setUserName("trungduc");
            options.setPassword("trungduc".toCharArray()); // Đổi "trungduc" thành mật khẩu thực tế
            options.setKeepAliveInterval(60);
            options.setConnectionTimeout(30);

            try {
                client.connect(options);
                System.out.println("Kết nối thành công với broker MQTT.");
            } catch (MqttException e) {
                System.out.println("Lỗi khi kết nối: " + e.getMessage());
                e.printStackTrace();
            }

            client.subscribe("environmental/data");
            client.subscribe("device/action/status"); // Đăng ký các topic cần lắng nghe
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void connectionLost(Throwable cause) {
        System.out.println("Kết nối bị mất: " + cause.getMessage());
        try {
            client.reconnect();
        } catch (MqttException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) throws Exception {
        String payload = new String(message.getPayload());
        System.out.println("Nhận được tin nhắn: " + payload);

        // Tùy thuộc vào topic và định dạng dữ liệu, phân tích payload và lưu vào cơ sở
        // dữ liệu
        if (topic.equals("environmental/data")) {
            System.out.println("enviroment");
            saveEnvironmentalData(payload);
            
        } else if (topic.equals("device/action/status")) {
            saveDeviceAction(payload);
            System.out.println("device");
        }
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        // Không cần xử lý vì đây là client chỉ nhận
    }

    private void saveEnvironmentalData(String data) {
        System.out.println("Đang lưu dữ liệu môi trường: " + data);
        String[] parts = data.split(",");
        try {
            EnvironmentalData environmentalData = new EnvironmentalData();
            environmentalData.setTemperature(Double.parseDouble(parts[0])); // Cập nhật chỉ số đúng theo thứ tự của bạn
            environmentalData.setHumidity(Double.parseDouble(parts[1]));
            environmentalData.setLight(Double.parseDouble(parts[2]));

            // Sử dụng thời gian hiện tại
            environmentalData.setTime(LocalDateTime.now());

            environmentalDataRepository.save(environmentalData);
            System.out.println("Lưu dữ liệu môi trường thành công.");
        } catch (Exception e) {
            System.out.println("Lỗi khi lưu dữ liệu môi trường: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void saveDeviceAction(String data) {
        System.out.println("Đang lưu dữ liệu môi trường: " + data);
        String[] parts = data.split(",");
        try{
        DeviceAction deviceAction = new DeviceAction();
        deviceAction.setDevice(parts[0]); // Cập nhật chỉ số đúng theo thứ tự của bạn
        deviceAction.setAction(parts[1]);

        // Sử dụng thời gian hiện tại
        deviceAction.setTime(LocalDateTime.now());

        deviceActionRepository.save(deviceAction);
        System.out.println("Lưu dữ liệu môi trường thành công.");
    } catch (Exception e) {
        System.out.println("Lỗi khi lưu dữ liệu môi trường: " + e.getMessage());
        e.printStackTrace();
    }
    }
}
