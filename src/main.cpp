#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "OLEDDisplay.h"

#define LED_PIN 2   // wbudowana dioda na ESP32
#define ONE_WIRE_BUS 4  // Pin do podłączenia DS18B20

// Konfiguracja WiFi
const char* ssid = "PLAY_Swiatlowodowy_572B";
const char* password = "pz9zfVmGaN";
const char* serverUrl = "http://192.168.0.70:4200";

// Instancje
OLEDDisplay oled;
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// Dane systemu
struct SystemData {
  float temperature1 = 0.0;  // Pierwszy termometr
  float temperature2 = 0.0;  // Drugi termometr
  float power = 0.0;         // Pobierane z backendu
  unsigned long lastDataSend = 0;
  unsigned long lastCommandCheck = 0;
  int sensorCount = 0;       // Liczba znalezionych czujników
  
  // Statusy do wyświetlania
  String wifiStatus = "Laczenie...";
  String dataStatus = "Brak";
  String powerStatus = "Brak";
  String lastError = "";
} systemData;

// Deklaracje funkcji
void connectToWiFi();
void updateSensorData();
void sendDataToServer();
void checkForPower();
void updateDisplay();

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  
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
}

void loop() {
  // Sprawdź połączenie WiFi
  if (WiFi.status() != WL_CONNECTED) {
    systemData.wifiStatus = "Brak polaczenia";
    connectToWiFi();
    return;
  }
  
  // Wyślij dane co 5 sekund
  if (millis() - systemData.lastDataSend > 1000) {
    updateSensorData();
    sendDataToServer();
    systemData.lastDataSend = millis();
  }
  
  // Pobierz moc co 3 sekundy
  if (millis() - systemData.lastCommandCheck > 3000) {
    checkForPower();
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
  
  Serial.println("🌡️ T1: " + String(systemData.temperature1) + "°C, T2: " + String(systemData.temperature2) + "°C");
}

// Funkcje HTTP
void sendDataToServer() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  http.begin(serverUrl + String("/api/esp32/data"));
  http.addHeader("Content-Type", "application/json");
  
  // Przygotuj dane JSON - temperatury z obu czujników
  DynamicJsonDocument doc(512);
  doc["temperature1"] = systemData.temperature1;
  doc["temperature2"] = systemData.temperature2;
  doc["sensorCount"] = systemData.sensorCount;
  doc["status"] = "online";
  
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

void checkForPower() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  http.begin(serverUrl + String("/api/esp32/power"));
  
  int httpResponseCode = http.GET();
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    DynamicJsonDocument doc(256);
    deserializeJson(doc, response);
    
    if (doc.containsKey("power")) {
      systemData.power = doc["power"];
      systemData.powerStatus = "OK";
      systemData.lastError = "";
    }
  } else if (httpResponseCode < 0) {
    systemData.powerStatus = "Blad";
    systemData.lastError = "Moc: " + String(httpResponseCode);
  }
  
  http.end();
}


void updateDisplay() {
  // Wyświetl wszystkie informacje na jednym ekranie
  oled.showSystemInfo(
    systemData.temperature1, 
    systemData.temperature2,
    systemData.power,
    systemData.wifiStatus,
    systemData.dataStatus,
    systemData.powerStatus,
    systemData.lastError
  );
}
