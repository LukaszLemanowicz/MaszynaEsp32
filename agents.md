# Agents.md - Dokumentacja projektu dla AI

> Ten plik koncentruje całą wiedzę o projekcie, aby Cursor i inne narzędzia AI mogły lepiej zrozumieć kontekst, architekturę i niepisane zasady projektu.

## 📋 Spis treści

1. [Przegląd projektu](#przegląd-projektu)
2. [Architektura systemu](#architektura-systemu)
3. [Technologie i zależności](#technologie-i-zależności)
4. [Wzorce komunikacji](#wzorce-komunikacji)
5. [Standardy kodowania](#standardy-kodowania)
6. [Struktura projektu](#struktura-projektu)
7. [Ważne decyzje projektowe](#ważne-decyzje-projektowe)
8. [Konwencje i zasady](#konwencje-i-zasady)
9. [Dokumentacja dodatkowa](#dokumentacja-dodatkowa)

---

## Przegląd projektu

### Cel projektu
System zdalnego monitorowania i sterowania maszyną przemysłową z wykorzystaniem ESP32. MVP umożliwia operatorowi zdalny podgląd trzech temperatur oraz podstawowe sterowanie (ON/OFF i serwo) z poziomu przeglądarki.

### Problem biznesowy
Operator musi być fizycznie przy maszynie 24/7, aby monitorować temperatury i reagować na potrzeby sterowania. System rozwiązuje problem poprzez:
- Zdalny podgląd stanu maszyny w czasie rzeczywistym
- Zdalne sterowanie podstawowymi funkcjami
- Redukcję kosztów operacyjnych (brak potrzeby stałej obecności)
- Zwiększenie elastyczności pracy

### Zakres MVP
- ✅ Rejestracja i logowanie użytkownika (jedna rola: operator)
- ✅ Podgląd 3 temperatur w czasie rzeczywistym (polling co 5s)
- ✅ Status online/offline maszyny
- ✅ Sterowanie ON/OFF maszyną
- ✅ Sterowanie serwem (zakres 0-100)
- ✅ Potwierdzenie wykonania komend (ACK "OK")
- ✅ Blokada sterowania w trybie offline
- ✅ Wyświetlanie czasu ostatniej aktualizacji

### Poza zakresem MVP
- ❌ Historia odczytów i archiwizacja
- ❌ Alarmy i powiadomienia
- ❌ Wiele maszyn i wiele ról użytkowników
- ❌ Zaawansowane bezpieczeństwo (reset hasła, SSO, MFA)
- ❌ Skalowanie i wysokodostępna infrastruktura
- ❌ Aplikacja mobilna

**Dokumentacja wymagań:** Zobacz `prd.md` dla pełnych wymagań funkcjonalnych i `MVP.md` dla zakresu MVP.

---

## Architektura systemu

Projekt jest zorganizowany jako **monorepo** z trzema głównymi komponentami:

```
MaszynaESP32/
├── esp32/          # Firmware dla ESP32 (PlatformIO/Arduino)
├── backend/        # Backend API (Node.js/Express)
└── frontend/       # Frontend webowy (Angular + TypeScript) - DO ZAIMPLEMENTOWANIA
```

### Przepływ danych

```
ESP32 → Backend → Frontend
  ↑         ↓
  └─────────┘
  (komendy)
```

1. **ESP32** cyklicznie wysyła dane (temperatury) do backendu
2. **Backend** przechowuje aktualny stan i komendy
3. **Frontend** pobiera dane przez polling co 5s
4. **Frontend** wysyła komendy do backendu
5. **ESP32** pobiera komendy z backendu i potwierdza wykonanie (ACK)

### Model komunikacji

- **ESP32 → Backend**: `POST /api/esp32/data` (co 1 sekundę)
- **ESP32 ← Backend**: `GET /api/esp32/power` (co 3 sekundy)
- **Frontend → Backend**: `GET /api/data` (polling co 5s)
- **Frontend → Backend**: `POST /api/power` (ustawienie mocy)
- **Frontend → Backend**: Komendy sterujące (do zaimplementowania)

---

## Technologie i zależności

### ESP32 (Firmware)
- **Platform**: PlatformIO
- **Framework**: Arduino
- **Board**: ESP32 DevKit
- **Biblioteki**:
  - `Adafruit SSD1306` (v2.5.7) - wyświetlacz OLED
  - `Adafruit GFX Library` (v1.11.5) - grafika
  - `ArduinoJson` (v6.21.3) - parsowanie JSON
  - `DallasTemperature` (v3.9.0) - czujniki DS18B20
  - `OneWire` (v2.3.7) - protokół OneWire

**Konfiguracja:** `esp32/platformio.ini`

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (v5.1.0)
- **Middleware**:
  - `cors` (v2.8.5) - Cross-Origin Resource Sharing
  - `body-parser` (v2.2.0) - parsowanie request body
- **Dev Tools**: `nodemon` (v3.0.0) - auto-reload

**Konfiguracja:** `backend/package.json`

### Frontend (planowane)
- **Framework**: Angular + TypeScript
- **Komunikacja**: HTTP polling co 5s
- **UI**: Mobile-first, minimalistyczny, jeden ekran główny

**Status**: Frontend nie jest jeszcze zaimplementowany - patrz `frontend/README.md`

### Baza danych (planowane)
- **DBMS**: SQLite
- **Model**: Tylko aktualny stan (brak historii w MVP)
- **Tabele**: Użytkownicy powiązani z `deviceId`, aktualne odczyty

**Status**: Baza danych nie jest jeszcze zaimplementowana

---

## Wzorce komunikacji

### ESP32 → Backend

#### Wysyłanie danych (`POST /api/esp32/data`)
```json
{
  "temperature1": 25.5,
  "temperature2": 30.2,
  "sensorCount": 2,
  "status": "online"
}
```

**Częstotliwość**: Co 1 sekundę (zdefiniowane w `main.cpp`)

#### Pobieranie mocy (`GET /api/esp32/power`)
**Response:**
```json
{
  "power": 75.0
}
```

**Częstotliwość**: Co 3 sekundy

### Backend → Frontend

#### Pobieranie danych (`GET /api/data`)
**Response:**
```json
{
  "temperature": 0,  // TODO: zmienić na temperature1, temperature2, temperature3
  "status": "offline",
  "lastUpdate": "2024-01-01T12:00:00.000Z"
}
```

**Częstotliwość**: Polling co 5s (zdefiniowane w PRD)

#### Ustawienie mocy (`POST /api/power`)
**Request:**
```json
{
  "power": 75.0
}
```

**Walidacja**: 0-1000W

### Status online/offline

**Definicja**: Urządzenie jest uznawane za offline, gdy brak aktualizacji danych przez określony timeout (do doprecyzowania w implementacji).

**Zachowanie**:
- ESP32 ponawia połączenie WiFi bez limitu
- UI blokuje sterowanie gdy status = offline
- UI wyświetla informację o braku łączności

---

## Standardy kodowania

### ESP32 (C++/Arduino)

#### Konwencje nazewnictwa
- **Zmienne**: `camelCase` (np. `systemData`, `lastDataSend`)
- **Funkcje**: `camelCase` (np. `connectToWiFi()`, `updateSensorData()`)
- **Klasy**: `PascalCase` (np. `OLEDDisplay`)
- **Stałe**: `UPPER_SNAKE_CASE` (np. `LED_PIN`, `ONE_WIRE_BUS`)
- **Piny GPIO**: Definiowane jako `#define` na początku pliku

#### Struktura kodu
- **Plik główny**: `esp32/src/main.cpp`
  - `setup()` - inicjalizacja
  - `loop()` - główna pętla
  - Funkcje pomocnicze na końcu
- **Klasy**: Oddzielne pliki `.h` i `.cpp` (np. `OLEDDisplay.h`, `OLEDDisplay.cpp`)

#### Obsługa błędów
- Czujniki: Wartość `-999.0` oznacza błąd odczytu
- WiFi: Status przechowywany w `systemData.wifiStatus`
- HTTP: Kod odpowiedzi logowany w `systemData.dataStatus`

#### Komunikacja
- **Timeout**: Brak explicit timeout w kodzie (domyślne wartości bibliotek)
- **Retry**: ESP32 automatycznie ponawia połączenie WiFi
- **JSON**: Używaj `ArduinoJson` z `DynamicJsonDocument`

**Przykład struktury:**
```cpp
// Definicje pinów i stałych
#define LED_PIN 2
#define ONE_WIRE_BUS 4

// Konfiguracja
const char* ssid = "...";
const char* password = "...";

// Struktury danych
struct SystemData {
  float temperature1 = 0.0;
  // ...
} systemData;

// Funkcje
void setup() { /* ... */ }
void loop() { /* ... */ }
```

### Backend (Node.js/Express)

#### Konwencje nazewnictwa
- **Zmienne**: `camelCase` (np. `esp32Data`, `currentPower`)
- **Funkcje**: `camelCase` (np. `app.post()`, `app.get()`)
- **Endpointy**: RESTful, kebab-case (np. `/api/esp32/data`)

#### Struktura kodu
- **Plik główny**: `backend/server.js`
  - Middleware na początku
  - Endpointy ESP32 (odbieranie danych)
  - Endpointy Frontend (odczyt i sterowanie)
  - Endpointy testowe na końcu

#### Obsługa błędów
- **Walidacja**: Sprawdzaj dane wejściowe przed przetworzeniem
- **Status codes**: 
  - `200` - sukces
  - `400` - błąd walidacji
  - `500` - błąd serwera
- **Logowanie**: Używaj `console.log()` z emoji dla czytelności

#### Middleware
- `cors()` - włączone dla wszystkich żądań
- `bodyParser.json()` - parsowanie JSON
- `bodyParser.urlencoded()` - parsowanie form data

**Przykład struktury:**
```javascript
// Middleware
app.use(cors());
app.use(bodyParser.json());

// Przechowywanie danych
let esp32Data = { /* ... */ };

// Endpointy ESP32
app.post('/api/esp32/data', (req, res) => { /* ... */ });

// Endpointy Frontend
app.get('/api/data', (req, res) => { /* ... */ });
```

### Frontend (Angular + TypeScript)

#### Konwencje nazewnictwa (planowane)
- **Komponenty**: `PascalCase` (np. `DashboardComponent`)
- **Serwisy**: `PascalCase` z sufiksem `Service` (np. `DataService`)
- **Zmienne**: `camelCase`
- **Stałe**: `UPPER_SNAKE_CASE`

#### Struktura (planowana)
- **Komponenty**: Jeden ekran główny (dashboard)
- **Serwisy**: 
  - `AuthService` - autoryzacja
  - `DataService` - pobieranie danych (polling co 5s)
  - `CommandService` - wysyłanie komend
- **Interceptory**: Obsługa autoryzacji i błędów

#### Polling
- **Interwał**: 5 sekund (zdefiniowane w PRD)
- **Obsługa błędów**: Wyświetlanie komunikatów w UI
- **Status offline**: Blokada kontrolek sterowania

---

## Struktura projektu

### Katalog główny
```
MaszynaESP32/
├── esp32/              # Firmware ESP32
├── backend/            # Backend API
├── frontend/           # Frontend webowy (do zaimplementowania)
├── prompts/            # Prompty dla AI
├── agents.md           # Ten plik
├── prd.md              # Dokument wymagań produktu
├── MVP.md              # Zakres MVP
├── README.md           # Ogólna dokumentacja
└── .gitignore          # Ignorowane pliki
```

### ESP32 (`esp32/`)
```
esp32/
├── src/
│   ├── main.cpp           # Główny plik firmware
│   ├── OLEDDisplay.h      # Klasa wyświetlacza (header)
│   └── OLEDDisplay.cpp    # Klasa wyświetlacza (implementacja)
├── include/               # Dodatkowe headery (puste)
├── lib/                   # Biblioteki lokalne (puste)
├── test/                  # Testy (puste)
├── platformio.ini         # Konfiguracja PlatformIO
└── WIRING_OLED.md         # Dokumentacja podłączenia OLED
```

### Backend (`backend/`)
```
backend/
├── server.js              # Główny plik serwera
├── package.json           # Zależności Node.js
├── package-lock.json      # Lockfile zależności
├── README.md              # Dokumentacja API
└── test-requests.http     # Testowe żądania HTTP
```

### Frontend (`frontend/`)
```
frontend/
└── README.md              # Dokumentacja (projekt do utworzenia)
```

**Status**: Frontend nie jest jeszcze zaimplementowany. Zgodnie z PRD powinien być w Angular + TypeScript.

---

## Ważne decyzje projektowe

### 1. Model danych
- **Brak historii**: MVP przechowuje wyłącznie aktualny stan
- **DeviceId**: ESP32 ma zahardcodowane `deviceId` (nie zaimplementowane jeszcze)
- **Użytkownicy**: Powiązani z `deviceId` (do zaimplementowania)

### 2. Komunikacja
- **Polling zamiast WebSocket**: Frontend używa polling co 5s (prostsze w MVP)
- **ESP32 push**: ESP32 wysyła dane co 1s (częściej niż frontend pobiera)
- **ESP32 pull**: ESP32 pobiera komendy co 3s

### 3. Bezpieczeństwo MVP
- **Proste hasło**: Bez resetu hasła, bez logowania Google
- **Autoryzacja**: Wszystkie endpointy wymagają zalogowania (do zaimplementowania)
- **HTTPS**: Nie w MVP (lokalne demo)

### 4. Offline handling
- **ESP32**: Automatyczne ponawianie połączenia WiFi bez limitu
- **UI**: Blokada sterowania gdy status = offline
- **Timeout**: Do doprecyzowania w implementacji

### 5. Hardware
- **Czujniki**: DS18B20 (OneWire) na pinie GPIO 4
- **Wyświetlacz**: OLED SSD1306 128x64 (I2C: SCL=GPIO22, SDA=GPIO21)
- **LED**: Wbudowana dioda na GPIO 2

### 6. Konfiguracja WiFi
- **Hardcoded**: SSID i hasło w kodzie ESP32 (linie 13-14 w `main.cpp`)
- **Server URL**: Hardcoded w kodzie (linia 15 w `main.cpp`)
- **TODO**: Przenieść do konfiguracji (nie w MVP)

---

## Konwencje i zasady

### Git
- **Monorepo**: Wszystkie podprojekty w jednym repozytorium
- **Commits**: Opisowe komunikaty w języku polskim
- **Branches**: Do ustalenia (prawdopodobnie `main` jako główna)

### Dokumentacja
- **Język**: Polska dokumentacja (komentarze w kodzie również po polsku)
- **Format**: Markdown dla wszystkich plików `.md`
- **Lokalizacja**: Dokumentacja blisko kodu (np. `WIRING_OLED.md` w `esp32/`)

### Kod
- **Komentarze**: Po polsku, wyjaśniające "dlaczego", nie "co"
- **Nazwy**: Angielskie nazwy zmiennych/funkcji, polskie komentarze
- **Formatowanie**: Zgodne z konwencjami frameworka (Arduino style, Express style)

### Testowanie
- **ESP32**: Testowanie na fizycznym urządzeniu
- **Backend**: Testowe żądania w `test-requests.http`
- **Frontend**: Do zaimplementowania (testy jednostkowe i E2E)

### Development workflow
1. **ESP32**: Edytuj w PlatformIO IDE lub VS Code z rozszerzeniem PlatformIO
2. **Backend**: `npm install` → `npm start` (lub `npm run dev` z nodemon)
3. **Frontend**: Do zaimplementowania (prawdopodobnie `ng serve`)

---

## Dokumentacja dodatkowa

### Pliki dokumentacyjne
- **`prd.md`** - Pełny dokument wymagań produktu (wymagania funkcjonalne, historie użytkownika)
- **`MVP.md`** - Zakres MVP i kryteria sukcesu
- **`prd-not-completed.md`** - Podsumowanie decyzji projektowych i nierozwiązane kwestie
- **`README.md`** - Ogólna dokumentacja projektu
- **`backend/README.md`** - Dokumentacja API backendu
- **`frontend/README.md`** - Dokumentacja frontendu (szkielet)
- **`esp32/WIRING_OLED.md`** - Instrukcja podłączenia wyświetlacza OLED

### Kluczowe pliki kodu
- **`esp32/src/main.cpp`** - Główny plik firmware ESP32
- **`esp32/src/OLEDDisplay.h/cpp`** - Klasa obsługi wyświetlacza OLED
- **`backend/server.js`** - Główny plik serwera backendu
- **`esp32/platformio.ini`** - Konfiguracja PlatformIO
- **`backend/package.json`** - Zależności Node.js

### Nierozwiązane kwestie (z PRD)
1. **Definicja statusu online/offline**: Timeout uznania urządzenia za offline
2. **Format endpointów API**: Dokładny schemat ACK i payloadów
3. **Polityka haseł**: Wymagania dot. długości, złożoności, haszowania

---

## Uwagi dla AI (Cursor)

### Priorytety implementacji
1. **Frontend** - Najważniejszy brakujący komponent (Angular + TypeScript)
2. **Baza danych** - SQLite z modelem użytkowników i aktualnych odczytów
3. **Autoryzacja** - System logowania/rejestracji w backendzie
4. **API endpoints** - Doprecyzowanie formatu komend i ACK

### Częste problemy
- **ESP32 nie łączy się z WiFi**: Sprawdź SSID/hasło w `main.cpp` (linie 13-14)
- **ESP32 nie może połączyć się z backendem**: Sprawdź `serverUrl` w `main.cpp` (linia 15)
- **Backend nie odpowiada**: Sprawdź czy serwer działa (`npm start` w `backend/`)
- **Brak danych**: ESP32 wysyła dane co 1s, ale frontend pobiera co 5s

### Kontekst implementacji
- Projekt jest w fazie MVP - priorytetem jest działająca funkcjonalność, nie optymalizacja
- Frontend nie jest jeszcze zaimplementowany - to największy brakujący element
- Baza danych nie jest jeszcze zaimplementowana - backend używa zmiennych w pamięci
- Autoryzacja nie jest jeszcze zaimplementowana - endpointy są publiczne

### Zasady edycji kodu
- **Zachowaj istniejące konwencje**: Nie zmieniaj stylu kodowania bez powodu
- **Dokumentuj zmiany**: Aktualizuj odpowiednie pliki `.md` przy większych zmianach
- **Testuj lokalnie**: ESP32 wymaga fizycznego urządzenia, backend można testować lokalnie
- **Zachowaj kompatybilność**: Zmiany w API powinny być wstecznie kompatybilne (lub zaktualizuj wszystkie komponenty)

---

## Reguły Cursor (`.cursor/rules/`)

Projekt zawiera szczegółowe reguły dla Cursor w katalogu `.cursor/rules/`:

- **`shared.mdc`** - Wspólne reguły dla całego projektu
- **`esp32.mdc`** - Reguły dla firmware ESP32 (PlatformIO/Arduino)
- **`frontend.mdc`** - Reguły dla frontendu (Angular + RxJS + Tailwind)
- **`backend.mdc`** - Reguły dla backendu (Node.js + Express + SQLite)

Te pliki zawierają szczegółowe wytyczne dotyczące:
- Konwencji nazewnictwa
- Struktury plików i folderów
- Best practices i antywzorce
- Wzorce architektoniczne
- Standardy kodowania

**Zobacz**: `.cursor/rules/*.mdc` dla szczegółowych reguł każdego modułu.

---

**Ostatnia aktualizacja**: 2026 (data do uzupełnienia)
**Wersja dokumentu**: 1.0.0
