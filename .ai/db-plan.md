# Schemat bazy danych PostgreSQL - System Zdalnego Monitorowania i Sterowania Maszyną

## 1. Tabele

### 1.1. Tabela `users` (Użytkownicy)

Przechowuje dane użytkowników systemu (operatorów).

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    device_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Kolumny:**
- `id` - Klucz podstawowy, autoinkrementacja
- `username` - Unikalna nazwa użytkownika (max 50 znaków)
- `password_hash` - Zahashowane hasło (bcrypt, min. 10 rounds)
- `device_id` - Identyfikator urządzenia ESP32, z którym użytkownik jest powiązany
- `created_at` - Data utworzenia konta
- `updated_at` - Data ostatniej aktualizacji

**Ograniczenia:**
- `username` - UNIQUE, NOT NULL
- `password_hash` - NOT NULL
- `device_id` - NOT NULL

---

### 1.2. Tabela `devices` (Urządzenia)

Przechowuje informacje o urządzeniach ESP32.

```sql
CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Kolumny:**
- `id` - Klucz podstawowy, autoinkrementacja
- `device_id` - Unikalny identyfikator urządzenia ESP32 (zahardcodowane w firmware)
- `name` - Opcjonalna nazwa urządzenia
- `created_at` - Data rejestracji urządzenia
- `updated_at` - Data ostatniej aktualizacji

**Ograniczenia:**
- `device_id` - UNIQUE, NOT NULL

---

### 1.3. Tabela `device_state` (Aktualny stan urządzenia)

Przechowuje aktualny stan urządzenia ESP32 (tylko najnowsze dane, bez historii w MVP).

```sql
CREATE TABLE device_state (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(100) UNIQUE NOT NULL,
    temperature1 REAL,
    temperature2 REAL,
    temperature3 REAL,
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
    last_update TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Kolumny:**
- `id` - Klucz podstawowy, autoinkrementacja
- `device_id` - Identyfikator urządzenia (UNIQUE - jeden stan na urządzenie)
- `temperature1` - Odczyt temperatury z pierwszego czujnika DS18B20
- `temperature2` - Odczyt temperatury z drugiego czujnika DS18B20
- `temperature3` - Odczyt temperatury z trzeciego czujnika DS18B20
- `status` - Status połączenia: 'online' lub 'offline'
- `last_update` - Czas ostatniej aktualizacji danych z ESP32
- `updated_at` - Czas ostatniej modyfikacji rekordu w bazie

**Ograniczenia:**
- `device_id` - UNIQUE, NOT NULL
- `status` - CHECK constraint (tylko 'online' lub 'offline')

**Uwagi:**
- Tabela przechowuje wyłącznie aktualny stan (brak historii w MVP)
- Wartości temperatur mogą być NULL (błąd odczytu czujnika)
- Status 'offline' gdy brak aktualizacji przez timeout (np. 10 sekund)

---

### 1.4. Tabela `pending_commands` (Oczekujące komendy)

Przechowuje komendy sterujące oczekujące na wykonanie przez ESP32.

```sql
CREATE TABLE pending_commands (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL,
    command_type VARCHAR(50) NOT NULL CHECK (command_type IN ('power_on', 'power_off', 'servo')),
    command_value REAL CHECK (command_value IS NULL OR (command_value >= 0 AND command_value <= 100)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP WITH TIME ZONE
);
```

**Kolumny:**
- `id` - Klucz podstawowy, autoinkrementacja
- `device_id` - Identyfikator urządzenia docelowego
- `command_type` - Typ komendy: 'power_on', 'power_off', 'servo'
- `command_value` - Wartość komendy (dla serwa: 0-100, dla power_on/power_off: NULL)
- `created_at` - Czas utworzenia komendy
- `acknowledged` - Czy komenda została potwierdzona przez ESP32 (ACK "OK")
- `acknowledged_at` - Czas potwierdzenia wykonania komendy

**Ograniczenia:**
- `device_id` - NOT NULL
- `command_type` - NOT NULL, CHECK constraint
- `command_value` - CHECK constraint (0-100 dla serwa, NULL dla power_on/power_off)

**Uwagi:**
- Komendy są usuwane po potwierdzeniu (ACK) lub po określonym czasie (np. 1 minuta)
- Dla komend 'power_on' i 'power_off' wartość `command_value` jest NULL
- Dla komendy 'servo' wartość `command_value` musi być w zakresie 0-100

---

### 1.5. Tabela `sessions` (Sesje użytkowników)

Przechowuje aktywne sesje użytkowników dla autoryzacji.

```sql
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Kolumny:**
- `id` - Klucz podstawowy, autoinkrementacja
- `user_id` - Identyfikator użytkownika (FK do `users.id`)
- `token` - Unikalny token sesji (JWT lub session token)
- `expires_at` - Czas wygaśnięcia sesji
- `created_at` - Czas utworzenia sesji
- `last_used_at` - Czas ostatniego użycia sesji (dla przedłużenia sesji)

**Ograniczenia:**
- `user_id` - NOT NULL
- `token` - UNIQUE, NOT NULL
- `expires_at` - NOT NULL

---

## 2. Relacje między tabelami

### 2.1. Relacja `users` → `devices`
- **Typ**: Wiele-do-jednego (Many-to-One)
- **Kardynalność**: Wiele użytkowników może być powiązanych z jednym urządzeniem (w przyszłości, w MVP: jeden użytkownik = jedno urządzenie)
- **Klucz obcy**: `users.device_id` → `devices.device_id`
- **Uwaga**: W MVP może być bezpośrednie powiązanie przez `device_id` (VARCHAR), bez FK constraint (dla uproszczenia)

### 2.2. Relacja `sessions` → `users`
- **Typ**: Wiele-do-jednego (Many-to-One)
- **Kardynalność**: Jeden użytkownik może mieć wiele aktywnych sesji
- **Klucz obcy**: `sessions.user_id` → `users.id`
- **Akcja przy usunięciu**: CASCADE (usunięcie użytkownika usuwa jego sesje)

### 2.3. Relacja `device_state` → `devices`
- **Typ**: Jeden-do-jednego (One-to-One)
- **Kardynalność**: Jedno urządzenie ma jeden aktualny stan
- **Klucz obcy**: `device_state.device_id` → `devices.device_id`
- **Uwaga**: UNIQUE constraint na `device_id` zapewnia relację 1:1

### 2.4. Relacja `pending_commands` → `devices`
- **Typ**: Wiele-do-jednego (Many-to-One)
- **Kardynalność**: Jedno urządzenie może mieć wiele oczekujących komend
- **Klucz obcy**: `pending_commands.device_id` → `devices.device_id`
- **Uwaga**: Komendy są usuwane po potwierdzeniu lub po timeout

---

## 3. Klucze obce (Foreign Keys)

```sql
-- Relacja sessions → users
ALTER TABLE sessions
ADD CONSTRAINT fk_sessions_user_id
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Relacja device_state → devices
ALTER TABLE device_state
ADD CONSTRAINT fk_device_state_device_id
FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE;

-- Relacja pending_commands → devices
ALTER TABLE pending_commands
ADD CONSTRAINT fk_pending_commands_device_id
FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE;

-- Relacja users → devices (opcjonalna w MVP, dla uproszczenia może być bez FK)
-- ALTER TABLE users
-- ADD CONSTRAINT fk_users_device_id
-- FOREIGN KEY (device_id) REFERENCES devices(device_id);
```

**Uwaga:** W MVP relacja `users.device_id` → `devices.device_id` może być bez FK constraint, jeśli `device_id` jest traktowane jako prosty identyfikator tekstowy (zahardcodowane w ESP32).

---

## 4. Indeksy

### 4.1. Indeksy dla wydajności zapytań

```sql
-- Indeksy dla tabeli users
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_device_id ON users(device_id);

-- Indeksy dla tabeli devices
CREATE INDEX idx_devices_device_id ON devices(device_id);

-- Indeksy dla tabeli device_state
CREATE INDEX idx_device_state_device_id ON device_state(device_id);
CREATE INDEX idx_device_state_status ON device_state(status);
CREATE INDEX idx_device_state_last_update ON device_state(last_update);

-- Indeksy dla tabeli pending_commands
CREATE INDEX idx_pending_commands_device_id ON pending_commands(device_id);
CREATE INDEX idx_pending_commands_acknowledged ON pending_commands(acknowledged);
CREATE INDEX idx_pending_commands_created_at ON pending_commands(created_at);
CREATE INDEX idx_pending_commands_device_ack ON pending_commands(device_id, acknowledged);

-- Indeksy dla tabeli sessions
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

**Uzasadnienie indeksów:**
- `users.username` - Szybkie wyszukiwanie użytkownika przy logowaniu
- `users.device_id` - Wyszukiwanie użytkowników powiązanych z urządzeniem
- `device_state.device_id` - Szybki dostęp do stanu urządzenia
- `device_state.status` - Filtrowanie urządzeń po statusie (online/offline)
- `device_state.last_update` - Określanie timeout offline
- `pending_commands.device_id` - Pobieranie komend dla urządzenia
- `pending_commands.acknowledged` - Filtrowanie niepotwierdzonych komend
- `pending_commands.device_ack` - Złożony indeks dla zapytań: "niepotwierdzone komendy dla urządzenia"
- `sessions.token` - Weryfikacja tokenu przy autoryzacji
- `sessions.expires_at` - Czyszczenie wygasłych sesji

---

## 5. Zasady PostgreSQL (Row Level Security - RLS)

### 5.1. Włączanie RLS (opcjonalne w MVP)

W MVP autoryzacja może być obsługiwana na poziomie aplikacji (middleware), ale RLS może być użyteczne dla dodatkowego bezpieczeństwa.

```sql
-- Włącz RLS dla tabeli users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Polityka: Użytkownicy mogą widzieć tylko swoje dane
CREATE POLICY users_select_own ON users
    FOR SELECT
    USING (id = current_setting('app.user_id', true)::INTEGER);

-- Włącz RLS dla tabeli device_state
ALTER TABLE device_state ENABLE ROW LEVEL SECURITY;

-- Polityka: Użytkownicy mogą widzieć stan tylko swojego urządzenia
CREATE POLICY device_state_select_own ON device_state
    FOR SELECT
    USING (device_id IN (
        SELECT device_id FROM users 
        WHERE id = current_setting('app.user_id', true)::INTEGER
    ));

-- Włącz RLS dla tabeli pending_commands
ALTER TABLE pending_commands ENABLE ROW LEVEL SECURITY;

-- Polityka: Użytkownicy mogą widzieć komendy tylko dla swojego urządzenia
CREATE POLICY pending_commands_select_own ON pending_commands
    FOR SELECT
    USING (device_id IN (
        SELECT device_id FROM users 
        WHERE id = current_setting('app.user_id', true)::INTEGER
    ));
```

**Uwaga:** RLS jest opcjonalne w MVP. Jeśli nie jest używane, autoryzacja jest obsługiwana przez middleware w aplikacji Node.js.

---

## 6. Funkcje pomocnicze (opcjonalne)

### 6.1. Funkcja automatycznego aktualizowania `updated_at`

```sql
-- Funkcja do automatycznego aktualizowania updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger dla tabeli users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger dla tabeli devices
CREATE TRIGGER update_devices_updated_at
    BEFORE UPDATE ON devices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger dla tabeli device_state
CREATE TRIGGER update_device_state_updated_at
    BEFORE UPDATE ON device_state
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 6.2. Funkcja czyszczenia starych komend (opcjonalna)

```sql
-- Funkcja do usuwania starych potwierdzonych komend (starsze niż 1 minuta)
CREATE OR REPLACE FUNCTION cleanup_old_commands()
RETURNS void AS $$
BEGIN
    DELETE FROM pending_commands
    WHERE acknowledged = TRUE
    AND acknowledged_at < CURRENT_TIMESTAMP - INTERVAL '1 minute';
END;
$$ LANGUAGE plpgsql;

-- Można uruchomić jako cron job lub w aplikacji Node.js
```

---

## 7. Uwagi i decyzje projektowe

### 7.1. Normalizacja
- Schemat jest znormalizowany do 3NF (Third Normal Form)
- Brak denormalizacji w MVP (priorytet: prostota i czytelność)

### 7.2. Brak historii w MVP
- Tabela `device_state` przechowuje wyłącznie aktualny stan
- Brak tabeli historii odczytów (np. `temperature_history`)
- W przyszłości można dodać archiwizację danych

### 7.3. Komendy jako kolejka
- Tabela `pending_commands` działa jako kolejka komend
- Komendy są usuwane po potwierdzeniu (ACK) lub po timeout
- Brak historii wykonanych komend w MVP

### 7.4. Autoryzacja
- Sesje przechowywane w tabeli `sessions`
- Token może być JWT (bez przechowywania w bazie) lub session token (z przechowywaniem)
- W MVP można użyć prostego session token

### 7.5. Device ID
- `device_id` jest VARCHAR (nie INTEGER) - może być dowolny identyfikator tekstowy
- W MVP `device_id` jest zahardcodowane w firmware ESP32
- Relacja `users.device_id` → `devices.device_id` może być bez FK constraint w MVP (dla uproszczenia)

### 7.6. Status online/offline
- Status jest aktualizowany przy każdym `POST /api/esp32/data`
- Timeout offline: urządzenie jest uznawane za offline, gdy brak aktualizacji przez określony czas (np. 10 sekund)
- Timeout może być obliczany w aplikacji Node.js na podstawie `last_update`

### 7.7. Temperatury
- Wartości temperatur mogą być NULL (błąd odczytu czujnika)
- W ESP32 wartość `-999.0` oznacza błąd odczytu (może być mapowana na NULL w bazie)

### 7.8. Komendy
- Typy komend: 'power_on', 'power_off', 'servo'
- Dla serwa: wartość 0-100
- Dla power_on/power_off: wartość NULL
- Komendy są potwierdzane przez ESP32 (ACK "OK")

### 7.9. Skalowalność
- Schemat jest przygotowany na wiele urządzeń (tabela `devices`)
- W MVP: jeden użytkownik = jedno urządzenie
- W przyszłości: wiele użytkowników może mieć dostęp do wielu urządzeń

### 7.10. Bezpieczeństwo
- Hasła są hashowane (bcrypt, min. 10 rounds)
- RLS jest opcjonalne (autoryzacja w aplikacji)
- Wszystkie endpointy wymagają autoryzacji (oprócz ESP32 endpoints i auth)

---

## 8. Przykładowe zapytania SQL

### 8.1. Pobranie aktualnego stanu urządzenia dla użytkownika

```sql
SELECT ds.*
FROM device_state ds
JOIN users u ON u.device_id = ds.device_id
WHERE u.id = :user_id;
```

### 8.2. Pobranie niepotwierdzonych komend dla urządzenia

```sql
SELECT *
FROM pending_commands
WHERE device_id = :device_id
AND acknowledged = FALSE
ORDER BY created_at ASC;
```

### 8.3. Aktualizacja stanu urządzenia

```sql
INSERT INTO device_state (device_id, temperature1, temperature2, temperature3, status, last_update)
VALUES (:device_id, :temp1, :temp2, :temp3, 'online', CURRENT_TIMESTAMP)
ON CONFLICT (device_id) 
DO UPDATE SET
    temperature1 = EXCLUDED.temperature1,
    temperature2 = EXCLUDED.temperature2,
    temperature3 = EXCLUDED.temperature3,
    status = EXCLUDED.status,
    last_update = EXCLUDED.last_update,
    updated_at = CURRENT_TIMESTAMP;
```

### 8.4. Dodanie komendy

```sql
INSERT INTO pending_commands (device_id, command_type, command_value)
VALUES (:device_id, :command_type, :command_value);
```

### 8.5. Potwierdzenie komendy (ACK)

```sql
UPDATE pending_commands
SET acknowledged = TRUE,
    acknowledged_at = CURRENT_TIMESTAMP
WHERE id = :command_id;
```

### 8.6. Weryfikacja sesji

```sql
SELECT s.*, u.id as user_id, u.username, u.device_id
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE s.token = :token
AND s.expires_at > CURRENT_TIMESTAMP;
```

---

## 9. Migracje

Schemat powinien być wdrożony jako migracje SQL w kolejności:

1. Utworzenie tabeli `devices`
2. Utworzenie tabeli `users`
3. Utworzenie tabeli `device_state`
4. Utworzenie tabeli `pending_commands`
5. Utworzenie tabeli `sessions`
6. Dodanie kluczy obcych
7. Utworzenie indeksów
8. Utworzenie funkcji pomocniczych (opcjonalne)
9. Włączenie RLS i utworzenie polityk (opcjonalne)

---

## 10. Podsumowanie

Schemat bazy danych PostgreSQL jest zaprojektowany zgodnie z wymaganiami MVP:
- ✅ Przechowywanie użytkowników z powiązaniem do `device_id`
- ✅ Przechowywanie aktualnego stanu urządzenia (3 temperatury, status)
- ✅ Kolejka komend oczekujących na wykonanie
- ✅ System sesji dla autoryzacji
- ✅ Indeksy dla wydajności zapytań
- ✅ Ograniczenia integralności danych
- ✅ Brak historii (tylko aktualny stan)
- ✅ Przygotowanie na skalowalność (wiele urządzeń)

Schemat jest gotowy do wykorzystania jako podstawa do tworzenia migracji baz danych.
