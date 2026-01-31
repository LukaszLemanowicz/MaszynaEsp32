require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { registerUser, loginUser, logoutUser, getUserById } = require('./services/auth.service');
const { requireAuth } = require('./middleware/auth.middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Baza danych SQLite jest automatycznie inicjalizowana w database/db.js
// Nie trzeba testować połączenia - SQLite działa od razu!

// Przechowywanie danych z ESP32
let esp32Data = {
  temperature: 0,
  status: 'offline',
  lastUpdate: null
};

// Przechowywanie mocy do wysłania do ESP32
let currentPower = 0.0;

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

// ===== ENDPOINTS DO ODBIERANIA DANYCH Z ESP32 =====

// ESP32 wysyła swoje dane (temperatura)
app.post('/api/esp32/data', (req, res) => {
  const { temperature, status } = req.body;
  
  esp32Data = {
    temperature: temperature || esp32Data.temperature,
    status: status || esp32Data.status,
    lastUpdate: new Date().toISOString()
  };
  
  console.log('📡 Otrzymano dane z ESP32:', esp32Data);
  res.json({ success: true, message: 'Dane zapisane' });
});

// ESP32 pobiera moc
app.get('/api/esp32/power', (req, res) => {
  res.json({ power: currentPower });
  console.log(`⚡ ESP32 pobrało moc: ${currentPower}W`);
});

// ===== ENDPOINTY DO USTAWIANIA MOCY =====

// Ustaw moc
app.post('/api/power', (req, res) => {
  const { power } = req.body;
  if (power === undefined || power < 0 || power > 1000) {
    return res.status(400).json({ error: 'Nieprawidłowa moc (0-1000W)' });
  }
  
  currentPower = power;
  console.log(`⚡ Ustawiono moc: ${power}W`);
  res.json({ success: true, power: currentPower });
});

// ===== ENDPOINTS DO ODCZYTU DANYCH =====

// Pobierz aktualne dane z ESP32
app.get('/api/data', (req, res) => {
  res.json(esp32Data);
});

// Pobierz aktualną moc
app.get('/api/power', (req, res) => {
  res.json({ power: currentPower });
});

// ===== ENDPOINTS TESTOWE =====

// Test połączenia
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend działa!', 
    timestamp: new Date().toISOString(),
    esp32Status: esp32Data.status 
  });
});

// Strona główna z informacjami
app.get('/', (req, res) => {
  res.json({
    message: 'Mazyna ESP32 - Backend API',
    version: '2.0.0',
    endpoints: {
      'GET /api/data': 'Pobierz dane z ESP32 (temperatura)',
      'POST /api/esp32/data': 'Wyślij dane z ESP32 (temperatura)',
      'GET /api/esp32/power': 'Pobierz moc dla ESP32',
      'POST /api/power': 'Ustaw moc',
      'GET /api/power': 'Pobierz aktualną moc',
      'GET /api/test': 'Test połączenia'
    }
  });
});

// Uruchom serwer
app.listen(PORT, () => {
  console.log(`🚀 Serwer uruchomiony na porcie ${PORT}`);
  console.log(`📡 API dostępne pod: http://localhost:${PORT}/api`);
  console.log(`🌐 Strona główna: http://localhost:${PORT}`);
});
