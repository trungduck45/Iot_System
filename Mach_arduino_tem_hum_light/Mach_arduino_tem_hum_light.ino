#include "DHT.h"
#include <ESP8266WiFi.h>
#include <Ticker.h>
#include <AsyncMqttClient.h>
#include <ArduinoJson.h>

#define WIFI_SSID "An Nhien"
#define WIFI_PASSWORD "999999999"

// Raspberri Pi Mosquitto MQTT Broker
#define MQTT_HOST IPAddress(192, 168, 1,2)
#define MQTT_PORT 1883

// Topic cho dữ liệu sensor
#define MQTT_PUB_SENSOR "environmental/data"
#define MQTT_SUB_DEVICE_ACTION "device/action"

// Digital pin connected to the DHT sensor
#define DHTPIN 14

// Pin connected to the light sensor
#define LIGHT_SENSOR_PIN A0  // Giả sử cảm biến ánh sáng được kết nối với chân analog A0

// Khai báo chân GPIO cho LED
#define Fan_PIN 12  // Thay đổi theo chân thực tế
#define Led1_PIN 13  // Thay đổi theo chân thực tế
#define Led2_PIN 15  // Thay đổi theo chân thực tế

#define TempCheck_LED_PIN 16  // Chân GPIO cho LED kiểm tra nhiệt độ

// Uncomment whatever DHT sensor type you're using
#define DHTTYPE DHT11  // DHT 11

// Initialize DHT sensor
DHT dht(DHTPIN, DHTTYPE);

// Variables to hold sensor readings
float temp;
float hum;
int light;  // Thay đổi biến để lưu giá trị ánh sáng thành float

AsyncMqttClient mqttClient;
Ticker mqttReconnectTimer;
WiFiEventHandler wifiConnectHandler;
WiFiEventHandler wifiDisconnectHandler;
Ticker wifiReconnectTimer;

unsigned long previousMillis = 0;  // Stores last time temperature was published
const long interval = 10000;       // Interval at which to publish sensor readings

#define MQTT_USERNAME "trungduc"
#define MQTT_PASSWORD "trungduc"

// Variables for temperature checking
bool isBlinking = false;
unsigned long blinkPreviousMillis = 0;
const long blinkInterval = 500;  // Thời gian nhấp nháy 1 giây

void connectToWifi() {
  Serial.println("Connecting to Wi-Fi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

void onWifiConnect(const WiFiEventStationModeGotIP& event) {
  Serial.println("Connected to Wi-Fi.");
  connectToMqtt();
}

void onWifiDisconnect(const WiFiEventStationModeDisconnected& event) {
  Serial.println("Disconnected from Wi-Fi.");
  mqttReconnectTimer.detach();  // ensure we don't reconnect to MQTT while reconnecting to Wi-Fi
  wifiReconnectTimer.once(2, connectToWifi);
}

void connectToMqtt() {
  Serial.println("Connecting to MQTT...");
  mqttClient.connect();
}

void onMqttConnect(bool sessionPresent) {
  Serial.println("Connected to MQTT.");
  Serial.print("Session present: ");
  Serial.println(sessionPresent);
  mqttClient.subscribe(MQTT_SUB_DEVICE_ACTION, 1); // Subscribe to the device action topic
}

void onMqttDisconnect(AsyncMqttClientDisconnectReason reason) {
  Serial.println("Disconnected from MQTT.");
  if (WiFi.isConnected()) {
    mqttReconnectTimer.once(2, connectToMqtt);
  }
}

void onMqttPublish(uint16_t packetId) {
  Serial.print("Publish acknowledged.");
  Serial.print("  packetId: ");
  Serial.println(packetId);
}

// Callback function for handling MQTT messages
void onMessage(char* topic, char* payload, AsyncMqttClientMessageProperties properties, size_t length, size_t index, size_t total) {
  Serial.println("Message arrived [" + String(topic) + "]");

  // Chuyển đổi payload thành chuỗi
  String message(payload);
  
  // Loại bỏ ký tự không mong muốn
  message.trim();
  Serial.println("Raw Message: " + message);

  // Kiểm tra và tách chuỗi tin nhắn thành các phần
  int commaIndex = message.indexOf(',');
  if (commaIndex != -1) {
    String device = message.substring(0, commaIndex);
    String status = message.substring(commaIndex + 1);
    
    // Chỉ lấy hai ký tự đầu tiên của status
    if (status.length() > 2) {
      status = status.substring(0, 2);
    }

    // Loại bỏ các ký tự không mong muốn nếu có
    device.trim();
    status.trim();

    Serial.println("Device: " + device);
    Serial.println("Status: " + status);

    // Điều khiển LED dựa trên tin nhắn
    if (device == "Fan") {

      digitalWrite(Fan_PIN, status == "On" ? HIGH : LOW);
      Serial.println("Fan set to " + status);

    } else if (device == "Led-1") {

      digitalWrite(Led1_PIN, status == "On" ? HIGH : LOW);
      Serial.println("Led-1 set to " + status);

    } else if (device == "Led-2") {

      digitalWrite(Led2_PIN, status == "On" ? HIGH : LOW);
      Serial.println("Led-2 set to " + status);
      
    } else {
      Serial.println("Unknown device: " + device);
    }
  } else {
    Serial.println("Invalid message format");
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println();

  dht.begin();
  wifiConnectHandler = WiFi.onStationModeGotIP(onWifiConnect);
  wifiDisconnectHandler = WiFi.onStationModeDisconnected(onWifiDisconnect);

  mqttClient.onConnect(onMqttConnect);
  mqttClient.onDisconnect(onMqttDisconnect);
  mqttClient.onPublish(onMqttPublish);
  mqttClient.onMessage(onMessage);  // Đăng ký callback xử lý tin nhắn

  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  mqttClient.setCredentials(MQTT_USERNAME, MQTT_PASSWORD);

  pinMode(Fan_PIN, OUTPUT);
  pinMode(Led1_PIN, OUTPUT);
  pinMode(Led2_PIN, OUTPUT);
  pinMode(TempCheck_LED_PIN, OUTPUT);

  connectToWifi();
}

void loop() {
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    
    hum = dht.readHumidity();
    temp = dht.readTemperature();
    light = analogRead(LIGHT_SENSOR_PIN);  // Đọc giá trị từ cảm biến ánh sáng

    // Làm tròn nhiệt độ và độ ẩm đến 1 chữ số sau dấu thập phân
    float roundedTemp = round(temp * 10) / 10.0;
    float roundedHum = round(hum * 10) / 10.0;

    // Tạo đối tượng JSON
    String jsonString = String(roundedTemp) + "," + String(roundedHum) + "," + String(light) ;

    // In các giá trị nhiệt độ và độ ẩm ra màn hình Serial
    Serial.print("Nhiệt độ: ");
    Serial.print(roundedTemp);
    Serial.print(" °C, Độ ẩm: ");
    Serial.print(roundedHum);
    Serial.println(" %");

    uint16_t packetId = mqttClient.publish(MQTT_PUB_SENSOR, 1, true, jsonString.c_str());
    Serial.printf("Đang xuất bản trên chủ đề %s với QoS 1, packetId %i: ", MQTT_PUB_SENSOR, packetId);
    Serial.printf("Tin nhắn: %s \n", jsonString.c_str());
  }

  // Kiểm tra nhiệt độ và điều khiển LED nhấp nháy
  if (temp >= 31) {
    unsigned long blinkCurrentMillis = millis();
    if (blinkCurrentMillis - blinkPreviousMillis >= blinkInterval) {
      blinkPreviousMillis = blinkCurrentMillis;
      // Toggle LED
      int ledState = digitalRead(TempCheck_LED_PIN);
      digitalWrite(TempCheck_LED_PIN, ledState == LOW ? HIGH : LOW);
    }
    isBlinking = true;
  } else {
    if (isBlinking) {
      // Tắt LED khi nhiệt độ < 31°C
      digitalWrite(TempCheck_LED_PIN, LOW);
      isBlinking = false;
    }
  }
}
