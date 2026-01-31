# Maszyna ESP32 - System Zdalnego Monitorowania i Sterowania Maszyną

System zdalnego monitorowania i sterowania maszyną przemysłową z wykorzystaniem ESP32, backend API (Node.js) i frontend webowy (Angular).

## 📋 Przegląd projektu

System umożliwia operatorowi zdalny podgląd trzech temperatur oraz podstawowe sterowanie (ON/OFF i serwo) z poziomu przeglądarki. MVP obejmuje:

- ✅ Rejestracja i logowanie użytkownika (jedna rola: operator)
- ✅ Podgląd 3 temperatur w czasie rzeczywistym (polling co 5s)
- ✅ Status online/offline maszyny
- ✅ Sterowanie ON/OFF maszyną
- ✅ Sterowanie serwem (zakres 0-100)
- ✅ Potwierdzenie wykonania komend (ACK "OK")
- ✅ Blokada sterowania w trybie offline
- ✅ Wyświetlanie czasu ostatniej aktualizacji

## 📁 Struktura projektu

Projekt jest zorganizowany jako **monorepo** z trzema głównymi komponentami:

```
MaszynaESP32/
├── esp32/          # Firmware dla ESP32 (PlatformIO/Arduino)
│   ├── src/        # Kod źródłowy firmware
│   ├── platformio.ini
│   └── README.md   # Dokumentacja firmware
├── backend/        # Backend API (Node.js/Express)
│   ├── server.js   # Główny plik serwera
│   ├── database/   # Baza danych SQLite
│   ├── services/   # Serwisy biznesowe
│   ├── middleware/ # Middleware (autoryzacja)
│   └── README.md   # Dokumentacja API
└── frontend/       # Frontend webowy (Angular + TypeScript)
    ├── src/        # Kod źródłowy Angular
    └── README.md   # Dokumentacja frontendu
```

## 🚀 Szybki start

### Wymagania wstępne

- **Node.js** (v18+) - dla backendu i frontendu
- **PlatformIO** - dla firmware ESP32 (IDE lub rozszerzenie VS Code)
- **ESP32 DevKit** - urządzenie sprzętowe
- **SQLite** - baza danych (instalowana automatycznie)

### 1. Backend

```bash
cd backend
npm install
npm start
```

Serwer będzie dostępny pod adresem: `http://localhost:3000`

**Ważne:** Baza danych SQLite jest tworzona automatycznie przy pierwszym uruchomieniu. Zobacz [backend/INSTALLATION_SQLITE.md](./backend/INSTALLATION_SQLITE.md) dla szczegółów.

### 2. Frontend

```bash
cd frontend
npm install
ng serve
```

Aplikacja będzie dostępna pod adresem: `http://localhost:4200`

### 3. ESP32 (Firmware)

```bash
cd esp32
# Otwórz projekt w PlatformIO IDE lub VS Code z rozszerzeniem PlatformIO
pio run --target upload
```

**Przed wgraniem firmware:**
1. Skonfiguruj WiFi i adres serwera w `esp32/src/main.cpp` (linie 16-19)
2. Skonfiguruj port COM w `esp32/platformio.ini`

Zobacz [esp32/README.md](./esp32/README.md) dla szczegółowych instrukcji.

## 🔌 Architektura komunikacji

```
ESP32 → Backend → Frontend
  ↑         ↓
  └─────────┘
  (komendy)
```

### Przepływ danych

1. **ESP32** cyklicznie wysyła dane (temperatury) do backendu co 1 sekundę
2. **Backend** przechowuje aktualny stan w bazie danych SQLite
3. **Frontend** pobiera dane przez polling co 5 sekund
4. **Frontend** wysyła komendy do backendu (ON/OFF, serwo)
5. **ESP32** pobiera komendy z backendu co 3 sekundy i potwierdza wykonanie (ACK)

### Endpointy API

**ESP32 → Backend:**
- `POST /api/esp32/data` - Wysyłanie danych (co 1s)
- `GET /api/esp32/commands` - Pobieranie komend (co 3s)
- `POST /api/esp32/commands/ack` - Potwierdzenie komendy

**Frontend → Backend:**
- `POST /api/auth/register` - Rejestracja
- `POST /api/auth/login` - Logowanie
- `GET /api/device-state` - Pobranie stanu urządzenia (polling co 5s)
- `POST /api/commands/power-on` - Włączenie maszyny
- `POST /api/commands/power-off` - Wyłączenie maszyny
- `POST /api/commands/servo` - Ustawienie serwa (0-100)

Pełna dokumentacja API: [backend/README.md](./backend/README.md)

## 📚 Dokumentacja

### Główne dokumenty

- **[MVP.md](./MVP.md)** - Zakres MVP i kryteria sukcesu
- **[prd.md](./prd.md)** - Dokument wymagań produktu (PRD)
- **[agents.md](./agents.md)** - Dokumentacja projektu dla AI (kontekst, architektura, konwencje)

### Dokumentacja komponentów

- **ESP32**: [esp32/README.md](./esp32/README.md) - Dokumentacja firmware
- **Backend**: [backend/README.md](./backend/README.md) - Dokumentacja API
- **Frontend**: [frontend/README.md](./frontend/README.md) - Dokumentacja frontendu

### Dodatkowe dokumenty

- [backend/INSTALLATION_SQLITE.md](./backend/INSTALLATION_SQLITE.md) - Instalacja i konfiguracja SQLite
- [esp32/WIRING_OLED.md](./esp32/WIRING_OLED.md) - Instrukcje podłączenia wyświetlacza OLED

## 🔧 Technologie

### ESP32 (Firmware)
- **Platform**: PlatformIO
- **Framework**: Arduino
- **Board**: ESP32 DevKit
- **Biblioteki**: Adafruit SSD1306, ArduinoJson, DallasTemperature, OneWire, ESP32Servo

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Baza danych**: SQLite
- **Autoryzacja**: Session-based (UUID tokens)

### Frontend
- **Framework**: Angular + TypeScript
- **Design**: Mobile-first, minimalistyczny
- **Komunikacja**: HTTP polling (co 5s)

## 🧪 Testowanie

### Backend

Testowe żądania HTTP znajdują się w pliku `backend/test-requests.http`. Możesz użyć ich w VS Code z rozszerzeniem REST Client lub w Insomnia/Postman.

### Frontend

```bash
cd frontend
ng test
```

### ESP32

Monitor szeregowy w PlatformIO:
```bash
cd esp32
pio device monitor
```

## 🐛 Rozwiązywanie problemów

### Backend nie odpowiada
- Sprawdź czy serwer jest uruchomiony (`npm start` w folderze `backend`)
- Sprawdź czy port 3000 nie jest zajęty
- Sprawdź logi w konsoli

### ESP32 nie łączy się z WiFi
- Sprawdź SSID i hasło w `esp32/src/main.cpp`
- Sprawdź czy router obsługuje 2.4 GHz (ESP32 nie obsługuje 5 GHz)
- Zobacz [esp32/README.md](./esp32/README.md) dla szczegółów

### ESP32 nie może połączyć się z backendem
- Sprawdź `serverUrl` w `esp32/src/main.cpp` (IP komputera z backendem)
- Sprawdź czy ESP32 i komputer są w tej samej sieci WiFi
- Sprawdź czy port 3000 nie jest zablokowany przez firewall

### Frontend nie łączy się z backendem
- Sprawdź konfigurację API w `frontend/src/app/core/config/api.config.ts`
- Sprawdź czy backend działa (`http://localhost:3000/api/health`)

## 📝 Status implementacji

### ✅ Zaimplementowane

- [x] Firmware ESP32 (odczyt temperatur, sterowanie, komunikacja)
- [x] Backend API (autoryzacja, stan urządzenia, komendy)
- [x] Baza danych SQLite (użytkownicy, sesje, stan urządzenia, komendy)
- [x] Frontend Angular (logowanie, dashboard, sterowanie)
- [x] System komend z potwierdzeniami ACK
- [x] Status online/offline urządzenia

### 🔄 W trakcie / Do ulepszenia

- [ ] Testy jednostkowe i E2E
- [ ] Optymalizacja wydajności
- [ ] Dokumentacja API (Swagger/OpenAPI)

### ❌ Poza zakresem MVP

- Historia odczytów i archiwizacja
- Alarmy i powiadomienia
- Wiele maszyn i wiele ról użytkowników
- Zaawansowane bezpieczeństwo (reset hasła, SSO, MFA)
- Aplikacja mobilna

## 📄 Licencja

MIT

## 👥 Autorzy

Projekt jest częścią systemu zdalnego monitorowania maszyny przemysłowej (MVP).
