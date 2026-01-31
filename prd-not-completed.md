<conversation_summary>
<decisions>
Zdefiniowano problem: konieczność fizycznej obecności operatora 24/7 i brak zdalnego monitoringu/sterowania.
Ustalono cel MVP: zdalny podgląd 3 temperatur i sterowanie ON/OFF + serwo w czasie rzeczywistym (polling co 5 s).
Określono użytkownika docelowego: pojedyncza rola operatora.
Zatwierdzono zakres funkcji MVP: rejestracja/logowanie, podgląd 3 temperatur, status online/offline, sterowanie ON/OFF i serwem, ACK „OK” z ESP32, blokada sterowania offline, czas ostatniej aktualizacji.
Zdefiniowano zakres poza MVP: historia odczytów, alarmy, multi‑device/multi‑user, zaawansowane bezpieczeństwo i skalowanie.
Ustalono UI/UX: minimalistyczny, estetyczny, mobile‑first, jeden ekran główny.
Wybrano technologie: Angular + TypeScript (FE), Node.js (BE), PostgreSQL (DB).
Ustalono architekturę: trzy projekty (esp/, fe/, backend/), FE+BE na jednym serwerze, ESP32 z prostym API.
Określono model danych: brak historii, DB przechowuje użytkowników i deviceId, ESP32 ma zahardcodowane ID.
Ustalono komunikację: FE polling co 5 s, ESP32 cyklicznie wysyła dane, BE zwraca stan.
Ustalono zachowanie offline: ESP32 ponawia WiFi bez limitu, UI pokazuje „offline” i blokuje sterowanie.
Zdefiniowano bezpieczeństwo MVP: proste login + hasło, bez resetu hasła i logowania Google.
Ustalono hosting: docelowo publiczny, MVP jako lokalne demo.
Określono kryteria sukcesu MVP: działające rejestracja/logowanie, odświeżanie co 5 s, sterowanie z ACK „OK”, stabilność podczas demo.
Ustalono harmonogram: 2 dni pracy po ~16h.
Zdefiniowano scenariusz demo: rejestracja → logowanie → podgląd → komenda → potwierdzenie.
</decisions>
<matched_recommendations>
Wyraźne zdefiniowanie problemu użytkownika i wartości biznesowej MVP.
Sprecyzowanie zakresu MVP vs. poza MVP dla kontroli scope.
Ustalenie kluczowych funkcji i minimalnych kryteriów sukcesu.
Określenie architektury, technologii i modelu danych przed implementacją.
Zdefiniowanie podstawowych scenariuszy użytkownika i ścieżki demo.
Określenie zasad komunikacji i zachowań offline dla niezawodności MVP.
</matched_recommendations>
<prd_planning_summary>
Główne wymagania funkcjonalne produktu:
Rejestracja i logowanie użytkownika (jedna rola: operator).
Podgląd 3 temperatur w czasie rzeczywistym (polling co 5 s).
Status maszyny online/offline.
Zdalne sterowanie: ON/OFF oraz wartość serwa.
Potwierdzenie wykonania komendy z ESP32 (ACK „OK”).
Blokada sterowania przy offline.
Wyświetlanie czasu ostatniej aktualizacji danych.
Kluczowe historie użytkownika i ścieżki korzystania:
Operator rejestruje konto i loguje się.
Operator widzi bieżące temperatury i status online/offline.
Operator wysyła komendę ON/OFF lub ustawia serwo i otrzymuje ACK „OK”.
Gdy status offline, interfejs blokuje sterowanie i pokazuje brak łączności.
Scenariusz demo: rejestracja → logowanie → podgląd → komenda → potwierdzenie.
Kryteria sukcesu i pomiar:
Rejestracja i logowanie działają bez błędów (test funkcjonalny w demo).
Odczyty temperatur odświeżają się co 5 s (weryfikacja interwału w UI).
Sterowanie ON/OFF i serwem działa z ACK „OK” (weryfikacja odpowiedzi ESP32).
System stabilny podczas demo (brak awarii i blokad interfejsu).
Założenia techniczne i organizacyjne:
Frontend: Angular + TypeScript; Backend: Node.js; DB: PostgreSQL.
Trzy projekty: esp/, fe/, backend/; FE+BE na jednym serwerze.
Model danych przechowuje wyłącznie aktualny stan; użytkownicy powiązani z deviceId.
ESP32 komunikuje się prostym API i ma zahardcodowane ID.
ESP32 ponawia połączenie z WiFi bez limitu; UI blokuje sterowanie offline.
MVP hostowane lokalnie jako demo; docelowo publiczny hosting.
Harmonogram: 2 dni pracy po ~16h.
Zakres poza MVP:
Historia odczytów, alarmy, multi‑device/multi‑user, zaawansowane bezpieczeństwo, skalowanie.
</prd_planning_summary>
<unresolved_issues>
Dokładny format i struktura API (endpointy, payloady, schemat ACK).
Definicja „online/offline” i timeoutu statusu w backendzie/UI.
Mechanizm mapowania użytkownika do deviceId i proces rejestracji urządzenia.
Szczegóły UX dla błędów sieciowych i retry w UI.
Wymagania dotyczące bezpieczeństwa haseł (hashing, polityka haseł) w MVP.
</unresolved_issues>
</conversation_summary>