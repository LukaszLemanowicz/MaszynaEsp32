# Maszyna ESP32 - System Monorepo

Projekt systemu Mazzyny z kontrolą przez ESP32, backend API i frontend webowy.

## 📁 Struktura projektu

Projekt jest zorganizowany jako **monorepo** z trzema głównymi komponentami:

```
MaszynaESP32/
├── esp32/          # Firmware dla ESP32 (PlatformIO)
├── backend/        # Backend API (Node.js/Express)
└── frontend/       # Frontend webowy (React/Vue/etc.)
```

## 🚀 Szybki start

### ESP32 (Firmware)

```bash
cd esp32
# Otwórz projekt w PlatformIO IDE lub użyj CLI
pio run
pio upload
```

### Backend

```bash
cd backend
npm install
npm start
```

Serwer będzie dostępny pod adresem: `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
npm start
```

## 📚 Dokumentacja

- **ESP32**: Zobacz `esp32/WIRING_OLED.md` dla szczegółów podłączenia
- **Backend**: Zobacz `backend/README.md` dla dokumentacji API
- **Frontend**: Zobacz `frontend/README.md` (po utworzeniu)

## 🔧 Wspólne ustawienia

- **Git**: Wspólne repozytorium dla całego projektu
- **.gitignore**: Wspólny plik ignorowania dla wszystkich komponentów
- **Konfiguracja**: Wspólne zmienne środowiskowe i ustawienia

## 📝 Licencja

MIT
