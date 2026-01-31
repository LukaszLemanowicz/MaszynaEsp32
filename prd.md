# Dokument wymagań produktu (PRD) - System Zdalnego Monitorowania i Sterowania Maszyną
## 1. Przegląd produktu
Aplikacja umożliwia zdalny podgląd stanu maszyny przemysłowej oraz podstawowe sterowanie z poziomu przeglądarki. MVP jest ukierunkowane na pojedynczego operatora i jeden fizyczny egzemplarz maszyny z ESP32. System działa w modelu: ESP32 cyklicznie wysyła dane do backendu, frontend pobiera je przez polling co 5 s i umożliwia wysyłanie komend sterujących.

Zakres techniczny MVP:
- Frontend: Angular + TypeScript.
- Backend: Node.js.
- Baza danych: PostgreSQL.
- Struktura repozytorium: `esp32/`, `frontend/`, `backend/`.
- Hosting: lokalne demo; docelowo publiczny serwer. Frontend i backend na jednym serwerze.

Założenia i zależności:
- ESP32 ma zahardcodowane `deviceId`.
- Baza przechowuje wyłącznie aktualny stan oraz użytkowników powiązanych z `deviceId`.
- Brak historii odczytów w MVP.
- Komunikacja FE–BE: polling co 5 s.
- Komunikacja ESP32–BE: cykliczne wysyłanie odczytów i komend.
- W trybie offline sterowanie jest blokowane w UI.

Niezamknięte decyzje do doprecyzowania w implementacji:
- Definicja statusu online/offline i timeoutu uznania urządzenia za offline.
- Dokładny format endpointów API i schemat ACK.
- Wymagania dot. polityki haseł i sposobu haszowania w MVP.

## 2. Problem użytkownika
Operator musi być fizycznie przy maszynie 24/7, aby monitorować temperatury i reagować na potrzeby sterowania. Brak zdalnego podglądu i sterowania powoduje:
- zwiększone koszty operacyjne (stała obecność pracownika),
- ograniczoną elastyczność pracy poza godzinami,
- ryzyko przestojów w sytuacjach wymagających natychmiastowej interwencji,
- brak bieżącej informacji o stanie urządzenia poza miejscem pracy.

## 3. Wymagania funkcjonalne
FR-01 Rejestracja użytkownika (jedna rola: operator) z powiązaniem do `deviceId`.
FR-02 Logowanie i wylogowanie użytkownika.
FR-03 Ochrona wszystkich funkcji podglądu i sterowania autoryzacją (brak dostępu bez zalogowania).
FR-04 Prezentacja trzech aktualnych temperatur w czasie rzeczywistym (polling co 5 s).
FR-05 Prezentacja statusu maszyny online/offline.
FR-06 Wyświetlanie czasu ostatniej aktualizacji danych z ESP32.
FR-07 Wysłanie komendy włącz/wyłącz maszynę oraz otrzymanie potwierdzenia ACK "OK".
FR-08 Wysłanie komendy ustawienia serwa w zakresie 0–100 (lub równoważnym) oraz otrzymanie ACK "OK".
FR-09 Blokada sterowania w UI, gdy maszyna jest offline.
FR-10 Obsługa błędów komunikacji: czytelny komunikat w UI przy braku odpowiedzi lub błędzie komendy.
FR-11 Potwierdzenie wykonania komendy w UI po ACK "OK".
FR-12 Stabilny polling danych co 5 s bez potrzeby ręcznego odświeżania.
FR-13 Minimalistyczny, estetyczny interfejs, mobile-first, jeden ekran główny.
FR-14 Backend przechowuje wyłącznie bieżące odczyty i stan urządzenia, bez historii.

## 4. Granice produktu
W zakresie MVP:
- rejestracja i logowanie użytkownika,
- podgląd 3 temperatur w czasie rzeczywistym,
- status online/offline,
- sterowanie ON/OFF i serwem,
- potwierdzenie komend z ESP32,
- blokada sterowania offline,
- prezentacja czasu ostatniej aktualizacji.

Poza MVP:
- historia odczytów i archiwizacja,
- alarmy i powiadomienia,
- wiele maszyn i wiele ról użytkowników,
- zaawansowane bezpieczeństwo (np. reset hasła, SSO, MFA),
- skalowanie i wysokodostępna infrastruktura,
- aplikacja mobilna.

## 5. Historyjki użytkowników
- ID: US-001
  Tytuł: Rejestracja operatora
  Opis: Jako operator chcę utworzyć konto, aby uzyskać dostęp do podglądu i sterowania.
  Kryteria akceptacji:
  - Rejestracja wymaga podania loginu i hasła.
  - Po poprawnej rejestracji konto jest aktywne i powiązane z `deviceId`.
  - Próba rejestracji z istniejącym loginem zwraca czytelny komunikat błędu.

- ID: US-002
  Tytuł: Logowanie operatora
  Opis: Jako operator chcę się zalogować, aby korzystać z funkcji aplikacji.
  Kryteria akceptacji:
  - Poprawne dane logowania umożliwiają wejście do aplikacji.
  - Błędne dane logowania wyświetlają komunikat i nie logują użytkownika.

- ID: US-003
  Tytuł: Wylogowanie operatora
  Opis: Jako operator chcę się wylogować, aby zakończyć sesję.
  Kryteria akceptacji:
  - Wylogowanie kończy sesję i przekierowuje na ekran logowania.
  - Po wylogowaniu brak dostępu do podglądu i sterowania bez ponownego logowania.

- ID: US-004
  Tytuł: Ochrona dostępu do funkcji
  Opis: Jako operator chcę, aby tylko zalogowani użytkownicy mieli dostęp do podglądu i sterowania.
  Kryteria akceptacji:
  - Wejście na ekran główny bez aktywnej sesji wymaga logowania.
  - Endpointy API wymagają autoryzacji i odrzucają żądania nieautoryzowane.

- ID: US-005
  Tytuł: Podgląd trzech temperatur
  Opis: Jako operator chcę widzieć trzy aktualne temperatury, aby ocenić stan maszyny.
  Kryteria akceptacji:
  - Ekran główny pokazuje trzy wartości temperatur.
  - Wartości są aktualizowane co 5 s bez odświeżania strony.

- ID: US-006
  Tytuł: Status online/offline
  Opis: Jako operator chcę widzieć status połączenia z maszyną, aby wiedzieć czy mogę sterować.
  Kryteria akceptacji:
  - Status online/offline jest widoczny na ekranie głównym.
  - Przy braku danych przez zdefiniowany timeout status zmienia się na offline.

- ID: US-007
  Tytuł: Czas ostatniej aktualizacji
  Opis: Jako operator chcę widzieć czas ostatniej aktualizacji, aby ocenić świeżość danych.
  Kryteria akceptacji:
  - Na ekranie widoczny jest znacznik czasu ostatniego odczytu.
  - Znacznik aktualizuje się po każdym nowym odczycie z ESP32.

- ID: US-008
  Tytuł: Sterowanie ON/OFF z potwierdzeniem
  Opis: Jako operator chcę włączyć lub wyłączyć maszynę i otrzymać potwierdzenie wykonania.
  Kryteria akceptacji:
  - Kliknięcie przełącznika wysyła komendę ON/OFF do backendu.
  - Po otrzymaniu ACK "OK" UI pokazuje potwierdzenie wykonania.
  - Brak ACK w zdefiniowanym czasie skutkuje komunikatem błędu.

- ID: US-009
  Tytuł: Sterowanie serwem z potwierdzeniem
  Opis: Jako operator chcę ustawić wartość serwa, aby sterować przełącznikiem maszyny.
  Kryteria akceptacji:
  - UI umożliwia ustawienie wartości serwa w zakresie 0–100.
  - Komenda jest wysyłana do backendu i potwierdzana ACK "OK".
  - Wartość poza zakresem jest odrzucana z komunikatem walidacji.

- ID: US-010
  Tytuł: Blokada sterowania offline
  Opis: Jako operator chcę, aby sterowanie było zablokowane gdy urządzenie jest offline.
  Kryteria akceptacji:
  - Gdy status jest offline, kontrolki sterowania są nieaktywne.
  - UI wyświetla informację o braku łączności.

- ID: US-011
  Tytuł: Obsługa błędów komend
  Opis: Jako operator chcę otrzymać jasny komunikat w razie błędu wysłania komendy.
  Kryteria akceptacji:
  - Błąd komunikacji z backendem jest pokazany w UI.
  - Brak ACK lub błąd backendu nie zmienia widocznego stanu sterowania.

- ID: US-012
  Tytuł: Utrata sesji i ponowne logowanie
  Opis: Jako operator chcę zostać poproszony o ponowne logowanie, gdy sesja wygaśnie.
  Kryteria akceptacji:
  - Wygasła sesja skutkuje przekierowaniem do logowania.
  - Po ponownym logowaniu użytkownik wraca do ekranu głównego.

- ID: US-013
  Tytuł: Pierwsze uruchomienie bez danych
  Opis: Jako operator chcę widzieć informację, gdy nie ma jeszcze odczytów z urządzenia.
  Kryteria akceptacji:
  - Jeśli brak odczytów, UI pokazuje stan "brak danych".
  - Po pojawieniu się pierwszych danych UI przechodzi do normalnego widoku.

- ID: US-014
  Tytuł: Odświeżanie danych bez blokowania UI
  Opis: Jako operator chcę, aby odświeżanie danych nie przerywało pracy interfejsu.
  Kryteria akceptacji:
  - Polling co 5 s nie blokuje użycia kontrolek.
  - W trakcie odświeżania widoczny stan UI pozostaje spójny.

## 6. Metryki sukcesu
- Rejestracja i logowanie działają bez błędów w scenariuszu demo.
- Odczyty temperatur odświeżają się co 5 s.
- Komendy ON/OFF i serwa są wykonywane z ACK "OK" w czasie poniżej 5 s.
- UI blokuje sterowanie, gdy urządzenie jest offline.
- System działa stabilnie w trakcie demonstracji bez awarii i zawieszeń.
