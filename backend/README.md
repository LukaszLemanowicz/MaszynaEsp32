# Maszyna ESP32 - Backend API

Backend Node.js do komunikacji z systemem maszyny ESP32 przez REST API. Używa Express.js, SQLite i session-based autoryzacji.

## 🚀 Uruchomienie

Zobacz szczegółową instrukcję w pliku [INSTALLATION_SQLITE.md](./INSTALLATION_SQLITE.md).

**Szybki start:**
```bash
cd backend
npm install
npm start
```

Serwer będzie dostępny pod adresem: `http://localhost:3000`

**Ważne:** Baza danych SQLite jest tworzona automatycznie przy pierwszym uruchomieniu. Plik `database/app.db` zostanie utworzony automatycznie.

## 📡 API Endpoints

### Autoryzacja (publiczne)

#### `POST /api/auth/register`
Rejestracja nowego użytkownika.

**Request Body:**
```json
{
  "username": "operator1",
  "password": "haslo123",
  "deviceId": "test"
}
```

**Walidacja:**
- `username`: max 50 znaków, wymagane
- `password`: min 8 znaków, wymagane
- `deviceId`: max 100 znaków, wymagane

**Response (201):**
```json
{
  "success": true,
  "message": "Użytkownik zarejestrowany pomyślnie",
  "user": {
    "id": 1,
    "username": "operator1",
    "deviceId": "test",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Błędy:**
- `400` - Brak wymaganych pól lub nieprawidłowa walidacja
- `409` - Użytkownik o podanej nazwie już istnieje
- `500` - Błąd serwera

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
    "deviceId": "test"
  }
}
```

**Błędy:**
- `400` - Brak wymaganych pól
- `401` - Nieprawidłowe dane logowania
- `500` - Błąd serwera

#### `POST /api/auth/logout`
Wylogowanie użytkownika (wymaga autoryzacji).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Wylogowano pomyślnie"
}
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
  "deviceId": "test",
  "createdAt": "2024-01-01T12:00:00.000Z"
}
```

### Dane z ESP32 (publiczne - bez autoryzacji)

#### `POST /api/esp32/data`
ESP32 wysyła swoje dane do serwera (temperatury).

**Częstotliwość:** ESP32 wysyła dane co 1 sekundę

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

**Walidacja:**
- `deviceId`: wymagane, max 100 znaków
- `temperature1`, `temperature2`, `temperature3`: liczby (float)
- `sensorCount`: liczba całkowita

**Uwaga:** Wartość `-999.0` oznacza błąd odczytu lub brak czujnika (mapowane na `null` w bazie danych).

**Response (200):**
```json
{
  "success": true,
  "message": "Data received"
}
```

**Błędy:**
- `400` - Brak wymaganych pól lub nieprawidłowa walidacja
- `500` - Błąd serwera

#### `GET /api/esp32/commands`
ESP32 pobiera oczekujące komendy.

**Częstotliwość:** ESP32 pobiera komendy co 3 sekundy

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
- `power_on` - Włączenie maszyny (value: null)
- `power_off` - Wyłączenie maszyny (value: null)
- `servo` - Ustawienie serwa (value: 0-100)

**Błędy:**
- `400` - Brak parametru `deviceId`
- `500` - Błąd serwera

#### `POST /api/esp32/commands/ack`
ESP32 potwierdza wykonanie komendy (ACK).

**Request Body:**
```json
{
  "deviceId": "test",
  "commandId": 1234567890,
  "status": "OK"
}
```

**Walidacja:**
- `deviceId`: wymagane
- `commandId`: wymagane (liczba całkowita)
- `status`: wymagane (zwykle "OK")

**Response (200):**
```json
{
  "success": true,
  "message": "Command acknowledged"
}
```

**Błędy:**
- `400` - Brak wymaganych pól
- `404` - Komenda nie została znaleziona
- `500` - Błąd serwera

### Stan urządzenia (wymaga autoryzacji)

#### `GET /api/device-state`
Pobranie aktualnego stanu urządzenia dla zalogowanego użytkownika.

**Częstotliwość:** Frontend pobiera dane co 5 sekund (polling)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "deviceId": "test",
  "temperature1": 25.5,
  "temperature2": 30.2,
  "temperature3": null,
  "status": "online",
  "lastUpdate": "2024-01-01T12:00:00.000Z"
}
```

**Status online/offline:**
- `online` - Ostatnia aktualizacja w ciągu ostatnich 10 sekund
- `offline` - Brak aktualizacji przez więcej niż 10 sekund

**Brak danych:**
Jeśli urządzenie nie wysłało jeszcze żadnych danych, zwracany jest:
```json
{
  "deviceId": "test",
  "temperature1": null,
  "temperature2": null,
  "temperature3": null,
  "status": "offline",
  "lastUpdate": null
}
```

### Komendy sterujące (wymaga autoryzacji)

#### `POST /api/commands/power-on`
Wysłanie komendy włączenia maszyny.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (201):**
```json
{
  "success": true,
  "command": {
    "id": 1234567890,
    "deviceId": "test",
    "commandType": "power_on",
    "commandValue": null,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "acknowledged": false
  },
  "message": "Command queued successfully"
}
```

**Błędy:**
- `400` - Urządzenie jest offline
- `401` - Brak autoryzacji
- `500` - Błąd serwera

#### `POST /api/commands/power-off`
Wysłanie komendy wyłączenia maszyny.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (201):**
```json
{
  "success": true,
  "command": {
    "id": 1234567891,
    "deviceId": "test",
    "commandType": "power_off",
    "commandValue": null,
    "createdAt": "2024-01-01T12:00:05.000Z",
    "acknowledged": false
  },
  "message": "Command queued successfully"
}
```

#### `POST /api/commands/servo`
Wysłanie komendy ustawienia serwa.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "value": 75.5
}
```

**Walidacja:**
- `value`: wymagane, liczba w zakresie 0-100

**Response (201):**
```json
{
  "success": true,
  "command": {
    "id": 1234567892,
    "deviceId": "test",
    "commandType": "servo",
    "commandValue": 75.5,
    "createdAt": "2024-01-01T12:00:10.000Z",
    "acknowledged": false
  },
  "message": "Command queued successfully"
}
```

**Błędy:**
- `400` - Nieprawidłowa wartość (poza zakresem 0-100) lub urządzenie offline
- `401` - Brak autoryzacji
- `500` - Błąd serwera

#### `GET /api/commands/status/:commandId`
Sprawdzenie statusu komendy (czy została potwierdzona przez ESP32).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```
GET /api/commands/status/1234567890
```

**Response (200):**
```json
{
  "id": 1234567890,
  "deviceId": "test",
  "commandType": "power_on",
  "commandValue": null,
  "acknowledged": true,
  "acknowledgedAt": "2024-01-01T12:00:03.000Z",
  "createdAt": "2024-01-01T12:00:00.000Z"
}
```

**Błędy:**
- `400` - Nieprawidłowy ID komendy
- `404` - Komenda nie została znaleziona
- `401` - Brak autoryzacji
- `500` - Błąd serwera

### Endpointy pomocnicze

#### `GET /api/health`
Health check endpoint dla monitorowania.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "database": "connected"
}
```

#### `GET /`
Informacje o API.

**Response (200):**
```json
{
  "name": "Maszyna ESP32 Backend API",
  "version": "1.0.0",
  "status": "running"
}
```

## 🔒 Autoryzacja

Backend używa **session-based autoryzacji** z tokenami UUID:

1. **Logowanie** (`POST /api/auth/login`) zwraca token UUID
2. **Token** jest ważny przez 24 godziny
3. **Token** musi być wysyłany w headerze: `Authorization: Bearer <token>`
4. **Middleware** `requireAuth` sprawdza token i dołącza dane użytkownika do `req.user`

**Przykład użycia:**
```javascript
fetch('http://localhost:3000/api/device-state', {
  headers: {
    'Authorization': 'Bearer uuid-token-here'
  }
})
```

## 🗄️ Baza danych

Backend używa **SQLite** z następującymi tabelami:

- `users` - Użytkownicy (username, password hash, deviceId)
- `sessions` - Sesje użytkowników (token, userId, expiresAt)
- `devices` - Urządzenia (deviceId, createdAt, updatedAt)
- `device_state` - Aktualny stan urządzenia (temperatury, lastUpdate)
- `pending_commands` - Oczekujące komendy (commandType, commandValue, acknowledged)

**Szczegóły:** Zobacz [database/README.md](./database/README.md) i [database/schema.sql](./database/schema.sql)

## 🔄 Przepływ danych

1. **ESP32** wysyła dane co 1 sekundę → `POST /api/esp32/data`
2. **Backend** aktualizuje stan urządzenia w bazie danych
3. **Frontend** pobiera dane co 5 sekund → `GET /api/device-state`
4. **Frontend** wysyła komendy → `POST /api/commands/*`
5. **ESP32** pobiera komendy co 3 sekundy → `GET /api/esp32/commands`
6. **ESP32** wykonuje komendę i wysyła ACK → `POST /api/esp32/commands/ack`
7. **Frontend** sprawdza status komendy → `GET /api/commands/status/:commandId`

## 🧹 Automatyczne czyszczenie

Backend automatycznie czyści stare komendy:
- **Co 5 minut** - Usuwa komendy starsze niż 1 godzina
- **Co 5 minut** - Usuwa komendy bez ACK starsze niż 5 minut (timeout)

## 🧪 Testowanie

Testowe żądania HTTP znajdują się w pliku [test-requests.http](./test-requests.http). Możesz użyć ich w:
- VS Code z rozszerzeniem REST Client
- Insomnia
- Postman

**Przykład testowania z curl:**
```bash
# Health check
curl http://localhost:3000/api/health

# Rejestracja
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"haslo123","deviceId":"test"}'

# Logowanie
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"haslo123"}'
```

## 🐛 Rozwiązywanie problemów

### Backend nie odpowiada
- Sprawdź czy serwer jest uruchomiony (`npm start`)
- Sprawdź czy port 3000 nie jest zajęty
- Sprawdź logi w konsoli

### Błąd bazy danych
- Sprawdź czy plik `database/app.db` istnieje (tworzony automatycznie)
- Sprawdź uprawnienia do zapisu w folderze `database/`
- Zobacz [INSTALLATION_SQLITE.md](./INSTALLATION_SQLITE.md) dla szczegółów

### Komendy nie są wykonywane
- Sprawdź czy urządzenie jest online (`status: "online"`)
- Sprawdź czy ESP32 regularnie pobiera komendy (`GET /api/esp32/commands`)
- Sprawdź logi w konsoli backendu

### Problem z autoryzacją
- Sprawdź czy token jest ważny (24h)
- Sprawdź format headeru: `Authorization: Bearer <token>`
- Sprawdź czy użytkownik istnieje w bazie danych

## 📁 Struktura projektu

```
backend/
├── server.js                    # Główny plik serwera z endpointami
├── package.json                 # Zależności Node.js
├── database/
│   ├── db.js                   # Konfiguracja SQLite i inicjalizacja tabel
│   ├── schema.sql              # Dokumentacja schematu bazy danych
│   ├── app.db                  # Plik bazy danych SQLite (tworzony automatycznie)
│   └── README.md               # Dokumentacja bazy danych
├── services/
│   ├── auth.service.js         # Serwis autoryzacji
│   ├── device-state.service.js # Serwis stanu urządzenia
│   └── command.service.js      # Serwis komend
├── middleware/
│   └── auth.middleware.js      # Middleware autoryzacji
├── test-requests.http          # Testowe żądania HTTP
└── README.md                   # Ten plik
```

## 📚 Powiązane dokumenty

- [INSTALLATION_SQLITE.md](./INSTALLATION_SQLITE.md) - Instalacja i konfiguracja SQLite
- [BACKEND_IMPLEMENTATION_COMPLETE.md](./BACKEND_IMPLEMENTATION_COMPLETE.md) - Podsumowanie implementacji
- [database/README.md](./database/README.md) - Dokumentacja bazy danych
- [../esp32/README.md](../esp32/README.md) - Dokumentacja firmware ESP32
- [../frontend/README.md](../frontend/README.md) - Dokumentacja frontendu

## 📄 Licencja

MIT
