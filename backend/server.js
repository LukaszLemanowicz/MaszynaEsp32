require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { registerUser, loginUser, logoutUser, getUserById } = require('./services/auth.service');
const { requireAuth } = require('./middleware/auth.middleware');
const { updateDeviceState, getDeviceState, isDeviceOnline } = require('./services/device-state.service');
const { createCommand, getPendingCommands, acknowledgeCommand, getCommandStatus, cleanupOldCommands, cleanupTimeoutCommands } = require('./services/command.service');
const { db } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Baza danych SQLite jest automatycznie inicjalizowana w database/db.js
// Nie trzeba testować połączenia - SQLite działa od razu!

// Automatyczne czyszczenie starych komend co 5 minut
setInterval(async () => {
  try {
    await cleanupOldCommands();
    await cleanupTimeoutCommands();
  } catch (error) {
    console.error('❌ Błąd czyszczenia komend:', error);
  }
}, 5 * 60 * 1000); // 5 minut

// ===== ENDPOINTY AUTORYZACJI =====

/**
 * POST /api/auth/register
 * Rejestracja nowego użytkownika
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, deviceId } = req.body;

    // Walidacja danych wejściowych
    if (!username || !password || !deviceId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Wymagane pola: username, password, deviceId',
      });
    }

    if (username.length > 50) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Nazwa użytkownika nie może przekraczać 50 znaków',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Hasło musi mieć minimum 8 znaków',
      });
    }

    if (deviceId.length > 100) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'DeviceId nie może przekraczać 100 znaków',
      });
    }

    // Rejestracja użytkownika
    const user = await registerUser(username, password, deviceId);

    return res.status(201).json({
      success: true,
      message: 'Użytkownik zarejestrowany pomyślnie',
      user: {
        id: user.id,
        username: user.username,
        deviceId: user.deviceId,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Błąd rejestracji:', error);

    if (error.message.includes('już istnieje')) {
      return res.status(409).json({
        error: 'Conflict',
        message: error.message,
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Błąd podczas rejestracji użytkownika',
    });
  }
});

/**
 * POST /api/auth/login
 * Logowanie użytkownika
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Walidacja danych wejściowych
    if (!username || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Wymagane pola: username, password',
      });
    }

    // Logowanie użytkownika
    const result = await loginUser(username, password);

    return res.status(200).json({
      success: true,
      token: result.token,
      expiresAt: result.expiresAt.toISOString(),
      user: {
        id: result.user.id,
        username: result.user.username,
        deviceId: result.user.deviceId,
      },
    });
  } catch (error) {
    console.error('❌ Błąd logowania:', error);

    if (error.message.includes('Nieprawidłowa')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: error.message,
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Błąd podczas logowania',
    });
  }
});

/**
 * POST /api/auth/logout
 * Wylogowanie użytkownika
 */
app.post('/api/auth/logout', requireAuth, async (req, res) => {
  try {
    await logoutUser(req.token);

    return res.status(200).json({
      success: true,
      message: 'Wylogowano pomyślnie',
    });
  } catch (error) {
    console.error('❌ Błąd wylogowania:', error);

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Błąd podczas wylogowania',
    });
  }
});

/**
 * GET /api/auth/me
 * Pobranie danych aktualnie zalogowanego użytkownika
 */
app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Użytkownik nie został znaleziony',
      });
    }

    return res.status(200).json({
      id: user.id,
      username: user.username,
      deviceId: user.deviceId,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('❌ Błąd pobierania danych użytkownika:', error);

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Błąd podczas pobierania danych użytkownika',
    });
  }
});

// ===== ENDPOINTY ESP32 (PUBLICZNE - BEZ AUTORYZACJI) =====

/**
 * POST /api/esp32/data
 * ESP32 wysyła dane o stanie urządzenia (temperatury)
 */
app.post('/api/esp32/data', async (req, res) => {
  try {
    const { deviceId, temperature1, temperature2, temperature3, sensorCount } = req.body;

    // Logowanie otrzymanych danych (dla debugowania)
    console.log('📥 Otrzymano dane z ESP32:', {
      deviceId,
      temperature1,
      temperature2,
      temperature3,
      sensorCount,
      timestamp: new Date().toISOString(),
    });

    // Walidacja danych wejściowych
    if (!deviceId) {
      console.log('⚠️ Brak deviceId w żądaniu');
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Wymagane pole: deviceId',
      });
    }

    if (deviceId.length > 100) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'DeviceId nie może przekraczać 100 znaków',
      });
    }

    // Aktualizuj stan urządzenia w bazie danych
    await updateDeviceState(deviceId, temperature1, temperature2, temperature3, sensorCount);
    console.log('✅ Zaktualizowano stan urządzenia:', deviceId);

    return res.status(200).json({
      success: true,
      message: 'Data received',
    });
  } catch (error) {
    console.error('❌ Błąd odbierania danych z ESP32:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Błąd podczas przetwarzania danych z ESP32',
    });
  }
});

/**
 * GET /api/esp32/commands
 * ESP32 pobiera oczekujące komendy
 */
app.get('/api/esp32/commands', async (req, res) => {
  try {
    const { deviceId } = req.query;

    if (!deviceId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Wymagany parametr: deviceId',
      });
    }

    const commands = await getPendingCommands(deviceId);

    return res.status(200).json({
      commands: commands,
    });
  } catch (error) {
    console.error('❌ Błąd pobierania komend dla ESP32:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Błąd podczas pobierania komend',
    });
  }
});

/**
 * POST /api/esp32/commands/ack
 * ESP32 potwierdza wykonanie komendy (ACK)
 */
app.post('/api/esp32/commands/ack', async (req, res) => {
  try {
    const { deviceId, commandId, status } = req.body;

    // Walidacja danych wejściowych
    if (!deviceId || !commandId || !status) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Wymagane pola: deviceId, commandId, status',
      });
    }

    await acknowledgeCommand(deviceId, commandId, status);

    return res.status(200).json({
      success: true,
      message: 'Command acknowledged',
    });
  } catch (error) {
    console.error('❌ Błąd potwierdzania komendy:', error);

    if (error.message.includes('nie została znaleziona')) {
      return res.status(404).json({
        error: 'Not Found',
        message: error.message,
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Błąd podczas potwierdzania komendy',
    });
  }
});

// ===== ENDPOINTY STANU URZĄDZENIA (WYMAGAJĄ AUTORYZACJI) =====

/**
 * GET /api/device-state
 * Pobranie aktualnego stanu urządzenia dla zalogowanego użytkownika
 */
app.get('/api/device-state', requireAuth, async (req, res) => {
  try {
    const deviceId = req.user.deviceId;
    const state = await getDeviceState(deviceId);

    if (!state) {
      // Brak danych - zwróć stan offline
      return res.status(200).json({
        deviceId: deviceId,
        temperature1: null,
        temperature2: null,
        temperature3: null,
        status: 'offline',
        lastUpdate: null,
      });
    }

    return res.status(200).json({
      deviceId: state.deviceId,
      temperature1: state.temperature1,
      temperature2: state.temperature2,
      temperature3: state.temperature3,
      status: state.status,
      lastUpdate: state.lastUpdate,
    });
  } catch (error) {
    console.error('❌ Błąd pobierania stanu urządzenia:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Błąd podczas pobierania stanu urządzenia',
    });
  }
});

// ===== ENDPOINTY KOMEND (WYMAGAJĄ AUTORYZACJI) =====

/**
 * POST /api/commands/power-on
 * Wysłanie komendy włączenia maszyny
 */
app.post('/api/commands/power-on', requireAuth, async (req, res) => {
  try {
    const deviceId = req.user.deviceId;

    // Sprawdź czy urządzenie jest online
    const isOnline = await isDeviceOnline(deviceId);
    if (!isOnline) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Urządzenie jest offline - nie można wysłać komendy',
      });
    }

    const command = await createCommand(deviceId, 'power_on', null);

    return res.status(201).json({
      success: true,
      command: {
        id: command.id,
        deviceId: command.deviceId,
        commandType: command.commandType,
        commandValue: command.commandValue,
        createdAt: command.createdAt,
        acknowledged: command.acknowledged,
      },
      message: 'Command queued successfully',
    });
  } catch (error) {
    console.error('❌ Błąd wysyłania komendy power-on:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Błąd podczas wysyłania komendy',
    });
  }
});

/**
 * POST /api/commands/power-off
 * Wysłanie komendy wyłączenia maszyny
 */
app.post('/api/commands/power-off', requireAuth, async (req, res) => {
  try {
    const deviceId = req.user.deviceId;

    // Sprawdź czy urządzenie jest online
    const isOnline = await isDeviceOnline(deviceId);
    if (!isOnline) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Urządzenie jest offline - nie można wysłać komendy',
      });
    }

    const command = await createCommand(deviceId, 'power_off', null);

    return res.status(201).json({
      success: true,
      command: {
        id: command.id,
        deviceId: command.deviceId,
        commandType: command.commandType,
        commandValue: command.commandValue,
        createdAt: command.createdAt,
        acknowledged: command.acknowledged,
      },
      message: 'Command queued successfully',
    });
  } catch (error) {
    console.error('❌ Błąd wysyłania komendy power-off:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Błąd podczas wysyłania komendy',
    });
  }
});

/**
 * POST /api/commands/servo
 * Wysłanie komendy ustawienia serwa
 */
app.post('/api/commands/servo', requireAuth, async (req, res) => {
  try {
    const { value } = req.body;
    const deviceId = req.user.deviceId;

    // Walidacja wartości
    if (value === undefined || value === null) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Wymagane pole: value',
      });
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 100) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Wartość musi być liczbą w zakresie 0-100',
      });
    }

    // Sprawdź czy urządzenie jest online
    const isOnline = await isDeviceOnline(deviceId);
    if (!isOnline) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Urządzenie jest offline - nie można wysłać komendy',
      });
    }

    const command = await createCommand(deviceId, 'servo', numValue);

    return res.status(201).json({
      success: true,
      command: {
        id: command.id,
        deviceId: command.deviceId,
        commandType: command.commandType,
        commandValue: command.commandValue,
        createdAt: command.createdAt,
        acknowledged: command.acknowledged,
      },
      message: 'Command queued successfully',
    });
  } catch (error) {
    console.error('❌ Błąd wysyłania komendy servo:', error);

    if (error.message.includes('Nieprawidłowy') || error.message.includes('wymaga')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message,
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Błąd podczas wysyłania komendy',
    });
  }
});

/**
 * GET /api/commands/status/:commandId
 * Sprawdzenie statusu komendy (czy została potwierdzona)
 */
app.get('/api/commands/status/:commandId', requireAuth, async (req, res) => {
  try {
    const commandId = parseInt(req.params.commandId, 10);
    const deviceId = req.user.deviceId;

    if (isNaN(commandId)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Nieprawidłowy ID komendy',
      });
    }

    const command = await getCommandStatus(commandId, deviceId);

    if (!command) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Komenda nie została znaleziona',
      });
    }

    return res.status(200).json({
      id: command.id,
      deviceId: command.deviceId,
      commandType: command.commandType,
      commandValue: command.commandValue,
      acknowledged: command.acknowledged,
      acknowledgedAt: command.acknowledgedAt,
      createdAt: command.createdAt,
    });
  } catch (error) {
    console.error('❌ Błąd sprawdzania statusu komendy:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Błąd podczas sprawdzania statusu komendy',
    });
  }
});

// ===== ENDPOINTY POMOCNICZE =====

/**
 * GET /api/health
 * Health check endpoint dla monitorowania
 */
app.get('/api/health', async (req, res) => {
  try {
    // Sprawdź połączenie z bazą danych
    await db.getAsync('SELECT 1');
    
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    console.error('❌ Błąd health check:', error);
    return res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

// Strona główna z informacjami
app.get('/', (req, res) => {
  res.json({
    message: 'Maszyna ESP32 - Backend API',
    version: '2.0.0',
    status: 'running',
    endpoints: {
      'Authentication': {
        'POST /api/auth/register': 'Rejestracja użytkownika',
        'POST /api/auth/login': 'Logowanie użytkownika',
        'POST /api/auth/logout': 'Wylogowanie użytkownika',
        'GET /api/auth/me': 'Pobranie danych użytkownika',
      },
      'Device State': {
        'GET /api/device-state': 'Pobranie stanu urządzenia (wymaga autoryzacji)',
      },
      'Commands': {
        'POST /api/commands/power-on': 'Włączenie maszyny (wymaga autoryzacji)',
        'POST /api/commands/power-off': 'Wyłączenie maszyny (wymaga autoryzacji)',
        'POST /api/commands/servo': 'Ustawienie serwa (wymaga autoryzacji)',
        'GET /api/commands/status/:commandId': 'Status komendy (wymaga autoryzacji)',
      },
      'ESP32': {
        'POST /api/esp32/data': 'ESP32 wysyła dane (publiczne)',
        'GET /api/esp32/commands': 'ESP32 pobiera komendy (publiczne)',
        'POST /api/esp32/commands/ack': 'ESP32 potwierdza komendę (publiczne)',
      },
      'Health': {
        'GET /api/health': 'Health check',
      },
    },
  });
});

// Uruchom serwer
app.listen(PORT, () => {
  console.log(`🚀 Serwer uruchomiony na porcie ${PORT}`);
  console.log(`📡 API dostępne pod: http://localhost:${PORT}/api`);
  console.log(`🌐 Strona główna: http://localhost:${PORT}`);
});
