# Baza danych SQLite - Instrukcja

## Wymagania

- **Brak dodatkowych wymagań!** SQLite działa out-of-the-box.
- Baza danych jest automatycznie tworzona przy pierwszym uruchomieniu aplikacji.

## Instalacja

**Nie wymaga instalacji!** Baza danych SQLite jest plikowa i działa automatycznie.

### Automatyczna inicjalizacja

Baza danych jest automatycznie tworzona przy starcie aplikacji:
- Plik bazy: `backend/database/app.db`
- Tabele są tworzone automatycznie przez `database/db.js`

### Uruchomienie

Po prostu uruchom backend:

```bash
cd backend
npm start
```

Baza danych zostanie automatycznie utworzona w pliku `backend/database/app.db`.

## Struktura bazy danych

### Tabele:

1. **devices** - Urządzenia ESP32
   - `id` - ID urządzenia (INTEGER PRIMARY KEY)
   - `device_id` - Unikalny identyfikator (TEXT UNIQUE)
   - `name` - Opcjonalna nazwa urządzenia (TEXT)
   - `created_at` - Data utworzenia (DATETIME)
   - `updated_at` - Data ostatniej aktualizacji (DATETIME)

2. **users** - Użytkownicy (operatorzy)
   - `id` - ID użytkownika (INTEGER PRIMARY KEY)
   - `username` - Unikalna nazwa użytkownika (TEXT UNIQUE)
   - `password_hash` - Zahashowane hasło (bcrypt) (TEXT)
   - `device_id` - Powiązanie z urządzeniem (TEXT)
   - `created_at` - Data utworzenia (DATETIME)
   - `updated_at` - Data ostatniej aktualizacji (DATETIME)

3. **sessions** - Aktywne sesje użytkowników
   - `id` - ID sesji (INTEGER PRIMARY KEY)
   - `user_id` - ID użytkownika (INTEGER, FOREIGN KEY)
   - `token` - Unikalny token sesji (TEXT UNIQUE)
   - `expires_at` - Czas wygaśnięcia sesji (DATETIME)
   - `created_at` - Data utworzenia (DATETIME)
   - `last_used_at` - Data ostatniego użycia (DATETIME)

## Testowanie połączenia

Możesz przetestować połączenie z bazą danych uruchamiając:

```bash
node database/test-connection.js
```

## Zarządzanie bazą danych

### Otwórz bazę w przeglądarce (DB Browser for SQLite)

1. Pobierz DB Browser for SQLite: https://sqlitebrowser.org/
2. Otwórz plik `backend/database/app.db`
3. Możesz przeglądać dane, edytować, wykonywać zapytania SQL

### Lub użyj rozszerzenia w Cursorze/VS Code

Zainstaluj rozszerzenie "SQLite Viewer" i otwórz plik `app.db` bezpośrednio w edytorze.

## Uwagi

- Baza danych to po prostu plik `app.db` - łatwe kopie zapasowe (skopiuj plik)
- Tabele są tworzone automatycznie przy starcie aplikacji
- Sesje wygasają po 24 godzinach (domyślnie)
- Hasła są hashowane przy użyciu bcrypt (10 rounds)
- SQLite nie wymaga osobnego serwera - wszystko działa w jednym pliku

## Backup

**To jest proste!** Po prostu skopiuj plik:

```bash
# Windows PowerShell
Copy-Item backend/database/app.db backend/database/app.db.backup

# Mac/Linux
cp backend/database/app.db backend/database/app.db.backup
```

## Reset bazy danych

Jeśli chcesz zresetować bazę danych:
1. Zatrzymaj backend
2. Usuń plik `backend/database/app.db`
3. Uruchom backend ponownie - baza zostanie utworzona od nowa