# Firmware ESP32 - System Zdalnego Monitorowania i Sterowania Maszyną

## 📋 Przegląd

Firmware dla ESP32 DevKit, który:
- Odczytuje 3 temperatury z czujników DS18B20 (OneWire)
- Wyświetla informacje na ekranie OLED SSD1306 128x64
- Komunikuje się z backendem przez WiFi (HTTP REST API)
- Wysyła dane co 1 sekundę
- Pobiera komendy co 3 sekundy
- Wykonuje komendy sterujące (ON/OFF, serwo)
- Wysyła potwierdzenia ACK po wykonaniu komend

## 🔧 Wymagania sprzętowe

### Komponenty
- **ESP32 DevKit** (lub kompatybilny)
- **3x czujnik temperatury DS18B20** (OneWire)
- **Wyświetlacz OLED SSD1306 128x64** (I2C)
- **Serwo** (dla sterowania przełącznikiem maszyny)
- **Rezystor 4.7kΩ** (pull-up dla OneWire)
- **Przewody połączeniowe**

### Piny GPIO

| Komponent | Pin ESP32 | Opis |
|-----------|-----------|------|
| DS18B20 (OneWire) | GPIO 4 | Linia danych OneWire |
| OLED SCL | GPIO 22 | I2C Clock |
| OLED SDA | GPIO 21 | I2C Data |
| POWER_PIN | GPIO 5 | Sterowanie ON/OFF maszyny |
| SERVO_PIN | GPIO 18 | Sterowanie serwem (PWM) |
| LED | GPIO 2 | Wbudowana dioda (opcjonalna) |

**Uwaga:** Szczegółowe instrukcje podłączenia OLED znajdują się w pliku [WIRING_OLED.md](./WIRING_OLED.md).

## 📦 Zależności

Firmware używa następujących bibliotek (zdefiniowane w `platformio.ini`):

- `adafruit/Adafruit SSD1306@^2.5.7` - Wyświetlacz OLED
- `adafruit/Adafruit GFX Library@^1.11.5` - Grafika dla OLED
- `bblanchon/ArduinoJson@^6.21.3` - Parsowanie JSON
- `milesburton/DallasTemperature@^3.9.0` - Czujniki DS18B20
- `paulstoffregen/OneWire@^2.3.7` - Protokół OneWire
- `madhephaestus/ESP32Servo@^3.0.5` - Sterowanie serwem

## ⚙️ Konfiguracja

### 1. Konfiguracja WiFi i serwera

Edytuj plik `src/main.cpp` i zmień następujące wartości:

```cpp
// Linie 16-19
const char* ssid = "TWOJA_NAZWA_WIFI";
const char* password = "TWOJE_HASLO_WIFI";
const char* serverUrl = "http://192.168.0.179:3000";  // IP komputera z backendem
const char* deviceId = "test";  // Unikalny identyfikator urządzenia
```

**Ważne:**
- `serverUrl` - IP komputera z uruchomionym backendem (sprawdź przez `ipconfig` w Windows lub `ifconfig` w Linux)
- `deviceId` - Musi być zgodny z `deviceId` używanym podczas rejestracji użytkownika w backendzie

### 2. Konfiguracja portu COM (PlatformIO)

W pliku `platformio.ini` zmień port COM na właściwy dla Twojego ESP32:

```ini
[env:esp32dev]
upload_port = COM3    # Zmień na właściwy port
monitor_port = COM3   # Zmień na właściwy port
```

## 🏗️ Struktura kodu

```
esp32/
├── src/
│   ├── main.cpp           # Główny plik firmware
│   ├── OLEDDisplay.h      # Header klasy wyświetlacza
│   └── OLEDDisplay.cpp    # Implementacja klasy wyświetlacza
├── platformio.ini         # Konfiguracja PlatformIO
├── WIRING_OLED.md         # Instrukcje podłączenia OLED
└── README.md              # Ten plik
```

### Główne komponenty kodu

#### `main.cpp`
- **`setup()`** - Inicjalizacja wszystkich komponentów (WiFi, czujniki, OLED, serwo)
- **`loop()`** - Główna pętla:
  - Wysyłanie danych co 1 sekundę
  - Pobieranie komend co 3 sekundy
  - Aktualizacja wyświetlacza
- **`connectToWiFi()`** - Połączenie z WiFi (automatyczne ponawianie)
- **`updateSensorData()`** - Odczyt temperatur z DS18B20
- **`sendDataToServer()`** - Wysyłanie danych do backendu
- **`checkForCommands()`** - Pobieranie komend z backendu
- **`executeCommand()`** - Wykonanie komendy (power_on, power_off, servo)
- **`sendAck()`** - Wysyłanie potwierdzenia wykonania komendy

#### `OLEDDisplay` (klasa)
- **`begin()`** - Inicjalizacja wyświetlacza
- **`showWelcomeMessage()`** - Komunikat powitalny
- **`showSystemInfo()`** - Wyświetlanie pełnych informacji o systemie

## 🔌 API komunikacji z backendem

### 1. Wysyłanie danych (`POST /api/esp32/data`)

**Częstotliwość:** Co 1 sekundę

**Request Body:**
```json
{
  "deviceId": "test",
  "temperature1": 25.5,
  "temperature2": 30.2,
  "temperature3": -999.0,
  "sensorCount": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Data received"
}
```

**Obsługa błędów:**
- Wartość `-999.0` oznacza błąd odczytu lub brak czujnika
- Jeśli `sensorCount == 0`, system symuluje dane (temperatura1=1, temperature2=1, temperature3=-999.0)

### 2. Pobieranie komend (`GET /api/esp32/commands`)

**Częstotliwość:** Co 3 sekundy

**Request:**
```
GET /api/esp32/commands?deviceId=test
```

**Response (200):**
```json
{
  "commands": [
    {
      "id": 1234567890,
      "type": "power_on",
      "value": null,
      "createdAt": "2024-01-01T12:00:00.000Z"
    },
    {
      "id": 1234567891,
      "type": "servo",
      "value": 75.5,
      "createdAt": "2024-01-01T12:00:05.000Z"
    }
  ]
}
```

**Typy komend:**
- `power_on` - Włączenie maszyny (GPIO 5 → HIGH)
- `power_off` - Wyłączenie maszyny (GPIO 5 → LOW)
- `servo` - Ustawienie serwa (wartość 0-100 mapowana na kąt 0-180°)

### 3. Potwierdzenie komendy (`POST /api/esp32/commands/ack`)

**Częstotliwość:** Natychmiast po wykonaniu komendy

**Request Body:**
```json
{
  "deviceId": "test",
  "commandId": 1234567890,
  "status": "OK"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Command acknowledged"
}
```

## 🚀 Kompilacja i wgrywanie

### Wymagania
- **PlatformIO** (IDE lub rozszerzenie VS Code)
- **Kabel USB** do połączenia ESP32 z komputerem

### Kroki

1. **Otwórz projekt w PlatformIO:**
   ```bash
   cd esp32
   # W VS Code: Otwórz folder esp32
   ```

2. **Zainstaluj zależności:**
   ```bash
   pio lib install
   ```
   (PlatformIO zainstaluje automatycznie biblioteki z `platformio.ini`)

3. **Skonfiguruj WiFi i serwer:**
   - Edytuj `src/main.cpp` (linie 16-19)
   - Zmień `ssid`, `password`, `serverUrl`, `deviceId`

4. **Skonfiguruj port COM:**
   - Edytuj `platformio.ini`
   - Zmień `upload_port` i `monitor_port` na właściwy port

5. **Skompiluj i wgraj:**
   ```bash
   pio run --target upload
   ```

6. **Otwórz monitor szeregowy:**
   ```bash
   pio device monitor
   ```
   (lub użyj przycisku "Serial Monitor" w PlatformIO IDE)

### Weryfikacja działania

Po wgraniu firmware, w monitorze szeregowym powinieneś zobaczyć:

```
🔍 Znaleziono 2 czujników DS18B20
✅ Wyświetlacz OLED zainicjalizowany!
🚀 System gotowy! Device ID: test
🌡️ T1: 25.5°C, T2: 30.2°C, T3: -999.0°C
📥 Otrzymano komendę: power_on (ID: 1234567890)
✅ Włączono maszynę
✅ Wysłano ACK dla komendy ID: 1234567890
```

## 📊 Wyświetlacz OLED

Wyświetlacz pokazuje następujące informacje:

```
T1:25.5 T2:30.2 T3:ERR    <- Temperatury
P:ON S:75%                 <- Stan maszyny (Power, Servo)
WiFi: 192.168.0.100       <- Status WiFi/IP
D:OK (200) C:OK (1)       <- Status danych i komend
ON                         <- Ostatnia wykonana komenda
```

**Format wyświetlania:**
- **Linia 1:** Temperatury (T1, T2, T3) - "ERR" jeśli błąd odczytu
- **Linia 2:** Stan maszyny (P: ON/OFF, S: wartość serwa w %)
- **Linia 3:** Status WiFi (IP lub komunikat błędu)
- **Linia 4:** Status danych (D:) i komend (C:)
- **Linia 5:** Ostatnia komenda lub błąd

## 🔍 Rozwiązywanie problemów

### Problem: ESP32 nie łączy się z WiFi

**Rozwiązanie:**
1. Sprawdź SSID i hasło w `main.cpp` (linie 16-17)
2. Sprawdź czy router obsługuje 2.4 GHz (ESP32 nie obsługuje 5 GHz)
3. Sprawdź odległość od routera
4. W monitorze szeregowym zobaczysz komunikaty o próbach połączenia

### Problem: ESP32 nie może połączyć się z backendem

**Rozwiązanie:**
1. Sprawdź `serverUrl` w `main.cpp` (linia 19)
2. Sprawdź IP komputera z backendem (`ipconfig` w Windows)
3. Upewnij się, że backend działa (`npm start` w folderze `backend`)
4. Sprawdź czy port 3000 nie jest zablokowany przez firewall
5. Upewnij się, że ESP32 i komputer są w tej samej sieci WiFi

### Problem: Brak odczytów temperatury

**Rozwiązanie:**
1. Sprawdź połączenie czujników DS18B20:
   - Pin GPIO 4 → linia danych
   - Rezystor 4.7kΩ między linią danych a 3.3V
   - GND → masa
   - VCC → 3.3V (lub 5V dla niektórych wersji)
2. Sprawdź w monitorze szeregowym: `🔍 Znaleziono X czujników DS18B20`
3. Jeśli `sensorCount == 0`, sprawdź połączenia i rezystor pull-up

### Problem: Czarny ekran OLED

**Rozwiązanie:**
1. Sprawdź połączenia (VCC→3.3V, GND→GND, SCL→GPIO22, SDA→GPIO21)
2. Sprawdź w monitorze szeregowym: `✅ Wyświetlacz OLED zainicjalizowany!`
3. Jeśli widzisz błąd, sprawdź adres I2C (domyślnie 0x3C)
4. Upewnij się, że wyświetlacz jest zasilany 3.3V (nie 5V!)

### Problem: Komendy nie są wykonywane

**Rozwiązanie:**
1. Sprawdź w monitorze szeregowym czy ESP32 pobiera komendy: `📥 Otrzymano komendę: ...`
2. Sprawdź czy `deviceId` w ESP32 jest zgodny z `deviceId` użytkownika w backendzie
3. Sprawdź czy backend zwraca komendy: `GET /api/esp32/commands?deviceId=test`
4. Sprawdź czy ACK jest wysyłane: `✅ Wysłano ACK dla komendy ID: ...`

### Problem: Serwo nie reaguje

**Rozwiązanie:**
1. Sprawdź połączenie serwa (GPIO 18, zasilanie, masa)
2. Sprawdź w monitorze szeregowym: `✅ Ustawiono serwo na X% (kąt: Y°)`
3. Upewnij się, że wartość komendy jest w zakresie 0-100
4. Sprawdź czy serwo jest zasilane (często wymaga zewnętrznego zasilania)

## 📝 Uwagi implementacyjne

### Obsługa błędów czujników
- Wartość `-999.0` oznacza błąd odczytu lub brak czujnika
- Jeśli `sensorCount == 0`, system symuluje dane dla testów
- Backend mapuje `-999.0` na `null` w bazie danych

### Status online/offline
- Backend uznaje urządzenie za offline, jeśli brak aktualizacji przez 10 sekund
- ESP32 wysyła dane co 1 sekundę, więc urządzenie powinno być zawsze online (jeśli WiFi działa)

### Kolejka komend
- Backend przechowuje komendy w kolejce FIFO
- ESP32 pobiera wszystkie oczekujące komendy co 3 sekundy
- Komendy są usuwane z kolejki po otrzymaniu ACK
- Komendy bez ACK są automatycznie usuwane po 5 minutach

### Mapowanie serwa
- Wartość komendy: 0-100 (procent)
- Kąt serwa: 0-180° (mapowane przez `map()`)
- Formuła: `servoAngle = map(value, 0, 100, 0, 180)`

## 🔗 Powiązane dokumenty

- [WIRING_OLED.md](./WIRING_OLED.md) - Instrukcje podłączenia wyświetlacza OLED
- [../backend/README.md](../backend/README.md) - Dokumentacja API backendu
- [../agents.md](../agents.md) - Ogólna dokumentacja projektu

## 📄 Licencja

Projekt jest częścią systemu zdalnego monitorowania maszyny przemysłowej (MVP).
