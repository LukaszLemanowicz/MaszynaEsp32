# Maszyna ESP32 - Backend API

Backend Node.js do komunikacji z systemem maszyny ESP32 przez REST API.

## 🚀 Uruchomienie

Zobacz szczegółową instrukcję w pliku [INSTALLATION.md](./INSTALLATION.md).

**Szybki start:**
```bash
cd backend
npm install
# Baza danych SQLite jest tworzona automatycznie (zobacz INSTALLATION_SQLITE.md)
# Utwórz plik .env z konfiguracją
npm start
```

Serwer będzie dostępny pod adresem: `http://localhost:3000`

## 📡 API Endpoints

### Autoryzacja

#### `POST /api/auth/register`
Rejestracja nowego użytkownika.

**Request Body:**
```json
{
  "username": "operator1",
  "password": "haslo123",
  "deviceId": "ESP32_001"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Użytkownik zarejestrowany pomyślnie",
  "user": {
    "id": 1,
    "username": "operator1",
    "deviceId": "ESP32_001",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

#### `POST /api/auth/login`
Logowanie użytkownika.

**Request Body:**
```json
{
  "username": "operator1",
  "password": "haslo123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "uuid-token-here",
  "expiresAt": "2024-01-02T12:00:00.000Z",
  "user": {
    "id": 1,
    "username": "operator1",
    "deviceId": "ESP32_001"
  }
}
```

#### `POST /api/auth/logout`
Wylogowanie użytkownika (wymaga autoryzacji).

**Headers:**
```
Authorization: Bearer <token>
```

#### `GET /api/auth/me`
Pobranie danych aktualnie zalogowanego użytkownika (wymaga autoryzacji).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "username": "operator1",
  "deviceId": "ESP32_001",
  "createdAt": "2024-01-01T12:00:00.000Z"
}
```

### Dane z ESP32

### Dane z ESP32

#### `POST /api/esp32/data`
ESP32 wysyła swoje dane do serwera.

**Request Body:**
```json
{
  "temperature": 25.5,
  "humidity": 60.0,
  "pressure": 1013.2,
  "status": "online",
  "processProgress": 45,
  "isRunning": true
}
```

#### `GET /api/esp32/commands`
ESP32 pobiera oczekujące komendy.

**Response:**
```json
{
  "commands": [
    {
      "id": "1234567890",
      "type": "setTemperature",
      "value": 80.0,
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

#### `POST /api/esp32/command/confirm`
ESP32 potwierdza wykonanie komendy.

**Request Body:**
```json
{
  "commandId": "1234567890"
}
```

### Komendy do ESP32

#### `POST /api/command/temperature`
Ustaw temperaturę docelową.

**Request Body:**
```json
{
  "temperature": 80.0
}
```

#### `POST /api/command/process`
Start/Stop procesu.

**Request Body:**
```json
{
  "action": "start"  // lub "stop"
}
```

#### `POST /api/command/reset`
Reset systemu.

**Request Body:**
```json
{}
```

### Odczyt danych

#### `GET /api/data`
Pobierz aktualne dane z ESP32.

**Response:**
```json
{
  "temperature": 25.5,
  "humidity": 60.0,
  "pressure": 1013.2,
  "status": "online",
  "processProgress": 45,
  "isRunning": true,
  "targetTemperature": 80.0,
  "lastUpdate": "2024-01-01T12:00:00.000Z"
}
```

#### `GET /api/test`
Test połączenia z serwerem.

## 🔧 Konfiguracja ESP32

W pliku `src/main.cpp` zmień następujące ustawienia:

```cpp
const char* ssid = "TWOJA_NAZWA_WIFI";
const char* password = "TWOJE_HASLO_WIFI";
const char* serverUrl = "http://192.168.1.100:3000"; // IP komputera z backendem
```

## 📱 Testowanie z Insomnia/Postman

### 1. Ustaw temperaturę docelową
```
POST http://localhost:3000/api/command/temperature
Content-Type: application/json

{
  "temperature": 75.0
}
```

### 2. Rozpocznij proces
```
POST http://localhost:3000/api/command/process
Content-Type: application/json

{
  "action": "start"
}
```

### 3. Sprawdź dane z ESP32
```
GET http://localhost:3000/api/data
```

### 4. Zatrzymaj proces
```
POST http://localhost:3000/api/command/process
Content-Type: application/json

{
  "action": "stop"
}
```

## 🔄 Jak to działa

1. **ESP32** łączy się z WiFi
2. **ESP32** co 5 sekund wysyła dane do backendu (`POST /api/esp32/data`)
3. **ESP32** co 2 sekundy sprawdza komendy (`GET /api/esp32/commands`)
4. **Frontend/Insomnia** może wysyłać komendy do ESP32 przez API
5. **Backend** przechowuje dane i komendy, przekazuje je między systemami

## 🛠️ Struktura projektu

```
backend/
├── server.js          # Główny plik serwera
├── package.json       # Zależności Node.js
└── README.md         # Ta dokumentacja
```

## 🐛 Rozwiązywanie problemów

1. **ESP32 nie łączy się z WiFi** - sprawdź nazwę i hasło WiFi
2. **ESP32 nie może połączyć się z backendem** - sprawdź IP komputera w `serverUrl`
3. **Backend nie odpowiada** - sprawdź czy serwer jest uruchomiony (`npm start`)
4. **Komendy nie docierają** - sprawdź czy ESP32 regularnie pobiera komendy

## 📊 Monitoring

Backend loguje wszystkie operacje w konsoli:
- 📡 Otrzymane dane z ESP32
- 🌡️ Wysłane komendy temperatury
- 🔄 Komendy start/stop procesu
- ✅ Potwierdzenia wykonania komend
