#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ESP32Servo.h>
#include "OLEDDisplay.h"

#define LED_PIN 2           // wbudowana dioda na ESP32
#define ONE_WIRE_BUS 4      // Pin do podłączenia DS18B20
#define POWER_PIN 5         // Pin do sterowania ON/OFF
#define SERVO_PIN 18        // Pin do sterowania serwem (PWM)

// Konfiguracja WiFi
const char* ssid = "PLAY_Swiatlowodowy_572B";
const char* password = "pz9zfVmGaN";
// Adres serwera VPS
const char* serverUrl = "http://45.90.121.228";
const char* deviceId = "maszyna";  // Device ID zgodnie z wymaganiami

// Instancje
OLEDDisplay oled;
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
Servo servo;  // Instancja serwa

// Dane systemu
struct SystemData {
  float temperature1 = 0.0;  // Pierwszy termometr
  float temperature2 = 0.0;  // Drugi termometr
  float temperature3 = 0.0;   // Trzeci termometr
  bool powerState = false;    // Stan ON/OFF maszyny
  float servoValue = 0.0;     // Wartość serwa (0-100)
  unsigned long lastDataSend = 0;
  unsigned long lastCommandCheck = 0;
  int sensorCount = 0;       // Liczba znalezionych czujników
  
  // Statusy do wyświetlania
  String wifiStatus = "Laczenie...";
  String dataStatus = "Brak";
  String commandStatus = "Brak";
  String lastError = "";
  String lastCommand = "";   // Ostatnia wykonana komenda
} systemData;

// Deklaracje funkcji
void connectToWiFi();
void updateSensorData();
void sendDataToServer();
void checkForCommands();
void executeCommand(int commandId, String commandType, float commandValue);
void sendAck(int commandId);
void updateDisplay();

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  pinMode(POWER_PIN, OUTPUT);
  digitalWrite(POWER_PIN, LOW);  // Domyślnie wyłączone
  
  // Inicjalizuj serwo
  servo.attach(SERVO_PIN);
  servo.write(0);  // Domyślna pozycja 0
  
  // Inicjalizuj wyświetlacz
  if (oled.begin()) {
    Serial.println("✅ Wyświetlacz OLED zainicjalizowany!");
    oled.showWelcomeMessage();
    delay(2000);
  } else {
    Serial.println("❌ Błąd inicjalizacji wyświetlacza OLED!");
  }
  
  // Inicjalizuj czujniki temperatury
  sensors.begin();
  systemData.sensorCount = sensors.getDeviceCount();
  Serial.println("🔍 Znaleziono " + String(systemData.sensorCount) + " czujników DS18B20");
  
  if (systemData.sensorCount == 0) {
    Serial.println("⚠️ Brak czujników DS18B20! Sprawdź podłączenie.");
  }
  
  // Połącz z WiFi
  connectToWiFi();
  
  // Wyślij pierwsze dane
  updateSensorData();
  sendDataToServer();
  systemData.lastDataSend = millis();
  
  Serial.println("🚀 System gotowy! Device ID: " + String(deviceId));
}

void loop() {
  // Sprawdź połączenie WiFi
  if (WiFi.status() != WL_CONNECTED) {
    systemData.wifiStatus = "Brak polaczenia";
    connectToWiFi();
    return;
  }
  
  // Wyślij dane co 1 sekundę
  if (millis() - systemData.lastDataSend > 1000) {
    updateSensorData();
    sendDataToServer();
    systemData.lastDataSend = millis();
  }
  
  // Pobierz komendy co 3 sekundy
  if (millis() - systemData.lastCommandCheck > 3000) {
    checkForCommands();
    systemData.lastCommandCheck = millis();
  }
  
  // Aktualizuj wyświetlacz
  updateDisplay();
  
  delay(100);
}

// Funkcje WiFi
void connectToWiFi() {
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    systemData.wifiStatus = "Proba " + String(attempts + 1) + "/20";
    delay(500);
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    systemData.wifiStatus = WiFi.localIP().toString();
  } else {
    systemData.wifiStatus = "Brak polaczenia";
  }
}

// Funkcje danych
void updateSensorData() {
  if (systemData.sensorCount == 0) {
    // Brak czujników - symuluj dane
    systemData.temperature1 = 1;
    systemData.temperature2 = 1;
    systemData.temperature3 = -999.0;
    return;
  }
  
  // Odczytaj temperatury z czujników
  sensors.requestTemperatures();
  
  if (systemData.sensorCount >= 1) {
    systemData.temperature1 = sensors.getTempCByIndex(0);
    if (isnan(systemData.temperature1) || systemData.temperature1 == DEVICE_DISCONNECTED_C) {
      systemData.temperature1 = -999.0; // Błąd odczytu
    }
  }
  
  if (systemData.sensorCount >= 2) {
    systemData.temperature2 = sensors.getTempCByIndex(1);
    if (isnan(systemData.temperature2) || systemData.temperature2 == DEVICE_DISCONNECTED_C) {
      systemData.temperature2 = -999.0; // Błąd odczytu
    }
  }
  
  if (systemData.sensorCount >= 3) {
    systemData.temperature3 = sensors.getTempCByIndex(2);
    if (isnan(systemData.temperature3) || systemData.temperature3 == DEVICE_DISCONNECTED_C) {
      systemData.temperature3 = -999.0; // Błąd odczytu
    }
  } else {
    systemData.temperature3 = -999.0; // Brak trzeciego czujnika
  }
  
  Serial.println("🌡️ T1: " + String(systemData.temperature1) + "°C, T2: " + String(systemData.temperature2) + "°C, T3: " + String(systemData.temperature3) + "°C");
}

// Funkcje HTTP
void sendDataToServer() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  http.begin(serverUrl + String("/api/esp32/data"));
  http.addHeader("Content-Type", "application/json");
  
  // Przygotuj dane JSON zgodnie z nowym API
  DynamicJsonDocument doc(512);
  doc["deviceId"] = deviceId;
  doc["temperature1"] = systemData.temperature1;
  doc["temperature2"] = systemData.temperature2;
  doc["temperature3"] = systemData.temperature3;
  doc["sensorCount"] = systemData.sensorCount;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    systemData.dataStatus = "OK (" + String(httpResponseCode) + ")";
    systemData.lastError = "";
  } else {
    systemData.dataStatus = "Blad";
    systemData.lastError = "Wysylanie: " + String(httpResponseCode);
  }
  
  http.end();
}

void checkForCommands() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  String url = String(serverUrl) + "/api/esp32/commands?deviceId=" + String(deviceId);
  http.begin(url);
  
  int httpResponseCode = http.GET();
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    DynamicJsonDocument doc(1024);
    DeserializationError error = deserializeJson(doc, response);
    
    if (!error && doc.containsKey("commands")) {
      JsonArray commands = doc["commands"];
      
      if (commands.size() > 0) {
        systemData.commandStatus = "OK (" + String(commands.size()) + ")";
        
        // Przetwarzaj komendy w kolejności FIFO
        for (JsonObject cmd : commands) {
          int commandId = cmd["id"];
          String commandType = cmd["type"].as<String>();
          float commandValue = cmd["value"].isNull() ? 0.0 : cmd["value"].as<float>();
          
          Serial.println("📥 Otrzymano komendę: " + commandType + " (ID: " + String(commandId) + ")");
          
          // Wykonaj komendę
          executeCommand(commandId, commandType, commandValue);
        }
      } else {
        systemData.commandStatus = "OK (0)";
      }
      systemData.lastError = "";
    } else {
      systemData.commandStatus = "Blad JSON";
      systemData.lastError = "Parsowanie: " + String(error.c_str());
    }
  } else if (httpResponseCode < 0) {
    systemData.commandStatus = "Blad";
    systemData.lastError = "Komendy: " + String(httpResponseCode);
  }
  
  http.end();
}

void executeCommand(int commandId, String commandType, float commandValue) {
  bool success = false;
  String commandDesc = "";
  
  if (commandType == "power_on") {
    digitalWrite(POWER_PIN, HIGH);
    systemData.powerState = true;
    commandDesc = "ON";
    success = true;
    Serial.println("✅ Włączono maszynę");
  } 
  else if (commandType == "power_off") {
    digitalWrite(POWER_PIN, LOW);
    systemData.powerState = false;
    commandDesc = "OFF";
    success = true;
    Serial.println("✅ Wyłączono maszynę");
  } 
  else if (commandType == "servo") {
    // Mapuj wartość 0-100 na kąt serwa 0-180
    int servoAngle = map((int)commandValue, 0, 100, 0, 180);
    servo.write(servoAngle);
    systemData.servoValue = commandValue;
    commandDesc = "SERVO " + String(commandValue, 1) + "%";
    success = true;
    Serial.println("✅ Ustawiono serwo na " + String(commandValue, 1) + "% (kąt: " + String(servoAngle) + "°)");
  } 
  else {
    Serial.println("❌ Nieznany typ komendy: " + commandType);
    systemData.lastError = "Nieznana komenda: " + commandType;
    return;
  }
  
  if (success) {
    systemData.lastCommand = commandDesc;
    // Wyślij potwierdzenie (ACK)
    sendAck(commandId);
  }
}

void sendAck(int commandId) {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  http.begin(serverUrl + String("/api/esp32/commands/ack"));
  http.addHeader("Content-Type", "application/json");
  
  // Przygotuj dane JSON dla ACK
  DynamicJsonDocument doc(256);
  doc["deviceId"] = deviceId;
  doc["commandId"] = commandId;
  doc["status"] = "OK";
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode == 200) {
    Serial.println("✅ Wysłano ACK dla komendy ID: " + String(commandId));
  } else {
    Serial.println("❌ Błąd wysyłania ACK: " + String(httpResponseCode));
    systemData.lastError = "ACK: " + String(httpResponseCode);
  }
  
  http.end();
}


void updateDisplay() {
  // Wyświetl wszystkie informacje na jednym ekranie
  oled.showSystemInfo(
    systemData.temperature1, 
    systemData.temperature2,
    systemData.temperature3,
    systemData.powerState,
    systemData.servoValue,
    systemData.wifiStatus,
    systemData.dataStatus,
    systemData.commandStatus,
    systemData.lastCommand,
    systemData.lastError
  );
}
