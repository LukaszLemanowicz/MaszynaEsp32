# ✅ Checklista uruchomienia systemu (SQLite)

Użyj tej checklisty, aby śledzić postęp. Odznaczaj każdy krok po wykonaniu.

## 📦 Przygotowanie środowiska

- [ ] **Node.js zainstalowany**
  - Sprawdź: `node --version`
  - Jeśli nie masz: https://nodejs.org/

**To wszystko!** SQLite nie wymaga instalacji - działa automatycznie.

## 🔧 Backend

- [ ] **Zależności zainstalowane**
  ```bash
  cd backend
  npm install
  ```

- [ ] **Backend uruchomiony**
  ```bash
  npm start
  ```
  Wynik: 🚀 Serwer uruchomiony na porcie 3000
  **Baza danych zostanie automatycznie utworzona w `backend/database/app.db`**

- [ ] **Połączenie z bazą danych przetestowane** (opcjonalnie)
  ```bash
  node database/test-connection.js
  ```
  Wynik: ✅ Wszystkie wymagane tabele istnieją!

## 🎨 Frontend

- [ ] **Zależności zainstalowane**
  ```bash
  cd frontend
  npm install
  ```

- [ ] **Frontend uruchomiony**
  ```bash
  npm start
  ```
  Wynik: ** Angular Live Development Server is listening on localhost:4200

## 🧪 Testowanie

- [ ] **Przeglądarka otwarta na http://localhost:4200**
- [ ] **Rejestracja użytkownika działa**
  - Utworzono konto z username, password, deviceId
- [ ] **Logowanie działa**
  - Zalogowano się używając utworzonego konta
- [ ] **Dashboard widoczny po zalogowaniu**
  - (Na razie może być pusty - to normalne, bo nie ma jeszcze danych maszyny)

## ✅ Wszystko działa!

Jeśli wszystkie powyższe punkty są odznaczone, system działa poprawnie! 🎉

---

## 🆘 Jeśli coś nie działa

### Backend nie startuje
- [ ] Sprawdź czy Node.js jest zainstalowany
- [ ] Sprawdź czy port 3000 jest wolny
- [ ] Sprawdź czy katalog `backend/database/` istnieje i ma uprawnienia do zapisu

### Frontend nie startuje
- [ ] Sprawdź czy backend działa
- [ ] Sprawdź czy port 4200 jest wolny (lub użyj portu, który Angular zaproponował)

### Błąd połączenia z bazą danych
- [ ] Sprawdź czy katalog `backend/database/` istnieje
- [ ] Sprawdź uprawnienia do zapisu w katalogu `backend/`
- [ ] Uruchom `node database/test-connection.js` aby zdiagnozować

### Nie mogę się zarejestrować/zalogować
- [ ] Sprawdź logi w terminalu backendu
- [ ] Sprawdź czy baza danych istnieje (`backend/database/app.db`)
- [ ] Sprawdź czy backend działa (http://localhost:3000)

---

**Szczegółowe instrukcje:** Zobacz `QUICK_START_SQLITE.md` lub `INSTALLATION_SQLITE.md`
