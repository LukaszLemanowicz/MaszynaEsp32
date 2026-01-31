# Frontend - System Zdalnego Monitorowania i Sterowania Maszyną

Frontend webowy zbudowany w Angular + TypeScript dla systemu monitorowania i sterowania maszyną przemysłową z ESP32.

## 🚀 Uruchomienie

```bash
npm install
ng serve
```

Aplikacja dostępna pod adresem: `http://localhost:4200`

## 📋 Funkcjonalności

- **Autoryzacja**: Rejestracja, logowanie, wylogowanie użytkowników
- **Podgląd danych**: Trzy temperatury w czasie rzeczywistym (polling co 5s)
- **Status urządzenia**: Wskaźnik online/offline
- **Sterowanie**: ON/OFF maszyny oraz regulacja serwa (0-100)
- **Potwierdzenia**: Wizualne feedback po wykonaniu komend (ACK)

## 🔌 Integracja z Backendem

Backend API dostępne pod adresem:
- Development: `http://localhost:3000`
- Production: (do skonfigurowania)

### Główne endpointy API:

**Autoryzacja:**
- `POST /api/auth/register` - Rejestracja użytkownika
- `POST /api/auth/login` - Logowanie
- `POST /api/auth/logout` - Wylogowanie

**Dane urządzenia:**
- `GET /api/device-state` - Pobierz aktualny stan (polling co 5s)

**Komendy sterujące:**
- `POST /api/commands/power-on` - Włączenie maszyny
- `POST /api/commands/power-off` - Wyłączenie maszyny
- `POST /api/commands/servo` - Ustawienie serwa (0-100)
- `GET /api/commands/status/:commandId` - Status wykonania komendy

Pełna dokumentacja API: `../backend/README.md` oraz `.ai/api-plan.md`

## 🏗️ Architektura

- **Framework**: Angular + TypeScript
- **Design**: Mobile-first, minimalistyczny, jeden ekran główny (dashboard)
- **Komunikacja**: HTTP polling (co 5s dla danych, co 1s dla statusu komend)
- **Autoryzacja**: Session-based (token w headerze `Authorization: Bearer <token>`)

## 📁 Struktura

- `/login` - Ekran logowania
- `/register` - Ekran rejestracji
- `/dashboard` - Ekran główny (chroniony, wymaga autoryzacji)

Szczegółowa architektura UI: `.ai/ui-plan.md`
