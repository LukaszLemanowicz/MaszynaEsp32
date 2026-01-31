# 🚀 Szybki Start - SQLite (PROSTA WERSJA)

## ✅ Co to jest SQLite?

SQLite to **plikowa baza danych** - nie wymaga instalacji serwera! Wszystko działa w jednym pliku.

**Zalety:**
- ✅ **Nie wymaga instalacji** - działa od razu!
- ✅ **Jeden plik** - łatwe kopie zapasowe
- ✅ **Zero konfiguracji** - wszystko automatyczne
- ✅ **Idealne dla MVP** - wystarczające dla prostych projektów

---

## 📋 Krok po kroku - od zera do działającego systemu

### KROK 1: Zainstaluj zależności backendu

```bash
cd backend
npm install
```

To wszystko! Nie potrzebujesz instalować PostgreSQL ani niczego innego.

---

### KROK 2: Uruchom backend

```bash
npm start
```

**Oczekiwany wynik:**
```
✅ Połączono z bazą danych SQLite: .../database/app.db
✅ Baza danych zainicjalizowana (tabele utworzone)
🚀 Serwer uruchomiony na porcie 3000
📡 API dostępne pod: http://localhost:3000/api
```

**Zostaw ten terminal otwarty!** Backend musi działać w tle.

**Baza danych zostanie automatycznie utworzona** w pliku `backend/database/app.db` przy pierwszym uruchomieniu.

---

### KROK 3: (Opcjonalnie) Przetestuj połączenie z bazą danych

W **NOWYM terminalu**:

```bash
cd backend
node database/test-connection.js
```

**Oczekiwany wynik:**
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

---

### KROK 4: Zainstaluj zależności frontendu

Otwórz **NOWY terminal** (backend musi dalej działać w pierwszym):

```bash
cd frontend
npm install
```

---

### KROK 5: Uruchom frontend

W tym samym terminalu (frontend):

```bash
npm start
# lub
ng serve
```

**Oczekiwany wynik:**
```
✔ Browser application bundle generation complete.
** Angular Live Development Server is listening on localhost:4200 **
```

**Zostaw ten terminal też otwarty!**

---

### KROK 6: Przetestuj system

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
- ✅ Plik `backend/database/app.db` istnieje (baza danych została utworzona)

### Frontend działa:
- ✅ Terminal z frontendem pokazuje: "Angular Live Development Server is listening"
- ✅ W przeglądarce: http://localhost:4200 - widzisz stronę logowania

### Baza danych działa:
- ✅ Backend loguje: "✅ Połączenie z bazą danych działa"
- ✅ Możesz się zarejestrować i zalogować
- ✅ Plik `backend/database/app.db` istnieje

---

## 🐛 Rozwiązywanie problemów

### Problem: "Cannot find module 'better-sqlite3'"
**Rozwiązanie:**
```bash
cd backend
npm install
```

### Problem: "Port 3000 already in use"
**Rozwiązanie:**
1. Znajdź proces: `netstat -ano | findstr :3000` (Windows) lub `lsof -i :3000` (Mac/Linux)
2. Zabij proces lub zmień port w `backend/.env`: `PORT=3001`
3. Zaktualizuj `frontend/src/app/core/config/api.config.ts`: `baseUrl: 'http://localhost:3001/api'`

### Problem: "Port 4200 already in use"
**Rozwiązanie:**
- Angular automatycznie zaproponuje inny port (np. 4201)
- Użyj portu, który Angular zaproponował

### Problem: "Błąd dostępu do pliku bazy danych"
**Rozwiązanie:**
- Sprawdź czy katalog `backend/database/` istnieje
- Sprawdź uprawnienia do zapisu w katalogu `backend/`

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
- Użyj innej nazwy użytkownika lub usuń plik `backend/database/app.db` i uruchom ponownie

---

## 📝 Podsumowanie - co masz uruchomione

Po wykonaniu wszystkich kroków powinieneś mieć:

1. ✅ **Backend** - działa na porcie 3000 (terminal 1)
2. ✅ **Frontend** - działa na porcie 4200 (terminal 2)
3. ✅ **Baza danych SQLite** - plik `backend/database/app.db` (utworzony automatycznie)
4. ✅ **Przeglądarka** - otwarta na http://localhost:4200

**Nie potrzebujesz:**
- ❌ PostgreSQL
- ❌ Instalacji serwera bazy danych
- ❌ Konfiguracji użytkowników i haseł
- ❌ Skryptów SQL do uruchomienia

---

## 💡 Wskazówki

- **Zawsze uruchamiaj backend przed frontendem**
- **Zostaw oba terminale otwarte** - aplikacje muszą działać w tle
- **Sprawdzaj logi w terminalach** - tam zobaczysz błędy
- **Używaj dwóch terminali** - jeden dla backendu, jeden dla frontendu
- **Baza danych to po prostu plik** - możesz go skopiować jako backup

---

## 🎯 Następne kroki

Po uruchomieniu systemu możesz:
1. Przetestować rejestrację i logowanie
2. Sprawdzić czy tokeny są poprawnie generowane
3. Przetestować endpoint `/api/auth/me` z tokenem
4. Otworzyć bazę danych w DB Browser for SQLite (opcjonalnie)

**Pamiętaj:** Na razie zaimplementowaliśmy tylko autoryzację. Funkcjonalność maszyny (temperatury, komendy) będzie dodana później.

---

**Gotowe!** 🎉 Teraz masz działający system rejestracji i logowania **bez instalowania PostgreSQL!**
