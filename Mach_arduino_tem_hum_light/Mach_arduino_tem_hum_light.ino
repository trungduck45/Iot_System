#include "DHT.h"
#include <ESP8266WiFi.h>
#include <Ticker.h>
#include <AsyncMqttClient.h>
#include <ArduinoJson.h>

#define WIFI_SSID "An Nhien" // "iPhone"
#define WIFI_PASSWORD "999999999" // "khongcomatkhau"

// Raspberri Pi Mosquitto MQTT Broker
#define MQTT_HOST IPAddress(192,168,1,2) //(172, 20, 10,2)
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
#define Led1_PIN 4  // Thay đổi theo chân thực tế
#define Led2_PIN 5  // Thay đổi theo chân thực tế

// Uncomment whatever DHT sensor type you're using
#define DHTTYPE DHT11  // DHT 11

// Initialize DHT sensor
DHT dht(DHTPIN, DHTTYPE);

// Variables to hold sensor readings
float temp;
float hum;
float light;  

AsyncMqttClient mqttClient;
Ticker mqttReconnectTimer;
WiFiEventHandler wifiConnectHandler;
WiFiEventHandler wifiDisconnectHandler;
Ticker wifiReconnectTimer;

unsigned long previousMillis = 0;  // Stores last time temperature was published
const long interval = 5000;       // Interval at which to publish sensor readings

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

// Publish the device state to MQTT
void publishDeviceState(const char* device, const char* state) {
  String message = String(device) + "," + String(state);
  mqttClient.publish("device/action/callback", 1, true, message.c_str());
  Serial.printf("Published: %s\n", message.c_str());
}


void onMessage(char* topic, char* payload, AsyncMqttClientMessageProperties properties, size_t length, size_t index, size_t total) {
  Serial.println("Message arrived [" + String(topic) + "]");

  String message = String(payload).substring(0, length);


  Serial.print("Raw Message: "+message);
 
  int commaIndex = message.indexOf(',');
  if (commaIndex != -1) {
    String device = message.substring(0, commaIndex);
    String status = message.substring(commaIndex + 1);

    Serial.println("Device: " + device);
    Serial.println("Status: " + status);

    // Điều khiển thiết bị dựa trên tin nhắn
    if (device == "Fan") {
      digitalWrite(Fan_PIN, status == "On" ? HIGH : LOW);
      Serial.println("Fan set to " + status);
      delay(1000);
      publishDeviceState("Fan", status.c_str());

    } else if (device == "Led-1") {
      digitalWrite(Led1_PIN, status == "On" ? HIGH : LOW);
      Serial.println("Led-1 set to " + status);
      delay(1000);
      publishDeviceState("Led-1", status.c_str());

    } else if (device == "Led-2") {
      digitalWrite(Led2_PIN, status == "On" ? HIGH : LOW);
      Serial.println("Led-2 set to " + status);
      delay(1000);
      publishDeviceState("Led-2", status.c_str());

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
  mqttClient.onMessage(onMessage);  

  mqttClient.setServer(MQTT_HOST, MQTT_PORT);
  mqttClient.setCredentials(MQTT_USERNAME, MQTT_PASSWORD);

  pinMode(Fan_PIN, OUTPUT);
  pinMode(Led1_PIN, OUTPUT);
  pinMode(Led2_PIN, OUTPUT);

  connectToWifi();
}
void loop() {
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    
    hum = dht.readHumidity();
    temp = dht.readTemperature();
    int analogValue = analogRead(A0);  // Đọc giá trị từ chân analog (A0)
    float voltage = (analogValue / 1023.0) * 3.3;  // Chuyển đổi giá trị analog thành điện áp

    // Chuyển đổi giá trị analog thành Lux từ 500 đến 0
    float lux = 500 - (analogValue / 1023.0) * 500;


    int light = lux;  // Đọc giá trị từ cảm biến ánh sáng

    // Làm tròn nhiệt độ và độ ẩm đến 1 chữ số sau dấu thập phân
    float roundedTemp = round(temp * 10) / 10.0;
    float roundedHum = round(hum * 10) / 10.0;

    // Tạo giá trị ngẫu nhiên cho độ bụi từ 30 đến 100
    int dustLevel = random(30, 101); // random(30, 101) trả về số ngẫu nhiên từ 30 đến 100

    // Tạo đối tượng JSON
    String jsonString = String(roundedTemp) + "," + String(roundedHum) + "," + String(light) + "," + String(dustLevel);

    // In các giá trị nhiệt độ và độ ẩm ra màn hình Serial
    Serial.print("Nhiệt độ: ");
    Serial.print(roundedTemp);
    Serial.print(" °C, Độ ẩm: ");
    Serial.print(roundedHum);
    Serial.print(" %, Độ bụi: ");
    Serial.print(dustLevel);
    Serial.println(" ");

    uint16_t packetId = mqttClient.publish(MQTT_PUB_SENSOR, 1, true, jsonString.c_str());
    Serial.printf("Đang xuất bản trên chủ đề %s với QoS 1, packetId %i: ", MQTT_PUB_SENSOR, packetId);
    Serial.printf("Tin nhắn: %s \n", jsonString.c_str());
  }
}

