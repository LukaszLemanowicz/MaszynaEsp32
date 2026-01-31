const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 4200;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Przechowywanie danych z ESP32
let esp32Data = {
  temperature: 0,
  status: 'offline',
  lastUpdate: null
};

// Przechowywanie mocy do wysłania do ESP32
let currentPower = 0.0;

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
