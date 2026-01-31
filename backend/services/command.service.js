const { query } = require('../database/db');

/**
 * Utworzenie nowej komendy
 * @param {string} deviceId - ID urządzenia
 * @param {string} commandType - Typ komendy: 'power_on', 'power_off', 'servo'
 * @param {number|null} commandValue - Wartość komendy (dla serwa: 0-100, dla power: null)
 * @returns {Promise<Object>} Utworzona komenda
 */
async function createCommand(deviceId, commandType, commandValue = null) {
  // Walidacja typu komendy
  const validTypes = ['power_on', 'power_off', 'servo'];
  if (!validTypes.includes(commandType)) {
    throw new Error(`Nieprawidłowy typ komendy: ${commandType}. Dozwolone: ${validTypes.join(', ')}`);
  }

  // Walidacja wartości dla serwa
  if (commandType === 'servo') {
    if (commandValue === null || commandValue === undefined) {
      throw new Error('Komenda serwa wymaga wartości (0-100)');
    }
    if (commandValue < 0 || commandValue > 100) {
      throw new Error('Wartość serwa musi być w zakresie 0-100');
    }
  } else {
    // Dla power_on i power_off wartość musi być null
    if (commandValue !== null && commandValue !== undefined) {
      throw new Error(`Komenda ${commandType} nie wymaga wartości`);
    }
  }

  const result = await query(
    `INSERT INTO pending_commands (device_id, command_type, command_value)
     VALUES (?, ?, ?)`,
    [deviceId, commandType, commandValue]
  );

  const commandId = result.lastInsertRowid;

  // Pobierz utworzoną komendę
  const commandResult = await query(
    `SELECT id, device_id, command_type, command_value, created_at, acknowledged, acknowledged_at
     FROM pending_commands
     WHERE id = ?`,
    [commandId]
  );

  const command = commandResult.rows[0];

  console.log(`📤 Utworzono komendę: ${commandType} dla urządzenia ${deviceId} (ID: ${commandId})`);

  return {
    id: command.id,
    deviceId: command.device_id,
    commandType: command.command_type,
    commandValue: command.command_value,
    createdAt: command.created_at,
    acknowledged: command.acknowledged === 1,
    acknowledgedAt: command.acknowledged_at,
  };
}

/**
 * Pobranie niepotwierdzonych komend dla urządzenia (FIFO)
 * @param {string} deviceId - ID urządzenia
 * @returns {Promise<Array>} Lista komend
 */
async function getPendingCommands(deviceId) {
  const result = await query(
    `SELECT id, command_type, command_value
     FROM pending_commands
     WHERE device_id = ? AND acknowledged = 0
     ORDER BY created_at ASC`,
    [deviceId]
  );

  if (!result.rows || result.rows.length === 0) {
    return [];
  }

  return result.rows.map(row => ({
    id: row.id,
    type: row.command_type,
    value: row.command_value,
  }));
}

/**
 * Potwierdzenie wykonania komendy (ACK)
 * @param {string} deviceId - ID urządzenia
 * @param {number} commandId - ID komendy
 * @param {string} status - Status potwierdzenia (zwykle "OK")
 * @returns {Promise<boolean>} true jeśli sukces
 */
async function acknowledgeCommand(deviceId, commandId, status) {
  // Sprawdź czy komenda istnieje i należy do urządzenia
  const commandResult = await query(
    `SELECT id, device_id, acknowledged
     FROM pending_commands
     WHERE id = ? AND device_id = ?`,
    [commandId, deviceId]
  );

  if (!commandResult.rows || commandResult.rows.length === 0) {
    throw new Error('Komenda nie została znaleziona');
  }

  const command = commandResult.rows[0];

  if (command.acknowledged === 1) {
    console.log(`⚠️ Komenda ${commandId} została już potwierdzona`);
    return true; // Już potwierdzona, ale to nie błąd
  }

  // Zaktualizuj komendę
  const now = new Date().toISOString();
  await query(
    `UPDATE pending_commands
     SET acknowledged = 1, acknowledged_at = ?
     WHERE id = ?`,
    [now, commandId]
  );

  console.log(`✅ Potwierdzono komendę ${commandId} dla urządzenia ${deviceId} (status: ${status})`);

  return true;
}

/**
 * Pobranie statusu komendy
 * @param {number} commandId - ID komendy
 * @param {string} deviceId - ID urządzenia (dla autoryzacji)
 * @returns {Promise<Object|null>} Status komendy lub null
 */
async function getCommandStatus(commandId, deviceId) {
  const result = await query(
    `SELECT id, device_id, command_type, command_value, created_at, acknowledged, acknowledged_at
     FROM pending_commands
     WHERE id = ? AND device_id = ?`,
    [commandId, deviceId]
  );

  if (!result.rows || result.rows.length === 0) {
    return null;
  }

  const command = result.rows[0];

  return {
    id: command.id,
    deviceId: command.device_id,
    commandType: command.command_type,
    commandValue: command.command_value,
    createdAt: command.created_at,
    acknowledged: command.acknowledged === 1,
    acknowledgedAt: command.acknowledged_at,
  };
}

/**
 * Czyszczenie starych potwierdzonych komend (starsze niż 1 minuta)
 */
async function cleanupOldCommands() {
  const result = await query(
    `DELETE FROM pending_commands
     WHERE acknowledged = 1
     AND acknowledged_at < datetime('now', '-1 minute')`
  );

  if (result.rowCount > 0) {
    console.log(`🧹 Usunięto ${result.rowCount} starych komend`);
  }

  return result.rowCount;
}

/**
 * Czyszczenie niepotwierdzonych komend starszych niż 5 minut (timeout)
 */
async function cleanupTimeoutCommands() {
  const result = await query(
    `DELETE FROM pending_commands
     WHERE acknowledged = 0
     AND created_at < datetime('now', '-5 minutes')`
  );

  if (result.rowCount > 0) {
    console.log(`🧹 Usunięto ${result.rowCount} komend z timeoutem`);
  }

  return result.rowCount;
}

module.exports = {
  createCommand,
  getPendingCommands,
  acknowledgeCommand,
  getCommandStatus,
  cleanupOldCommands,
  cleanupTimeoutCommands,
};
