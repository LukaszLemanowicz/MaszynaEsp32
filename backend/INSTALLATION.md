# Instrukcja instalacji i uruchomienia backendu

> **⚠️ UWAGA:** Ten plik zawiera instrukcje dla PostgreSQL (stara wersja).
> **Dla prostszej instalacji zobacz:** [`INSTALLATION_SQLITE.md`](./INSTALLATION_SQLITE.md) - **ZALECANE!**

## 📋 Wymagania

- Node.js (wersja 16 lub nowsza)
- PostgreSQL (wersja 12 lub nowsza) - **lub użyj SQLite (prostsze!)**
- npm lub yarn

## 🔧 Instalacja

### 1. Zainstaluj zależności

```bash
cd backend
npm install
```

### 2. Skonfiguruj bazę danych PostgreSQL

#### a) Utwórz bazę danych

```bash
# Zaloguj się do PostgreSQL jako superuser
psql -U postgres

# Utwórz bazę danych
CREATE DATABASE maszyna_esp32;

# Wyjdź z psql
\q
```

#### b) Uruchom skrypt SQL

```bash
# Z terminala (Windows PowerShell)
psql -U postgres -d maszyna_esp32 -f database/schema.sql

# Lub z psql interaktywnie
psql -U postgres -d maszyna_esp32
\i database/schema.sql
```

### 3. Skonfiguruj zmienne środowiskowe

Utwórz plik `.env` w katalogu `backend/`:

```env
# Konfiguracja bazy danych PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=maszyna_esp32
DB_USER=postgres
DB_PASSWORD=twoje_haslo

# Konfiguracja sesji (opcjonalne)
SESSION_DURATION_HOURS=24

# Port serwera (UWAGA: frontend używa 4200, więc backend powinien używać innego portu, np. 3000)
PORT=3000
```

**⚠️ UWAGA:** Frontend Angular domyślnie używa portu 4200. Jeśli chcesz uruchomić backend na porcie 4200, musisz zmienić port frontendu lub użyć innego portu dla backendu (np. 3000).

### 4. Zaktualizuj konfigurację frontendu

Jeśli zmieniłeś port backendu, zaktualizuj plik `frontend/src/app/core/config/api.config.ts`:

```typescript
export const API_CONFIG = {
  baseUrl: 'http://localhost:3000/api', // Zmień na port backendu
  // ...
};
```

## 🚀 Uruchomienie

### Tryb deweloperski (z auto-reload)

```bash
npm run dev
```

### Tryb produkcyjny

```bash
npm start
```

Serwer powinien uruchomić się i wyświetlić:

```
✅ Połączenie z bazą danych działa
🚀 Serwer uruchomiony na porcie 3000
📡 API dostępne pod: http://localhost:3000/api
```

## 🧪 Testowanie

### Test połączenia z bazą danych

Możesz przetestować połączenie z bazą danych:

```bash
node -e "require('./database/db').query('SELECT NOW()').then(() => console.log('OK')).catch(e => console.error(e))"
```

### Test endpointów API

Możesz użyć narzędzia jak Postman, curl lub plik `test-requests.http`:

```bash
# Rejestracja użytkownika
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123","deviceId":"ESP32_001"}'

# Logowanie
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'

# Pobranie danych użytkownika (wymaga tokenu)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <token_z_logowania>"
```

## 📝 Struktura projektu

```
backend/
├── database/
│   ├── db.js              # Konfiguracja połączenia z bazą danych
│   ├── schema.sql         # Skrypt SQL do utworzenia tabel
│   └── README.md          # Dokumentacja bazy danych
├── services/
│   └── auth.service.js    # Logika biznesowa autoryzacji
├── middleware/
│   └── auth.middleware.js # Middleware autoryzacji
├── server.js              # Główny plik serwera
├── package.json           # Zależności Node.js
└── .env                   # Zmienne środowiskowe (nie commituj!)
```

## ❓ Rozwiązywanie problemów

### Błąd: "Połączenie z bazą danych nie działa"

1. Sprawdź czy PostgreSQL jest uruchomiony:
   ```bash
   # Windows
   Get-Service postgresql*
   
   # Linux/Mac
   sudo systemctl status postgresql
   ```

2. Sprawdź konfigurację w pliku `.env`:
   - `DB_HOST` - powinno być `localhost`
   - `DB_PORT` - domyślnie `5432`
   - `DB_NAME` - nazwa utworzonej bazy danych
   - `DB_USER` - użytkownik PostgreSQL
   - `DB_PASSWORD` - hasło użytkownika

3. Sprawdź czy baza danych istnieje:
   ```bash
   psql -U postgres -l
   ```

### Błąd: "Port już w użyciu"

Jeśli port jest zajęty, zmień go w pliku `.env`:
```env
PORT=3001
```

### Błąd: "Module not found"

Uruchom ponownie instalację zależności:
```bash
npm install
```

## 🔐 Bezpieczeństwo

- **Hasła**: Hasła są hashowane przy użyciu bcrypt (10 rounds)
- **Sesje**: Tokeny sesji są przechowywane w bazie danych i wygasają po 24 godzinach (domyślnie)
- **Walidacja**: Wszystkie dane wejściowe są walidowane przed przetworzeniem

## 📚 Dokumentacja API

Pełna dokumentacja API znajduje się w pliku `README.md` oraz `.ai/api-plan.md`.
