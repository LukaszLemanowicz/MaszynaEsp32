#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "OLEDDisplay.h"

#define LED_PIN 2   // wbudowana dioda na ESP32

// Konfiguracja WiFi
const char* ssid = "PLAY_Swiatlowodowy_572B";
const char* password = "pz9zfVmGaN";
const char* serverUrl = "http://192.168.0.70:4200";

// Instancje
OLEDDisplay oled;

// Dane systemu
struct SystemData {
  float temperature = 0.0;  // Wysyłane na backend
  float power = 0.0;        // Pobierane z backendu
  unsigned long lastDataSend = 0;
  unsigned long lastCommandCheck = 0;
  
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
  if (millis() - systemData.lastDataSend > 5000) {
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
  // Symuluj odczyt temperatury (w rzeczywistym projekcie tu będzie prawdziwy odczyt)
  systemData.temperature = 20.0 + random(0, 100) * 0.1; // 20-30°C
}

// Funkcje HTTP
void sendDataToServer() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  http.begin(serverUrl + String("/api/esp32/data"));
  http.addHeader("Content-Type", "application/json");
  
  // Przygotuj dane JSON - tylko temperatura
  DynamicJsonDocument doc(256);
  doc["temperature"] = systemData.temperature;
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
    systemData.temperature, 
    systemData.power,
    systemData.wifiStatus,
    systemData.dataStatus,
    systemData.powerStatus,
    systemData.lastError
  );
}
