const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { db, query } = require('../database/db');

// Liczba rund hashowania bcrypt
const SALT_ROUNDS = 10;

// Czas trwania sesji w godzinach (domyślnie 24h)
const SESSION_DURATION_HOURS = parseInt(process.env.SESSION_DURATION_HOURS || '24', 10);

/**
 * Hashowanie hasła
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Porównanie hasła z hashem
 */
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Rejestracja nowego użytkownika
 */
async function registerUser(username, password, deviceId) {
  // Sprawdź czy użytkownik już istnieje
  const existingUserResult = await query('SELECT id FROM users WHERE username = ?', [username]);

  if (existingUserResult.rows && existingUserResult.rows.length > 0) {
    throw new Error('Użytkownik o podanej nazwie już istnieje');
  }

  // Sprawdź czy urządzenie istnieje, jeśli nie - utwórz je
  const deviceCheckResult = await query('SELECT id FROM devices WHERE device_id = ?', [deviceId]);

  if (!deviceCheckResult.rows || deviceCheckResult.rows.length === 0) {
    // Utwórz nowe urządzenie
    await query('INSERT INTO devices (device_id, name) VALUES (?, ?)', [deviceId, `Urządzenie ${deviceId}`]);
    console.log(`📱 Utworzono nowe urządzenie: ${deviceId}`);
  }

  // Hashuj hasło
  const passwordHash = await hashPassword(password);

  // Utwórz użytkownika
  const insertResult = await query(
    'INSERT INTO users (username, password_hash, device_id) VALUES (?, ?, ?)',
    [username, passwordHash, deviceId]
  );

  const userId = insertResult.lastInsertRowid;

  // Pobierz utworzonego użytkownika
  const userResult = await query('SELECT id, username, device_id, created_at FROM users WHERE id = ?', [userId]);
  const user = userResult.rows[0];

  console.log(`✅ Zarejestrowano użytkownika: ${username}`);

  return {
    id: user.id,
    username: user.username,
    deviceId: user.device_id,
    createdAt: user.created_at,
  };
}

/**
 * Logowanie użytkownika
 */
async function loginUser(username, password) {
  // Znajdź użytkownika
  const userResult = await query('SELECT id, username, password_hash, device_id, created_at FROM users WHERE username = ?', [username]);

  if (!userResult.rows || userResult.rows.length === 0) {
    throw new Error('Nieprawidłowa nazwa użytkownika lub hasło');
  }

  const user = userResult.rows[0];

  // Sprawdź hasło
  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Nieprawidłowa nazwa użytkownika lub hasło');
  }

  // Utwórz sesję
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_DURATION_HOURS);

  await query(
    'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
    [user.id, token, expiresAt.toISOString()]
  );

  console.log(`🔐 Zalogowano użytkownika: ${username}`);

  return {
    token,
    expiresAt,
    user: {
      id: user.id,
      username: user.username,
      deviceId: user.device_id,
    },
  };
}

/**
 * Wylogowanie użytkownika (usunięcie sesji)
 */
async function logoutUser(token) {
  const result = await query('DELETE FROM sessions WHERE token = ?', [token]);

  if (result.rowCount === 0) {
    throw new Error('Sesja nie została znaleziona');
  }

  console.log(`🚪 Wylogowano użytkownika (token: ${token.substring(0, 8)}...)`);
  return true;
}

/**
 * Weryfikacja tokenu i pobranie użytkownika
 */
async function verifyToken(token) {
  const result = await query(
    `SELECT s.id, s.user_id, s.expires_at, u.id as user_id, u.username, u.device_id, u.created_at
     FROM sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.token = ? AND datetime(s.expires_at) > datetime('now')`,
    [token]
  );

  if (!result.rows || result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  // Aktualizuj last_used_at
  await query('UPDATE sessions SET last_used_at = datetime("now") WHERE id = ?', [row.id]);

  return {
    id: row.user_id,
    username: row.username,
    deviceId: row.device_id,
    createdAt: row.created_at,
  };
}

/**
 * Pobranie danych użytkownika po ID
 */
async function getUserById(userId) {
  const result = await query('SELECT id, username, device_id, created_at FROM users WHERE id = ?', [userId]);

  if (!result.rows || result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  return {
    id: user.id,
    username: user.username,
    deviceId: user.device_id,
    createdAt: user.created_at,
  };
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  verifyToken,
  getUserById,
};
