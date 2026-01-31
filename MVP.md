# Aplikacja - System Zdalnego Monitorowania i Sterowania Maszyną (MVP)

## Główny problem
Maszyna przemysłowa wymaga ciągłej pracy 24/7, co obecnie wymaga stałej obecności pracownika w miejscu pracy. Brak możliwości zdalnego monitorowania i sterowania maszyną uniemożliwia efektywne zarządzanie procesem produkcyjnym poza godzinami pracy oraz w sytuacjach, gdy pracownik nie może być fizycznie obecny przy urządzeniu. To powoduje zwiększone koszty operacyjne, ograniczenia w elastyczności pracy oraz potencjalne przestoje w przypadku konieczności natychmiastowej interwencji.

## Najmniejszy zestaw funkcjonalności
MVP obejmuje następujące podstawowe funkcjonalności:

1. **Komunikacja ESP32 z backendem**
   - Odczyt 3 temperatur z czujników podłączonych do ESP32
   - Automatyczne wysyłanie odczytów temperatury do backendu w regularnych odstępach czasu
   - Status połączenia maszyny (online/offline)

2. **Aplikacja webowa - podgląd danych**
   - Wyświetlanie aktualnych odczytów temperatury z trzech czujników w czasie rzeczywistym
   - Wizualizacja danych (np. wykresy, wartości liczbowe)
   - Status połączenia z maszyną

3. **Aplikacja webowa - sterowanie maszyną**
   - Włącznik/wyłącznik maszyny (jedna funkcja przełączająca stan)
   - Liniowe sterowanie serwem (regulacja wartości w zakresie 0-100% lub podobnym), które kontroluje fizyczny przełącznik podłączony do maszyny
   - Wizualne potwierdzenie wykonania komendy

4. **System logowania i autoryzacji użytkowników**
   - Rejestracja kont użytkowników
   - Logowanie/wylogowanie użytkowników
   - Zarządzanie sesjami użytkowników
   - Ochrona endpointów API wymagająca zalogowania

5. **Backend API**
   - Odbieranie danych z ESP32
   - Przechowywanie aktualnych odczytów
   - Obsługa komend sterujących (włącz/wyłącz, ustawienie wartości serwa)
   - Udostępnianie danych i komend dla frontendu oraz ESP32
   - Autoryzacja żądań API

## Co NIE wchodzi w zakres MVP
Następujące funkcjonalności są planowane na późniejsze wersje i nie wchodzą w skład MVP:

1. **Przypisywanie maszyn do użytkowników**
   - System numerów seryjnych maszyn
   - Przypisywanie maszyn do kont użytkowników
   - Wielodostępność (jeden użytkownik - wiele maszyn, wiele użytkowników - jedna maszyna)

2. **Zaawansowane funkcje**
   - Historia odczytów (archiwizacja danych)
   - Powiadomienia/alarmy (np. przekroczenie temperatury)
   - Raporty i analityka
   - Konfiguracja ustawień maszyny przez interfejs
   - Wielojęzyczność
   - Aplikacja mobilna

3. **Bezpieczeństwo i skalowalność**
   - Szyfrowanie komunikacji (HTTPS)
   - Zaawansowane mechanizmy bezpieczeństwa
   - Skalowanie na wiele maszyn jednocześnie
   - Backup danych

## Kryteria sukcesu
MVP będzie uznane za sukces, gdy:

1. **Funkcjonalność podstawowa**
   - Użytkownik może się zarejestrować i zalogować do systemu
   - ESP32 stabilnie odczytuje i przesyła 3 temperatury do backendu
   - Aplikacja webowa wyświetla aktualne odczyty temperatury w czasie rzeczywistym (po zalogowaniu)
   - Użytkownik może zdalnie włączyć/wyłączyć maszynę z aplikacji webowej
   - Użytkownik może zdalnie sterować serwem (regulować wartość liniowo) z aplikacji webowej
   - Komendy są wykonywane przez maszynę w czasie rzeczywistym (opóźnienie < 5 sekund)
   - Dostęp do funkcji sterowania wymaga zalogowania

2. **Niezawodność**
   - System działa stabilnie przez minimum 24 godziny bez przerwy
   - Połączenie ESP32 z backendem jest odporne na krótkotrwałe przerwy w sieci WiFi
   - Dane są aktualizowane regularnie (co 5-10 sekund)

3. **Użyteczność**
   - Interfejs jest intuicyjny i pozwala na szybkie sprawdzenie stanu maszyny
   - Sterowanie maszyną jest proste i jednoznaczne
   - Aplikacja działa na przeglądarce desktopowej (Chrome, Firefox, Edge)

4. **Cel biznesowy**
   - Pracownik może zdalnie monitorować i sterować maszyną z domu
   - Maszyna może działać 24/7 z możliwością zdalnej obsługi
   - System jest gotowy do demonstracji potencjalnym klientom jako proof of concept
