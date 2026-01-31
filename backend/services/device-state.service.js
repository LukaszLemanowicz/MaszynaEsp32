const { query } = require('../database/db');

// Timeout uznania urządzenia za offline (w sekundach)
const OFFLINE_TIMEOUT_SECONDS = parseInt(process.env.OFFLINE_TIMEOUT_SECONDS || '10', 10);

/**
 * Aktualizacja lub utworzenie stanu urządzenia
 * @param {string} deviceId - ID urządzenia
 * @param {number|null} temperature1 - Temperatura 1 (lub null jeśli błąd)
 * @param {number|null} temperature2 - Temperatura 2 (lub null jeśli błąd)
 * @param {number|null} temperature3 - Temperatura 3 (lub null jeśli błąd)
 * @param {number} sensorCount - Liczba czujników
 */
async function updateDeviceState(deviceId, temperature1, temperature2, temperature3, sensorCount) {
  // Mapuj -999.0 na null (błąd odczytu czujnika)
  const temp1 = temperature1 === -999.0 || temperature1 === null ? null : temperature1;
  const temp2 = temperature2 === -999.0 || temperature2 === null ? null : temperature2;
  const temp3 = temperature3 === -999.0 || temperature3 === null ? null : temperature3;

  // Sprawdź czy urządzenie istnieje, jeśli nie - utwórz je
  const deviceCheckResult = await query('SELECT id FROM devices WHERE device_id = ?', [deviceId]);

  if (!deviceCheckResult.rows || deviceCheckResult.rows.length === 0) {
    // Utwórz nowe urządzenie
    await query('INSERT INTO devices (device_id, name) VALUES (?, ?)', [deviceId, `Urządzenie ${deviceId}`]);
    console.log(`📱 Utworzono nowe urządzenie: ${deviceId}`);
  }

  // UPSERT stanu urządzenia
  const now = new Date().toISOString();
  await query(
    `INSERT INTO device_state (device_id, temperature1, temperature2, temperature3, status, last_update, updated_at)
     VALUES (?, ?, ?, ?, 'online', ?, ?)
     ON CONFLICT(device_id) DO UPDATE SET
       temperature1 = excluded.temperature1,
       temperature2 = excluded.temperature2,
       temperature3 = excluded.temperature3,
       status = 'online',
       last_update = excluded.last_update,
       updated_at = excluded.updated_at`,
    [deviceId, temp1, temp2, temp3, now, now]
  );

  console.log(`📊 Zaktualizowano stan urządzenia: ${deviceId} (temp1: ${temp1}, temp2: ${temp2}, temp3: ${temp3})`);
}

/**
 * Pobranie stanu urządzenia dla użytkownika
 * @param {string} deviceId - ID urządzenia użytkownika
 * @returns {Promise<Object|null>} Stan urządzenia lub null
 */
async function getDeviceState(deviceId) {
  const result = await query(
    `SELECT device_id, temperature1, temperature2, temperature3, status, last_update
     FROM device_state
     WHERE device_id = ?`,
    [deviceId]
  );

  if (!result.rows || result.rows.length === 0) {
    return null;
  }

  const state = result.rows[0];
  
  // Oblicz status na podstawie last_update (jeśli starsze niż timeout, to offline)
  let calculatedStatus = state.status;
  if (state.last_update) {
    const lastUpdate = new Date(state.last_update);
    const now = new Date();
    const diffSeconds = (now - lastUpdate) / 1000;
    
    if (diffSeconds > OFFLINE_TIMEOUT_SECONDS) {
      calculatedStatus = 'offline';
      // Zaktualizuj status w bazie
      await query(
        'UPDATE device_state SET status = ? WHERE device_id = ?',
        ['offline', deviceId]
      );
    }
  } else {
    calculatedStatus = 'offline';
  }

  return {
    deviceId: state.device_id,
    temperature1: state.temperature1,
    temperature2: state.temperature2,
    temperature3: state.temperature3,
    status: calculatedStatus,
    lastUpdate: state.last_update,
  };
}

/**
 * Sprawdzenie czy urządzenie jest online
 * @param {string} deviceId - ID urządzenia
 * @returns {Promise<boolean>} true jeśli online, false jeśli offline
 */
async function isDeviceOnline(deviceId) {
  const state = await getDeviceState(deviceId);
  return state !== null && state.status === 'online';
}

module.exports = {
  updateDeviceState,
  getDeviceState,
  isDeviceOnline,
};
