-- ============================================
-- Schemat bazy danych SQLite - System Maszyny ESP32
-- Najprostsza możliwa wersja dla MVP
-- ============================================
-- UWAGA: Ten plik jest tylko dla dokumentacji.
-- Tabele są automatycznie tworzone przez database/db.js przy starcie aplikacji.
-- ============================================

-- Tabela urządzeń (devices)
CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela użytkowników (users)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    device_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela sesji (sessions)
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela stanu urządzenia (device_state)
CREATE TABLE IF NOT EXISTS device_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT UNIQUE NOT NULL,
    temperature1 REAL,
    temperature2 REAL,
    temperature3 REAL,
    status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
    last_update DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela oczekujących komend (pending_commands)
CREATE TABLE IF NOT EXISTS pending_commands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    command_type TEXT NOT NULL CHECK (command_type IN ('power_on', 'power_off', 'servo')),
    command_value REAL CHECK (command_value IS NULL OR (command_value >= 0 AND command_value <= 100)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    acknowledged BOOLEAN DEFAULT 0,
    acknowledged_at DATETIME
);

-- Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_device_id ON users(device_id);
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_device_state_device_id ON device_state(device_id);
CREATE INDEX IF NOT EXISTS idx_device_state_status ON device_state(status);
CREATE INDEX IF NOT EXISTS idx_device_state_last_update ON device_state(last_update);
CREATE INDEX IF NOT EXISTS idx_pending_commands_device_id ON pending_commands(device_id);
CREATE INDEX IF NOT EXISTS idx_pending_commands_acknowledged ON pending_commands(acknowledged);
CREATE INDEX IF NOT EXISTS idx_pending_commands_created_at ON pending_commands(created_at);
CREATE INDEX IF NOT EXISTS idx_pending_commands_device_ack ON pending_commands(device_id, acknowledged);