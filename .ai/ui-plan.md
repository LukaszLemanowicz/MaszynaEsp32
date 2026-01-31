# Architektura UI dla Systemu Zdalnego Monitorowania i Sterowania Maszyną

## 1. Przegląd struktury UI

Aplikacja webowa jest zbudowana jako **Single Page Application (SPA)** w Angular z minimalistycznym, mobile-first podejściem. Struktura UI jest zaprojektowana wokół jednego głównego ekranu (dashboard), który prezentuje wszystkie kluczowe informacje i funkcje sterowania. Aplikacja wykorzystuje **session-based authentication** z automatycznym przekierowaniem do ekranu logowania w przypadku braku lub wygaśnięcia sesji.

**Główne założenia architektoniczne:**
- **Jeden ekran główny** (dashboard) - zgodnie z FR-13, wszystkie funkcje dostępne z jednego miejsca
- **Mobile-first design** - interfejs zoptymalizowany dla urządzeń mobilnych, skalowalny na desktop
- **Polling-based data refresh** - automatyczne odświeżanie danych co 5 sekund bez blokowania UI
- **Progressive disclosure** - informacje prezentowane hierarchicznie, najważniejsze na górze
- **Real-time feedback** - natychmiastowe wizualne potwierdzenia akcji użytkownika
- **Graceful degradation** - obsługa stanów błędów i offline bez przerywania pracy użytkownika

**Struktura nawigacji:**
- **Publiczne widoki**: Rejestracja, Logowanie
- **Chronione widoki**: Dashboard (ekran główny)
- **Automatyczne przekierowania**: Ochrona tras, obsługa wygasłych sesji

---

## 2. Lista widoków

### 2.1. Widok rejestracji (`/register`)

**Nazwa widoku:** Registration View  
**Ścieżka:** `/register`  
**Główny cel:** Umożliwienie nowym użytkownikom utworzenia konta operatora z powiązaniem do `deviceId` (FR-01, US-001)

**Kluczowe informacje do wyświetlenia:**
- Formularz rejestracji z polami: username, password, deviceId
- Link do ekranu logowania (dla użytkowników z istniejącym kontem)
- Komunikaty walidacji i błędów

**Kluczowe komponenty widoku:**
- **RegistrationFormComponent** - formularz z walidacją:
  - Pole `username` (required, max 50 znaków, unique)
  - Pole `password` (required, min 8 znaków)
  - Pole `deviceId` (required, max 100 znaków)
  - Przycisk "Zarejestruj się"
  - Link "Masz już konto? Zaloguj się"
- **ErrorMessageComponent** - wyświetlanie błędów walidacji i konfliktów (409 Conflict dla duplikatu username)
- **LoadingIndicatorComponent** - wskaźnik ładowania podczas przetwarzania żądania

**UX, dostępność i bezpieczeństwo:**
- **UX:**
  - Prosty, przejrzysty formularz z jasnymi etykietami
  - Walidacja w czasie rzeczywistym (real-time validation)
  - Czytelne komunikaty błędów w języku polskim
  - Automatyczne przekierowanie do logowania po udanej rejestracji
- **Dostępność:**
  - Wszystkie pola formularza z odpowiednimi `label` i `aria-label`
  - Obsługa nawigacji klawiaturą (Tab, Enter)
  - Komunikaty błędów powiązane z polami przez `aria-describedby`
  - Kontrast kolorów zgodny z WCAG 2.1 AA
- **Bezpieczeństwo:**
  - Hasło ukryte w polu typu `password`
  - Walidacja po stronie klienta i serwera
  - Brak wyświetlania szczegółów błędów bezpieczeństwa (np. czy username istnieje)
  - CSRF protection przez Angular (domyślnie wbudowane)

**Mapowanie do API:**
- `POST /api/auth/register` - wysłanie danych rejestracji
- Obsługa odpowiedzi: `201 Created` (sukces), `400 Bad Request` (walidacja), `409 Conflict` (duplikat username)

---

### 2.2. Widok logowania (`/login`)

**Nazwa widoku:** Login View  
**Ścieżka:** `/login`  
**Główny cel:** Uwierzytelnienie użytkownika i utworzenie sesji (FR-02, US-002)

**Kluczowe informacje do wyświetlenia:**
- Formularz logowania z polami: username, password
- Link do ekranu rejestracji
- Komunikaty błędów autoryzacji

**Kluczowe komponenty widoku:**
- **LoginFormComponent** - formularz logowania:
  - Pole `username` (required)
  - Pole `password` (required, type="password")
  - Checkbox "Zapamiętaj mnie" (opcjonalnie, dla przyszłych rozszerzeń)
  - Przycisk "Zaloguj się"
  - Link "Nie masz konta? Zarejestruj się"
- **ErrorMessageComponent** - wyświetlanie błędów (401 Unauthorized dla nieprawidłowych danych)
- **LoadingIndicatorComponent** - wskaźnik ładowania

**UX, dostępność i bezpieczeństwo:**
- **UX:**
  - Minimalistyczny formularz z fokusem na szybkie logowanie
  - Automatyczne przekierowanie do dashboard po udanym logowaniu
  - Zapamiętanie ostatniego username (localStorage, opcjonalnie)
  - Czytelne komunikaty błędów
- **Dostępność:**
  - Auto-focus na pole username przy załadowaniu strony
  - Obsługa Enter do wysłania formularza
  - Komunikaty błędów dostępne dla screen readerów
  - Wizualne wskaźniki stanu (focus, error)
- **Bezpieczeństwo:**
  - Hasło ukryte w polu typu `password`
  - Token sesji przechowywany w bezpieczny sposób (HttpOnly cookie lub localStorage z odpowiednimi zabezpieczeniami)
  - Rate limiting po stronie backendu (zapobieganie brute force)
  - Brak szczegółowych komunikatów o błędach (np. "Nieprawidłowy username" vs "Nieprawidłowe dane logowania")

**Mapowanie do API:**
- `POST /api/auth/login` - wysłanie danych logowania
- Obsługa odpowiedzi: `200 OK` (sukces z tokenem), `400 Bad Request` (brak danych), `401 Unauthorized` (błędne dane)

---

### 2.3. Widok dashboardu (`/dashboard`)

**Nazwa widoku:** Dashboard View (Ekran główny)  
**Ścieżka:** `/dashboard` (domyślna dla zalogowanych użytkowników)  
**Główny cel:** Prezentacja aktualnego stanu maszyny i umożliwienie sterowania (FR-04 do FR-14, US-005 do US-014)

**Kluczowe informacje do wyświetlenia:**
1. **Status połączenia** - wskaźnik online/offline (FR-05, US-006)
2. **Trzy temperatury** - aktualne odczyty z czujników (FR-04, US-005)
3. **Czas ostatniej aktualizacji** - timestamp ostatniego odczytu (FR-06, US-007)
4. **Kontrolki sterowania:**
   - Przełącznik ON/OFF (FR-07, US-008)
   - Regulator serwa 0-100 (FR-08, US-009)
5. **Potwierdzenia komend** - wizualne feedback po wykonaniu komend (FR-11)
6. **Komunikaty błędów** - obsługa błędów komunikacji (FR-10, US-011)

**Kluczowe komponenty widoku:**

#### 2.3.1. **DeviceStatusComponent**
- Wyświetla status online/offline z wizualnym wskaźnikiem (ikona, kolor)
- Automatyczna aktualizacja statusu na podstawie danych z API
- **Stany:**
  - Online: zielony wskaźnik, tekst "Online"
  - Offline: czerwony/szary wskaźnik, tekst "Offline"
  - Ładowanie: animowany wskaźnik, tekst "Sprawdzanie połączenia..."

#### 2.3.2. **TemperatureDisplayComponent**
- Wyświetla trzy wartości temperatur w czytelny sposób
- **Format prezentacji:**
  - Duże, czytelne liczby z jednostką °C
  - Etykiety: "Temperatura 1", "Temperatura 2", "Temperatura 3"
  - Wizualne wskaźniki (ikony termometrów, kolory)
- **Obsługa stanów:**
  - Prawidłowa wartość: wyświetlenie liczby (np. "25.5°C")
  - Błąd czujnika (null): wyświetlenie "Błąd czujnika" lub "N/A"
  - Brak danych: wyświetlenie "Brak danych"
- **Layout:** Grid lub flexbox, responsywny (3 kolumny na desktop, 1 kolumna na mobile)

#### 2.3.3. **LastUpdateComponent**
- Wyświetla czas ostatniej aktualizacji danych
- **Format:** "Ostatnia aktualizacja: DD.MM.YYYY HH:MM:SS" lub relatywny czas ("2 sekundy temu")
- Automatyczna aktualizacja przy każdym nowym odczycie
- Wizualne wyróżnienie gdy dane są stare (>10s)

#### 2.3.4. **PowerControlComponent**
- Przełącznik ON/OFF maszyny
- **Elementy:**
  - Toggle switch (przełącznik) z etykietami "WŁ" / "WYŁ"
  - Wizualny stan (aktywny/nieaktywny)
  - Wskaźnik ładowania podczas wysyłania komendy
  - Potwierdzenie wykonania (checkmark, komunikat "Komenda wykonana")
- **Zachowanie:**
  - Blokada gdy status = offline (disabled, wizualnie wyszarzony)
  - Wysyłanie komendy: `POST /api/commands/power-on` lub `POST /api/commands/power-off`
  - Polling statusu komendy: `GET /api/commands/status/:commandId` (co 1s przez max 5s)
  - Wyświetlanie błędu jeśli brak ACK w czasie 5s

#### 2.3.5. **ServoControlComponent**
- Regulator wartości serwa w zakresie 0-100
- **Elementy:**
  - Slider (suwak) z zakresem 0-100
  - Pole numeryczne do precyzyjnego wprowadzenia wartości
  - Etykieta z aktualną wartością (np. "75%")
  - Przycisk "Ustaw" do wysłania komendy
  - Wskaźnik ładowania i potwierdzenie wykonania
- **Zachowanie:**
  - Walidacja wartości (0-100, liczby całkowite lub z 1 miejscem po przecinku)
  - Blokada gdy status = offline
  - Wysyłanie komendy: `POST /api/commands/servo` z wartością
  - Polling statusu komendy jak w PowerControlComponent
  - Wyświetlanie błędu walidacji (wartość poza zakresem)

#### 2.3.6. **CommandFeedbackComponent**
- Wyświetla potwierdzenia i błędy komend
- **Stany:**
  - Sukces: zielony checkmark, komunikat "Komenda wykonana pomyślnie"
  - Błąd: czerwony X, komunikat błędu (np. "Nie udało się wysłać komendy", "Urządzenie offline")
  - Oczekiwanie: animowany spinner, komunikat "Wysyłanie komendy..."
- **Zachowanie:**
  - Automatyczne ukrycie po 5 sekundach (dla sukcesu)
  - Trwałe wyświetlanie błędów (do czasu ponownej próby)
  - Pozycjonowanie: toast notification lub inline message

#### 2.3.7. **ErrorBannerComponent**
- Wyświetla ogólne błędy komunikacji z backendem
- **Przypadki użycia:**
  - Błąd połączenia z API (network error)
  - Błąd autoryzacji (401 Unauthorized) - przekierowanie do logowania
  - Błąd serwera (500 Internal Server Error)
- **Zachowanie:**
  - Wyświetlanie na górze ekranu (banner)
  - Możliwość zamknięcia (dismiss)
  - Automatyczne przekierowanie przy 401

#### 2.3.8. **UserMenuComponent**
- Menu użytkownika z opcją wylogowania
- **Elementy:**
  - Wyświetlenie username (opcjonalnie)
  - Przycisk "Wyloguj" (FR-02, US-003)
- **Zachowanie:**
  - Wylogowanie: `POST /api/auth/logout`
  - Przekierowanie do `/login` po wylogowaniu
  - Czyszczenie tokenu sesji

**UX, dostępność i bezpieczeństwo:**
- **UX:**
  - Hierarchia informacji: status na górze, temperatury w środku, sterowanie na dole
  - Automatyczne odświeżanie danych co 5s bez przerywania pracy użytkownika (FR-12, US-014)
  - Wizualne wskaźniki stanu (kolory, ikony, animacje)
  - Responsywny layout (mobile-first)
  - Smooth transitions przy zmianie stanu
  - Loading states dla wszystkich akcji asynchronicznych
- **Dostępność:**
  - Semantyczne HTML5 (header, main, section, button)
  - ARIA labels dla wszystkich interaktywnych elementów
  - Obsługa nawigacji klawiaturą (Tab, Enter, Space)
  - Focus management (focus trap w modalach, focus na akcji po wykonaniu)
  - Screen reader support (aria-live regions dla dynamicznych zmian)
  - Kontrast kolorów WCAG 2.1 AA (nie tylko kolor do przekazywania informacji)
- **Bezpieczeństwo:**
  - Wszystkie żądania API z tokenem autoryzacji w headerze
  - Automatyczne przekierowanie do logowania przy 401
  - Walidacja danych przed wysłaniem do API
  - Sanityzacja danych wyświetlanych (XSS protection przez Angular)
  - CSRF protection

**Mapowanie do API:**
- `GET /api/device-state` - polling co 5s (FR-12)
- `POST /api/commands/power-on` - włączenie maszyny
- `POST /api/commands/power-off` - wyłączenie maszyny
- `POST /api/commands/servo` - ustawienie serwa
- `GET /api/commands/status/:commandId` - sprawdzenie statusu komendy (polling po wysłaniu)
- `POST /api/auth/logout` - wylogowanie

**Obsługa stanów brzegowych:**
- **Brak danych (pierwsze uruchomienie):** Wyświetlenie komunikatu "Brak danych z urządzenia" (US-013)
- **Urządzenie offline:** Blokada kontrolek sterowania, komunikat "Urządzenie offline - sterowanie niedostępne" (FR-09, US-010)
- **Błąd czujnika (null):** Wyświetlenie "Błąd czujnika" zamiast wartości temperatury
- **Timeout komendy:** Wyświetlenie błędu "Komenda nie została wykonana w oczekiwanym czasie" (US-011)
- **Błąd sieci:** Wyświetlenie bannera błędu z możliwością ponowienia (US-011)

---

### 2.4. Widok błędu 404 (`/404`)

**Nazwa widoku:** Not Found View  
**Ścieżka:** `/404` (catch-all dla nieistniejących tras)  
**Główny cel:** Obsługa nieprawidłowych adresów URL

**Kluczowe informacje do wyświetlenia:**
- Komunikat "Strona nie została znaleziona"
- Link powrotu do dashboardu (dla zalogowanych) lub logowania

**Kluczowe komponenty widoku:**
- **NotFoundComponent** - prosty widok z komunikatem i linkiem powrotu

**UX, dostępność i bezpieczeństwo:**
- Prosty, czytelny komunikat
- Łatwa nawigacja powrotna
- Obsługa klawiatury

---

### 2.5. Widok błędu sesji (implicit)

**Nazwa widoku:** Session Expired Handler (nie jest osobnym widokiem, ale logiką przekierowania)  
**Ścieżka:** N/A (automatyczne przekierowanie)  
**Główny cel:** Obsługa wygasłych sesji i nieautoryzowanych żądań (FR-03, US-012)

**Zachowanie:**
- Interceptor HTTP przechwytuje odpowiedzi `401 Unauthorized`
- Automatyczne przekierowanie do `/login` z komunikatem "Sesja wygasła. Zaloguj się ponownie."
- Opcjonalnie: zapamiętanie poprzedniej trasy dla powrotu po zalogowaniu

**UX, dostępność i bezpieczeństwo:**
- Czytelny komunikat o przyczynie przekierowania
- Płynne przejście bez utraty kontekstu (jeśli możliwe)
- Bezpieczne czyszczenie tokenu sesji

---

## 3. Mapa podróży użytkownika

### 3.1. Podróż nowego użytkownika (rejestracja → dashboard)

**Krok 1: Wejście do aplikacji**
- Użytkownik otwiera aplikację w przeglądarce
- Routing sprawdza autoryzację → brak sesji → przekierowanie do `/login`

**Krok 2: Rejestracja**
- Użytkownik klika "Nie masz konta? Zarejestruj się" → przejście do `/register`
- Wypełnienie formularza: username, password, deviceId
- Walidacja w czasie rzeczywistym
- Kliknięcie "Zarejestruj się"
- Sukces: `201 Created` → automatyczne przekierowanie do `/login` z komunikatem "Rejestracja zakończona sukcesem. Zaloguj się."

**Krok 3: Logowanie**
- Użytkownik wypełnia formularz logowania (username, password)
- Kliknięcie "Zaloguj się"
- Sukces: `200 OK` z tokenem → zapisanie tokenu → przekierowanie do `/dashboard`

**Krok 4: Dashboard (pierwsze uruchomienie)**
- Wyświetlenie dashboardu z komunikatem "Brak danych z urządzenia" (jeśli ESP32 jeszcze nie wysłało danych)
- Automatyczne rozpoczęcie polling `GET /api/device-state` co 5s
- Po pojawieniu się danych: przejście do normalnego widoku z temperaturami i kontrolkami

**Krok 5: Sterowanie (przykład)**
- Użytkownik widzi status "Online" i temperatury
- Kliknięcie przełącznika ON/OFF → wysłanie komendy → wyświetlenie "Wysyłanie komendy..."
- Polling statusu komendy co 1s
- Po ACK: wyświetlenie "Komenda wykonana pomyślnie" → ukrycie po 5s

---

### 3.2. Podróż istniejącego użytkownika (logowanie → dashboard)

**Krok 1: Wejście do aplikacji**
- Użytkownik otwiera aplikację → brak sesji → `/login`

**Krok 2: Logowanie**
- Wypełnienie formularza i zalogowanie
- Przekierowanie do `/dashboard`

**Krok 3: Dashboard (normalne użycie)**
- Wyświetlenie aktualnych danych (jeśli dostępne)
- Automatyczne odświeżanie co 5s
- Użytkownik może sterować maszyną (ON/OFF, serwo)
- Wylogowanie przez menu użytkownika → `/login`

---

### 3.3. Podróż użytkownika z wygasłą sesją

**Krok 1: Aktywna sesja**
- Użytkownik jest na `/dashboard`, sesja aktywna

**Krok 2: Wygasła sesja**
- Sesja wygasa (24h timeout)
- Następne żądanie API zwraca `401 Unauthorized`
- Interceptor przechwytuje błąd → przekierowanie do `/login` z komunikatem "Sesja wygasła. Zaloguj się ponownie."

**Krok 3: Ponowne logowanie**
- Użytkownik loguje się ponownie
- Przekierowanie do `/dashboard` (lub zapamiętana poprzednia trasa)

---

### 3.4. Podróż użytkownika z urządzeniem offline

**Krok 1: Normalne działanie**
- Użytkownik na `/dashboard`, urządzenie online
- Widoczne temperatury, aktywne kontrolki sterowania

**Krok 2: Urządzenie przechodzi w offline**
- ESP32 przestaje wysyłać dane (lub timeout >10s)
- Polling `GET /api/device-state` zwraca `status: "offline"`
- UI aktualizuje status na "Offline" (czerwony wskaźnik)
- Kontrolki sterowania są automatycznie zablokowane (disabled)
- Wyświetlenie komunikatu "Urządzenie offline - sterowanie niedostępne"

**Krok 3: Próba sterowania (zablokowana)**
- Użytkownik próbuje kliknąć przełącznik ON/OFF → nic się nie dzieje (disabled)
- Użytkownik próbuje ustawić serwo → slider zablokowany, przycisk "Ustaw" disabled

**Krok 4: Powrót do online**
- ESP32 ponownie wysyła dane
- Status zmienia się na "Online" (zielony wskaźnik)
- Kontrolki sterowania są automatycznie odblokowane
- Komunikat "Urządzenie offline" znika

---

## 4. Układ i struktura nawigacji

### 4.1. Struktura nawigacji

Aplikacja wykorzystuje **prostą strukturę nawigacji liniowej** bez złożonych menu, zgodnie z wymaganiem "jeden ekran główny" (FR-13).

**Publiczne trasy (bez autoryzacji):**
- `/login` - ekran logowania (domyślna dla nieautoryzowanych)
- `/register` - ekran rejestracji
- `/404` - strona błędu 404

**Chronione trasy (wymagają autoryzacji):**
- `/dashboard` - ekran główny (domyślna dla autoryzowanych)
- `/` - przekierowanie do `/dashboard` (dla autoryzowanych) lub `/login` (dla nieautoryzowanych)

**Automatyczne przekierowania:**
- Nieautoryzowany dostęp do chronionych tras → `/login`
- Autoryzowany dostęp do `/login` lub `/register` → `/dashboard`
- Nieistniejące trasy → `/404`

### 4.2. Komponenty nawigacji

#### 4.2.1. **Router Guard (AuthGuard)**
- Sprawdza obecność i ważność tokenu sesji
- Blokuje dostęp do chronionych tras bez autoryzacji
- Przekierowuje do `/login` z komunikatem

#### 4.2.2. **Navigation Links (w widokach publicznych)**
- Link "Nie masz konta? Zarejestruj się" w `/login` → `/register`
- Link "Masz już konto? Zaloguj się" w `/register` → `/login`

#### 4.2.3. **User Menu (w dashboard)**
- Przycisk wylogowania w menu użytkownika (opcjonalnie: dropdown)
- Po wylogowaniu: przekierowanie do `/login`

### 4.3. Breadcrumbs i wskaźniki lokalizacji

**Brak breadcrumbs** - aplikacja jest zbyt prosta, nie wymaga breadcrumbs (jeden ekran główny).

**Wskaźniki lokalizacji:**
- Aktywna trasa podświetlona w menu (jeśli menu istnieje)
- Tytuł strony w `<title>` i `<h1>` dla każdego widoku

### 4.4. Mobile navigation

**Responsywność:**
- Wszystkie elementy nawigacji responsywne (mobile-first)
- Menu użytkownika: hamburger menu na mobile (jeśli potrzebne)
- Pełna szerokość przycisków na mobile dla łatwego kliknięcia

---

## 5. Kluczowe komponenty

### 5.1. Komponenty współdzielone (Shared Components)

#### 5.1.1. **LoadingIndicatorComponent**
- **Cel:** Wyświetlanie stanu ładowania
- **Użycie:** Formularze, przyciski akcji, polling danych
- **Warianty:** Spinner, progress bar, skeleton screen
- **Dostępność:** ARIA label "Ładowanie..."

#### 5.1.2. **ErrorMessageComponent**
- **Cel:** Wyświetlanie komunikatów błędów
- **Użycie:** Walidacja formularzy, błędy API, błędy komend
- **Warianty:** Inline (przy polu formularza), Banner (góra ekranu), Toast (powiadomienie)
- **Dostępność:** ARIA role="alert", aria-live="assertive"

#### 5.1.3. **SuccessMessageComponent**
- **Cel:** Wyświetlanie komunikatów sukcesu
- **Użycie:** Potwierdzenia akcji (rejestracja, komendy)
- **Warianty:** Toast notification, inline message
- **Zachowanie:** Automatyczne ukrycie po 5s

#### 5.1.4. **ButtonComponent**
- **Cel:** Spójny przycisk w całej aplikacji
- **Warianty:** Primary, Secondary, Danger, Disabled
- **Stany:** Default, Hover, Active, Disabled, Loading
- **Dostępność:** ARIA labels, keyboard support

#### 5.1.5. **InputComponent**
- **Cel:** Spójne pole formularza
- **Warianty:** Text, Password, Number, Email
- **Funkcje:** Walidacja, komunikaty błędów, ikony
- **Dostępność:** Label, aria-describedby, aria-invalid

#### 5.1.6. **CardComponent**
- **Cel:** Kontener dla sekcji treści (np. temperatury, sterowanie)
- **Użycie:** Dashboard do grupowania elementów
- **Warianty:** Default, Highlighted, Bordered

### 5.2. Komponenty serwisowe (Service Components)

#### 5.2.1. **AuthService**
- **Cel:** Zarządzanie autoryzacją i sesją
- **Funkcje:**
  - `login(username, password)` - logowanie
  - `register(username, password, deviceId)` - rejestracja
  - `logout()` - wylogowanie
  - `isAuthenticated()` - sprawdzenie autoryzacji
  - `getToken()` - pobranie tokenu
  - `getCurrentUser()` - pobranie danych użytkownika

#### 5.2.2. **DeviceStateService**
- **Cel:** Zarządzanie stanem urządzenia i polling danych
- **Funkcje:**
  - `getDeviceState()` - pobranie aktualnego stanu (jednorazowe)
  - `startPolling(interval: 5000)` - rozpoczęcie polling co 5s
  - `stopPolling()` - zatrzymanie polling
  - `getDeviceState$()` - Observable dla subskrypcji zmian
- **Zachowanie:**
  - Automatyczne zatrzymanie polling gdy urządzenie offline (opcjonalnie)
  - Obsługa błędów i retry logic
  - Emitowanie zmian przez RxJS Observable

#### 5.2.3. **CommandService**
- **Cel:** Wysyłanie komend i sprawdzanie statusu
- **Funkcje:**
  - `sendPowerOn()` - wysłanie komendy ON
  - `sendPowerOff()` - wysłanie komendy OFF
  - `sendServoCommand(value: number)` - wysłanie komendy serwa
  - `getCommandStatus(commandId: number)` - sprawdzenie statusu komendy
  - `pollCommandStatus(commandId: number, maxAttempts: number)` - polling statusu z timeout
- **Zachowanie:**
  - Walidacja przed wysłaniem (status offline, zakres wartości)
  - Automatyczny polling statusu po wysłaniu komendy
  - Obsługa timeout (5s) i błędów

#### 5.2.4. **ErrorHandlerService**
- **Cel:** Centralna obsługa błędów
- **Funkcje:**
  - `handleError(error: HttpErrorResponse)` - obsługa błędów HTTP
  - `showError(message: string)` - wyświetlenie błędu w UI
  - `handle401()` - obsługa wygasłej sesji (przekierowanie)
- **Zachowanie:**
  - Interceptor HTTP przechwytuje wszystkie błędy
  - Automatyczne przekierowanie przy 401
  - Logowanie błędów (opcjonalnie)

### 5.3. Komponenty pomocnicze (Utility Components)

#### 5.3.1. **HttpInterceptor**
- **Cel:** Automatyczne dodawanie tokenu do żądań API
- **Funkcje:**
  - Dodawanie `Authorization: Bearer <token>` do wszystkich żądań
  - Przechwytywanie odpowiedzi `401` i przekierowanie do logowania
  - Obsługa błędów sieciowych

#### 5.3.2. **RouteGuard**
- **Cel:** Ochrona tras przed nieautoryzowanym dostępem
- **Funkcje:**
  - Sprawdzenie autoryzacji przed wejściem na trasę
  - Przekierowanie do `/login` jeśli brak autoryzacji
  - Opcjonalnie: zapamiętanie poprzedniej trasy

#### 5.3.3. **TimeFormatterPipe**
- **Cel:** Formatowanie czasu (timestamp → czytelny format)
- **Użycie:** Wyświetlanie `lastUpdate` w dashboard
- **Formaty:** "DD.MM.YYYY HH:MM:SS" lub relatywny czas

---

## 6. Mapowanie historyjek użytkownika do architektury UI

| ID | Historyjka użytkownika | Widok | Komponent | API Endpoint |
|---|---|---|---|---|
| US-001 | Rejestracja operatora | `/register` | RegistrationFormComponent | `POST /api/auth/register` |
| US-002 | Logowanie operatora | `/login` | LoginFormComponent | `POST /api/auth/login` |
| US-003 | Wylogowanie operatora | `/dashboard` | UserMenuComponent | `POST /api/auth/logout` |
| US-004 | Ochrona dostępu | Wszystkie chronione | AuthGuard, HttpInterceptor | Wszystkie chronione endpointy |
| US-005 | Podgląd trzech temperatur | `/dashboard` | TemperatureDisplayComponent | `GET /api/device-state` |
| US-006 | Status online/offline | `/dashboard` | DeviceStatusComponent | `GET /api/device-state` |
| US-007 | Czas ostatniej aktualizacji | `/dashboard` | LastUpdateComponent | `GET /api/device-state` |
| US-008 | Sterowanie ON/OFF z potwierdzeniem | `/dashboard` | PowerControlComponent | `POST /api/commands/power-on/off`, `GET /api/commands/status/:id` |
| US-009 | Sterowanie serwem z potwierdzeniem | `/dashboard` | ServoControlComponent | `POST /api/commands/servo`, `GET /api/commands/status/:id` |
| US-010 | Blokada sterowania offline | `/dashboard` | PowerControlComponent, ServoControlComponent | Logika po stronie UI + walidacja backendu |
| US-011 | Obsługa błędów komend | `/dashboard` | CommandFeedbackComponent, ErrorBannerComponent | Wszystkie endpointy komend |
| US-012 | Utrata sesji i ponowne logowanie | Implicit (interceptor) | HttpInterceptor, AuthGuard | Wszystkie chronione endpointy |
| US-013 | Pierwsze uruchomienie bez danych | `/dashboard` | TemperatureDisplayComponent (empty state) | `GET /api/device-state` |
| US-014 | Odświeżanie danych bez blokowania UI | `/dashboard` | DeviceStateService (polling) | `GET /api/device-state` |

---

## 7. Mapowanie wymagań funkcjonalnych na elementy UI

| ID | Wymaganie funkcjonalne | Element UI | Implementacja |
|---|---|---|---|
| FR-01 | Rejestracja użytkownika | RegistrationFormComponent | Formularz z polami username, password, deviceId |
| FR-02 | Logowanie i wylogowanie | LoginFormComponent, UserMenuComponent | Formularz logowania + przycisk wylogowania |
| FR-03 | Ochrona autoryzacją | AuthGuard, HttpInterceptor | Blokada tras + dodawanie tokenu do żądań |
| FR-04 | Prezentacja 3 temperatur | TemperatureDisplayComponent | Wyświetlenie temperature1, temperature2, temperature3 |
| FR-05 | Status online/offline | DeviceStatusComponent | Wizualny wskaźnik na podstawie `status` z API |
| FR-06 | Czas ostatniej aktualizacji | LastUpdateComponent | Wyświetlenie `lastUpdate` z formatowaniem |
| FR-07 | Komenda ON/OFF z ACK | PowerControlComponent | Toggle switch + polling statusu komendy |
| FR-08 | Komenda serwa z ACK | ServoControlComponent | Slider + polling statusu komendy |
| FR-09 | Blokada sterowania offline | PowerControlComponent, ServoControlComponent | Disabled state gdy `status === "offline"` |
| FR-10 | Obsługa błędów komunikacji | ErrorBannerComponent, CommandFeedbackComponent | Wyświetlanie komunikatów błędów |
| FR-11 | Potwierdzenie wykonania komendy | CommandFeedbackComponent | Wyświetlenie sukcesu po ACK |
| FR-12 | Stabilny polling co 5s | DeviceStateService | RxJS interval + unsubscribe |
| FR-13 | Minimalistyczny, mobile-first UI | Wszystkie komponenty | Responsywny design, jeden ekran główny |
| FR-14 | Brak historii (tylko aktualny stan) | TemperatureDisplayComponent | Wyświetlanie tylko aktualnych wartości |

---

## 8. Rozwiązanie punktów bólu użytkownika

### 8.1. Problem: Niepewność co do stanu urządzenia
**Rozwiązanie:**
- Wyraźny wizualny wskaźnik statusu (online/offline) z kolorami
- Czas ostatniej aktualizacji dla oceny świeżości danych
- Automatyczne odświeżanie danych co 5s bez potrzeby ręcznego odświeżania

### 8.2. Problem: Niepewność czy komenda została wykonana
**Rozwiązanie:**
- Wizualne potwierdzenie wysłania komendy (loading state)
- Polling statusu komendy z wyświetleniem ACK
- Komunikat sukcesu po wykonaniu komendy
- Komunikat błędu jeśli brak ACK w czasie 5s

### 8.3. Problem: Próba sterowania gdy urządzenie offline
**Rozwiązanie:**
- Automatyczna blokada kontrolek sterowania gdy status = offline
- Wyraźny komunikat "Urządzenie offline - sterowanie niedostępne"
- Wizualne wyszarzenie zablokowanych kontrolek

### 8.4. Problem: Utrata sesji podczas pracy
**Rozwiązanie:**
- Automatyczne wykrycie wygasłej sesji (401)
- Przekierowanie do logowania z komunikatem "Sesja wygasła"
- Możliwość szybkiego ponownego logowania

### 8.5. Problem: Błędy komunikacji bez informacji
**Rozwiązanie:**
- Wyświetlanie czytelnych komunikatów błędów w języku polskim
- Różnicowanie typów błędów (sieć, serwer, walidacja)
- Możliwość ponowienia akcji (retry)

### 8.6. Problem: Brak danych przy pierwszym uruchomieniu
**Rozwiązanie:**
- Wyświetlenie komunikatu "Brak danych z urządzenia" zamiast pustego ekranu
- Automatyczne przejście do normalnego widoku po pojawieniu się danych
- Wskaźnik ładowania podczas oczekiwania na dane

---

## 9. Uwagi implementacyjne

### 9.1. Polling Strategy
- **Device State Polling:** Co 5 sekund (zgodnie z FR-12)
- **Command Status Polling:** Co 1 sekundę przez maksymalnie 5 sekund po wysłaniu komendy
- **Zatrzymanie polling:** Gdy komponent jest zniszczony (unsubscribe w `ngOnDestroy`)
- **Obsługa błędów:** Retry logic z exponential backoff (opcjonalnie)

### 9.2. State Management
- **Lokalny state:** Komponenty zarządzają własnym stanem (Angular reactive forms, local state)
- **Shared state:** DeviceStateService używa RxJS BehaviorSubject do współdzielenia stanu między komponentami
- **Session state:** Token przechowywany w localStorage lub HttpOnly cookie (do decyzji w implementacji)

### 9.3. Performance
- **Lazy loading:** Moduły ładowane na żądanie (jeśli aplikacja będzie rozbudowana)
- **OnPush change detection:** Użycie OnPush strategy dla lepszej wydajności
- **Debouncing:** Dla inputów (np. slider serwa) - wysyłanie komendy po zakończeniu zmiany, nie podczas

### 9.4. Testing Considerations
- **Unit tests:** Wszystkie komponenty i serwisy
- **Integration tests:** Przepływ rejestracja → logowanie → dashboard
- **E2E tests:** Główne scenariusze użytkownika (cypress/playwright)

---

## 10. Podsumowanie

Architektura UI została zaprojektowana wokół **jednego głównego ekranu (dashboard)**, który prezentuje wszystkie kluczowe informacje i funkcje sterowania. Aplikacja wykorzystuje **prostą strukturę nawigacji** z automatycznym przekierowaniem do logowania dla nieautoryzowanych użytkowników.

**Kluczowe cechy architektury:**
- ✅ Minimalistyczny, mobile-first design (FR-13)
- ✅ Jeden ekran główny z wszystkimi funkcjami (FR-13)
- ✅ Automatyczne odświeżanie danych co 5s (FR-12)
- ✅ Wizualne potwierdzenia komend z ACK (FR-11)
- ✅ Blokada sterowania offline (FR-09)
- ✅ Pełna obsługa autoryzacji i sesji (FR-01, FR-02, FR-03)
- ✅ Obsługa wszystkich stanów brzegowych i błędów (FR-10, US-011, US-013)

Architektura jest **zgodna z planem API** i spełnia wszystkie wymagania z PRD oraz historyjki użytkownika.
