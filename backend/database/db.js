const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

// Ścieżka do pliku bazy danych
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'app.db');

// Utwórz katalog database jeśli nie istnieje
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Połączenie z bazą danych SQLite
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Błąd połączenia z bazą danych:', err);
    throw err;
  }
  console.log('✅ Połączono z bazą danych SQLite:', DB_PATH);
});

// Włącz foreign keys (SQLite domyślnie ma je wyłączone)
db.run('PRAGMA foreign_keys = ON');
db.run('PRAGMA journal_mode = WAL');

// Promisify metody dla łatwiejszego użycia
db.runAsync = promisify(db.run.bind(db));
db.getAsync = promisify(db.get.bind(db));
db.allAsync = promisify(db.all.bind(db));
db.execAsync = promisify(db.exec.bind(db));

// Funkcja do inicjalizacji bazy danych (utworzenie tabel)
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabela devices
      db.run(`
        CREATE TABLE IF NOT EXISTS devices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          device_id TEXT UNIQUE NOT NULL,
          name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela users
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          device_id TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela sessions
      db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          token TEXT UNIQUE NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Tabela device_state (aktualny stan urządzenia)
      db.run(`
        CREATE TABLE IF NOT EXISTS device_state (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          device_id TEXT UNIQUE NOT NULL,
          temperature1 REAL,
          temperature2 REAL,
          temperature3 REAL,
          status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
          last_update DATETIME,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela pending_commands (oczekujące komendy)
      db.run(`
        CREATE TABLE IF NOT EXISTS pending_commands (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          device_id TEXT NOT NULL,
          command_type TEXT NOT NULL CHECK (command_type IN ('power_on', 'power_off', 'servo')),
          command_value REAL CHECK (command_value IS NULL OR (command_value >= 0 AND command_value <= 100)),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          acknowledged BOOLEAN DEFAULT 0,
          acknowledged_at DATETIME
        )
      `);

      // Indeksy dla wydajności
      db.run(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_users_device_id ON users(device_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_device_state_device_id ON device_state(device_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_device_state_status ON device_state(status)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_device_state_last_update ON device_state(last_update)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_pending_commands_device_id ON pending_commands(device_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_pending_commands_acknowledged ON pending_commands(acknowledged)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_pending_commands_created_at ON pending_commands(created_at)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_pending_commands_device_ack ON pending_commands(device_id, acknowledged)`);

      db.run('SELECT 1', (err) => {
        if (err) {
          console.error('❌ Błąd inicjalizacji bazy danych:', err);
          reject(err);
        } else {
          console.log('✅ Baza danych zainicjalizowana (tabele utworzone)');
          resolve();
        }
      });
    });
  });
}

// Inicjalizuj bazę danych przy starcie
initializeDatabase().catch((err) => {
  console.error('❌ Błąd podczas inicjalizacji bazy danych:', err);
});

// Funkcja pomocnicza do wykonywania zapytań (dla kompatybilności)
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve({ rows });
      });
    } else {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ rowCount: this.changes, lastInsertRowid: this.lastID });
      });
    }
  });
}

// Funkcja do zamykania połączenia (dla graceful shutdown)
function close() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        console.error('❌ Błąd zamykania połączenia:', err);
        reject(err);
      } else {
        console.log('🔌 Połączenie z bazą danych zamknięte');
        resolve();
      }
    });
  });
}

module.exports = {
  db,
  query,
  close,
};
