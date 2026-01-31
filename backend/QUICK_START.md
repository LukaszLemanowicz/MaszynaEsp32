# 🚀 Szybki Start - Kolejność uruchomienia systemu (PostgreSQL - PRZESTARZAŁE)

> **⚠️ UWAGA:** Ten plik zawiera instrukcje dla PostgreSQL (stara wersja).
> **Dla prostszej instalacji zobacz:** [`QUICK_START_SQLITE.md`](../QUICK_START_SQLITE.md) - **ZALECANE!**

## 📋 Krok po kroku - od zera do działającego systemu

### KROK 1: Sprawdź czy masz PostgreSQL

**Windows:**
```powershell
# Sprawdź czy PostgreSQL jest zainstalowany
Get-Service postgresql*
```

Jeśli nie masz PostgreSQL:
- Pobierz i zainstaluj z: https://www.postgresql.org/download/windows/
- Podczas instalacji zapamiętaj hasło dla użytkownika `postgres`

**Mac:**
```bash
# Sprawdź czy PostgreSQL jest zainstalowany
brew services list | grep postgresql
```

Jeśli nie masz:
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
# Sprawdź czy PostgreSQL jest zainstalowany
sudo systemctl status postgresql
```

Jeśli nie masz:
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

---

### KROK 2: Utwórz bazę danych

Otwórz terminal/PowerShell i wykonaj:

```bash
# Zaloguj się do PostgreSQL
psql -U postgres
```

W konsoli PostgreSQL wykonaj:

```sql
-- Utwórz bazę danych
CREATE DATABASE maszyna_esp32;

-- Sprawdź czy się utworzyła
\l

-- Wyjdź z psql
\q
```

**Jeśli masz problem z logowaniem:**
- Windows: Może być potrzebne hasło, które ustawiłeś podczas instalacji
- Jeśli nie pamiętasz hasła, możesz je zresetować w pliku konfiguracyjnym PostgreSQL

---

### KROK 3: Uruchom skrypt SQL (utworzenie tabel)

W terminalu (w katalogu głównym projektu):

```bash
# Windows PowerShell
psql -U postgres -d maszyna_esp32 -f backend/database/schema.sql

# Lub jeśli masz problemy z ścieżką:
cd backend
psql -U postgres -d maszyna_esp32 -f database/schema.sql
```

**Sprawdź czy się udało:**
```bash
psql -U postgres -d maszyna_esp32 -c "\dt"
```

Powinieneś zobaczyć tabele: `devices`, `sessions`, `users`

---

### KROK 4: Skonfiguruj zmienne środowiskowe

Utwórz plik `backend/.env` (w katalogu `backend/`):

**Windows PowerShell:**
```powershell
cd backend
New-Item -Path .env -ItemType File
notepad .env
```

**Mac/Linux:**
```bash
cd backend
touch .env
nano .env
```

**Wklej do pliku `.env`:**
```env
# Konfiguracja bazy danych PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=maszyna_esp32
DB_USER=postgres
DB_PASSWORD=twoje_haslo_postgres

# Konfiguracja sesji (opcjonalne)
SESSION_DURATION_HOURS=24

# Port serwera
PORT=3000
```

**⚠️ WAŻNE:** Zamień `twoje_haslo_postgres` na rzeczywiste hasło użytkownika `postgres`!

---

### KROK 5: Zainstaluj zależności backendu

```bash
cd backend
npm install
```

To może chwilę potrwać (pierwszy raz).

---

### KROK 6: Przetestuj połączenie z bazą danych

```bash
# W katalogu backend
node database/test-connection.js
```

**Oczekiwany wynik:**
```
✅ Połączenie działa!
⏰ Czas serwera: ...
📦 Wersja PostgreSQL: ...
📋 Dostępne tabele:
   - devices
   - sessions
   - users
✅ Wszystkie wymagane tabele istnieją!
```

**Jeśli widzisz błąd:**
- Sprawdź czy PostgreSQL jest uruchomiony
- Sprawdź hasło w pliku `.env`
- Sprawdź czy baza danych `maszyna_esp32` istnieje

---

### KROK 7: Uruchom backend

W terminalu (w katalogu `backend/`):

```bash
npm start
```

**Oczekiwany wynik:**
```
✅ Połączenie z bazą danych działa
🚀 Serwer uruchomiony na porcie 3000
📡 API dostępne pod: http://localhost:3000/api
🌐 Strona główna: http://localhost:3000
```

**Zostaw ten terminal otwarty!** Backend musi działać w tle.

---

### KROK 8: Zainstaluj zależności frontendu

Otwórz **NOWY terminal** (backend musi dalej działać w pierwszym):

```bash
cd frontend
npm install
```

To też może chwilę potrwać.

---

### KROK 9: Uruchom frontend

W tym samym terminalu (frontend):

```bash
npm start
# lub
ng serve
```

**Oczekiwany wynik:**
```
✔ Browser application bundle generation complete.
Initial chunk files | Names         |  Size
main.js             | main          | ...
...
** Angular Live Development Server is listening on localhost:4200 **
```

**Zostaw ten terminal też otwarty!**

---

### KROK 10: Przetestuj system

1. **Otwórz przeglądarkę:** http://localhost:4200

2. **Zarejestruj użytkownika:**
   - Kliknij "Rejestracja" lub przejdź do `/register`
   - Wpisz:
     - Username: `testuser`
     - Password: `testpass123`
     - Device ID: `ESP32_001`
   - Kliknij "Zarejestruj"

3. **Zaloguj się:**
   - Po rejestracji powinieneś zostać przekierowany do logowania
   - Wpisz te same dane co przy rejestracji
   - Kliknij "Zaloguj"

4. **Sprawdź czy działa:**
   - Po zalogowaniu powinieneś zobaczyć dashboard
   - W konsoli backendu powinny pojawić się logi:
     ```
     ✅ Zarejestrowano użytkownika: testuser
     🔐 Zalogowano użytkownika: testuser
     ```

---

## ✅ Sprawdzenie czy wszystko działa

### Backend działa:
- ✅ Terminal z backendem pokazuje: "Serwer uruchomiony na porcie 3000"
- ✅ W przeglądarce: http://localhost:3000 - widzisz JSON z informacjami o API

### Frontend działa:
- ✅ Terminal z frontendem pokazuje: "Angular Live Development Server is listening"
- ✅ W przeglądarce: http://localhost:4200 - widzisz stronę logowania

### Baza danych działa:
- ✅ Backend loguje: "✅ Połączenie z bazą danych działa"
- ✅ Możesz się zarejestrować i zalogować

---

## 🐛 Rozwiązywanie problemów

### Problem: "Cannot connect to database"
**Rozwiązanie:**
1. Sprawdź czy PostgreSQL jest uruchomiony
2. Sprawdź hasło w `backend/.env`
3. Sprawdź czy baza `maszyna_esp32` istnieje: `psql -U postgres -l`

### Problem: "Port 3000 already in use"
**Rozwiązanie:**
1. Znajdź proces: `netstat -ano | findstr :3000` (Windows) lub `lsof -i :3000` (Mac/Linux)
2. Zabij proces lub zmień port w `backend/.env`: `PORT=3001`
3. Zaktualizuj `frontend/src/app/core/config/api.config.ts`: `baseUrl: 'http://localhost:3001/api'`

### Problem: "Port 4200 already in use"
**Rozwiązanie:**
1. Angular automatycznie zaproponuje inny port (np. 4201)
2. Użyj portu, który Angular zaproponował

### Problem: "Module not found"
**Rozwiązanie:**
```bash
# W katalogu backend
rm -rf node_modules package-lock.json
npm install

# W katalogu frontend
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Błąd podczas rejestracji - użytkownik już istnieje"
**Rozwiązanie:**
- To normalne, jeśli już się rejestrowałeś
- Użyj innej nazwy użytkownika lub usuń użytkownika z bazy:
  ```sql
  psql -U postgres -d maszyna_esp32
  DELETE FROM users WHERE username = 'testuser';
  ```

---

## 📝 Podsumowanie - co masz uruchomione

Po wykonaniu wszystkich kroków powinieneś mieć:

1. ✅ **PostgreSQL** - działa w tle
2. ✅ **Baza danych** `maszyna_esp32` - utworzona z tabelami
3. ✅ **Backend** - działa na porcie 3000 (terminal 1)
4. ✅ **Frontend** - działa na porcie 4200 (terminal 2)
5. ✅ **Przeglądarka** - otwarta na http://localhost:4200

---

## 🎯 Następne kroki

Po uruchomieniu systemu możesz:
1. Przetestować rejestrację i logowanie
2. Sprawdzić czy tokeny są poprawnie generowane
3. Przetestować endpoint `/api/auth/me` z tokenem

**Pamiętaj:** Na razie zaimplementowaliśmy tylko autoryzację. Funkcjonalność maszyny (temperatury, komendy) będzie dodana później.

---

## 💡 Wskazówki

- **Zawsze uruchamiaj backend przed frontendem**
- **Zostaw oba terminale otwarte** - aplikacje muszą działać w tle
- **Sprawdzaj logi w terminalach** - tam zobaczysz błędy
- **Używaj dwóch terminali** - jeden dla backendu, jeden dla frontendu

---

**Gotowe!** 🎉 Teraz masz działający system rejestracji i logowania!
