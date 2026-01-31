# 🚀 Instalacja i uruchomienie - SQLite (PROSTA WERSJA)

## ✅ Zalety SQLite

- **Nie wymaga instalacji serwera** - działa od razu!
- **Jeden plik bazy danych** - łatwe kopie zapasowe
- **Zero konfiguracji** - wszystko działa out-of-the-box
- **Idealne dla MVP** - wystarczające dla prostych projektów

## 📋 Wymagania

- Node.js (wersja 16 lub nowsza)
- npm lub yarn

**To wszystko!** Nie potrzebujesz PostgreSQL ani żadnego innego serwera bazy danych.

## 🔧 Instalacja (3 kroki!)

### Krok 1: Zainstaluj zależności

```bash
cd backend
npm install
```

### Krok 2: (Opcjonalnie) Skonfiguruj zmienne środowiskowe

Utwórz plik `.env` w katalogu `backend/` (opcjonalne - wszystko działa z domyślnymi wartościami):

```env
# Port serwera (opcjonalne, domyślnie 3000)
PORT=3000

# Ścieżka do pliku bazy danych (opcjonalne, domyślnie database/app.db)
DB_PATH=./database/app.db

# Czas trwania sesji w godzinach (opcjonalne, domyślnie 24)
SESSION_DURATION_HOURS=24
```

**Nie musisz tego robić!** Aplikacja działa bez `.env` - użyje domyślnych wartości.

### Krok 3: Uruchom serwer

```bash
npm start
```

**To wszystko!** 🎉

Baza danych zostanie automatycznie utworzona w pliku `backend/database/app.db` przy pierwszym uruchomieniu.

## ✅ Sprawdzenie czy działa

### Test połączenia z bazą danych

```bash
node database/test-connection.js
```

Powinieneś zobaczyć:
```
✅ Połączenie działa!
⏰ Czas serwera: ...
📦 Wersja SQLite: ...
📋 Dostępne tabele:
   - devices
   - sessions
   - users
✅ Wszystkie wymagane tabele istnieją!
```

### Uruchom serwer

```bash
npm start
```

Powinieneś zobaczyć:
```
✅ Połączono z bazą danych SQLite: .../database/app.db
✅ Baza danych zainicjalizowana (tabele utworzone)
🚀 Serwer uruchomiony na porcie 3000
```

## 📁 Struktura bazy danych

Baza danych to po prostu **jeden plik**: `backend/database/app.db`

Tabele są automatycznie tworzone przy pierwszym uruchomieniu:
- `users` - użytkownicy
- `sessions` - sesje użytkowników
- `devices` - urządzenia ESP32

## 🔄 Migracje i aktualizacje

**Nie potrzebujesz migracji!** Tabele są automatycznie tworzone przy starcie aplikacji.

Jeśli chcesz zresetować bazę danych:
1. Zatrzymaj serwer
2. Usuń plik `backend/database/app.db`
3. Uruchom serwer ponownie - baza zostanie utworzona od nowa

## 💡 Zarządzanie bazą danych

### Otwórz bazę w przeglądarce (DB Browser for SQLite)

1. Pobierz DB Browser for SQLite: https://sqlitebrowser.org/
2. Otwórz plik `backend/database/app.db`
3. Możesz przeglądać dane, edytować, itp.

### Lub użyj wiersza poleceń

```bash
# Windows (jeśli masz sqlite3.exe)
sqlite3 backend/database/app.db

# W konsoli SQLite:
.tables          # Pokaż tabele
SELECT * FROM users;  # Pokaż użytkowników
.quit           # Wyjdź
```

## 🐛 Rozwiązywanie problemów

### Problem: "Cannot find module 'better-sqlite3'"

**Rozwiązanie:**
```bash
cd backend
npm install
```

### Problem: "Błąd dostępu do pliku bazy danych"

**Rozwiązanie:**
- Sprawdź czy katalog `backend/database/` istnieje
- Sprawdź uprawnienia do zapisu w katalogu `backend/`

### Problem: "Port 3000 już w użyciu"

**Rozwiązanie:**
- Zmień port w `.env`: `PORT=3001`
- Lub zabij proces używający portu 3000

## 📊 Backup bazy danych

**To jest proste!** Po prostu skopiuj plik:

```bash
# Windows PowerShell
Copy-Item backend/database/app.db backend/database/app.db.backup

# Mac/Linux
cp backend/database/app.db backend/database/app.db.backup
```

## 🎯 Porównanie z PostgreSQL

| Cecha | SQLite | PostgreSQL |
|-------|--------|------------|
| Instalacja | ❌ Nie wymaga | ✅ Wymaga instalacji serwera |
| Konfiguracja | ✅ Zero konfiguracji | ⚠️ Trzeba skonfigurować użytkownika, hasło, itp. |
| Plik bazy | ✅ Jeden plik `.db` | ❌ Wiele plików w systemie |
| Backup | ✅ Skopiuj plik | ⚠️ Trzeba użyć pg_dump |
| Dla MVP | ✅ Idealne | ⚠️ Na wyrost |
| Skalowanie | ⚠️ Ograniczone | ✅ Doskonałe |

## ✅ Podsumowanie

**SQLite jest idealne dla MVP:**
- ✅ Nie wymaga instalacji
- ✅ Działa od razu
- ✅ Proste w użyciu
- ✅ Wystarczające dla prostych projektów
- ✅ Łatwe kopie zapasowe

**Gotowe!** Teraz możesz uruchomić backend bez instalowania PostgreSQL! 🎉
