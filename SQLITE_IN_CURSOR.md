# 📊 Jak otworzyć bazę danych SQLite w Cursorze

## 🔌 Rozszerzenia do SQLite

Cursor (fork VS Code) obsługuje rozszerzenia z VS Code Marketplace. Oto najlepsze opcje:

### Opcja 1: SQLite Viewer (NAJPROSTSZE - ZALECANE)

**Nazwa:** `SQLite Viewer`  
**ID:** `qwtel.sqlite-viewer`  
**Autor:** Florian Klampfer

**Jak zainstalować:**
1. Otwórz Cursor
2. Kliknij ikonę rozszerzeń (Extensions) w lewym panelu (lub `Ctrl+Shift+X`)
3. Wyszukaj: `SQLite Viewer`
4. Kliknij "Install"

**Jak używać:**
1. Otwórz plik `backend/database/app.db` w Cursorze
2. Kliknij prawym przyciskiem na plik `.db`
3. Wybierz "Open Database" lub "Open with SQLite Viewer"
4. Zobaczysz panel z tabelami i możesz przeglądać dane

**Zalety:**
- ✅ Proste w użyciu
- ✅ Działa od razu po instalacji
- ✅ Możesz przeglądać tabele i dane
- ✅ Możesz wykonywać zapytania SQL

---

### Opcja 2: SQLTools + SQLite Driver (ZAawansowane)

**Nazwa:** `SQLTools` + `SQLTools SQLite`  
**ID:** `mtxr.sqltools` + `mtxr.sqltools-driver-sqlite`

**Jak zainstalować:**
1. Zainstaluj `SQLTools` (podstawowe rozszerzenie)
2. Zainstaluj `SQLTools SQLite` (driver dla SQLite)

**Jak używać:**
1. Otwórz Command Palette (`Ctrl+Shift+P`)
2. Wpisz: `SQLTools: Add New Connection`
3. Wybierz SQLite
4. Podaj ścieżkę do pliku: `backend/database/app.db`
5. Połącz się z bazą

**Zalety:**
- ✅ Bardziej zaawansowane funkcje
- ✅ Możliwość wykonywania zapytań SQL
- ✅ IntelliSense dla SQL
- ✅ Możliwość edycji danych

---

### Opcja 3: SQLite (Proste)

**Nazwa:** `SQLite`  
**ID:** `alexcvzz.vscode-sqlite`

**Jak zainstalować:**
1. Wyszukaj: `SQLite` w rozszerzeniach
2. Zainstaluj rozszerzenie autorstwa alexcvzz

**Jak używać:**
1. Otwórz plik `.db`
2. Kliknij prawym przyciskiem → "Open Database"
3. Przeglądaj tabele i dane

---

## 🎯 Szybki start - SQLite Viewer (ZALECANE)

### Krok 1: Zainstaluj rozszerzenie

1. Otwórz Cursor
2. `Ctrl+Shift+X` (Extensions)
3. Wyszukaj: `SQLite Viewer`
4. Kliknij "Install"

### Krok 2: Otwórz bazę danych

**Metoda 1: Przez Explorer**
1. W Explorerze (lewy panel) znajdź plik `backend/database/app.db`
2. Kliknij prawym przyciskiem na `app.db`
3. Wybierz "Open Database" lub "Open with SQLite Viewer"

**Metoda 2: Przez Command Palette**
1. `Ctrl+Shift+P`
2. Wpisz: `SQLite: Open Database`
3. Wybierz plik `backend/database/app.db`

### Krok 3: Przeglądaj dane

Po otwarciu zobaczysz:
- **Panel z tabelami** (users, sessions, devices)
- **Możliwość kliknięcia na tabelę** aby zobaczyć dane
- **Możliwość wykonywania zapytań SQL**

---

## 📝 Przykładowe zapytania SQL

Po otwarciu bazy możesz wykonać zapytania:

```sql
-- Zobacz wszystkich użytkowników
SELECT * FROM users;

-- Zobacz wszystkie sesje
SELECT * FROM sessions;

-- Zobacz wszystkie urządzenia
SELECT * FROM devices;

-- Zobacz użytkowników z ich urządzeniami
SELECT u.username, u.device_id, d.name 
FROM users u 
LEFT JOIN devices d ON u.device_id = d.device_id;
```

---

## 🔍 Sprawdzanie czy baza działa

Możesz też użyć wiersza poleceń:

```bash
# Windows (jeśli masz sqlite3.exe)
sqlite3 backend/database/app.db

# W konsoli SQLite:
.tables          # Pokaż tabele
SELECT * FROM users;  # Pokaż użytkowników
.quit           # Wyjdź
```

---

## 💡 Wskazówki

- **SQLite Viewer** jest najprostsze i wystarczające dla większości przypadków
- Jeśli potrzebujesz więcej funkcji, użyj **SQLTools**
- Baza danych jest aktualizowana na żywo - możesz zobaczyć zmiany od razu
- Pamiętaj, że baza to plik binarny - nie edytuj go bezpośrednio jako tekst!

---

## 🐛 Rozwiązywanie problemów

### Problem: "Cannot open database"
- Sprawdź czy plik `backend/database/app.db` istnieje
- Sprawdź czy masz uprawnienia do odczytu pliku
- Uruchom backend (`npm start`) - baza zostanie utworzona automatycznie

### Problem: "Extension not found"
- Upewnij się, że używasz Cursor (nie zwykłego edytora)
- Sprawdź czy masz dostęp do VS Code Marketplace
- Spróbuj zainstalować rozszerzenie ręcznie przez Command Palette

---

**Gotowe!** Teraz możesz przeglądać bazę danych bezpośrednio w Cursorze! 🎉
