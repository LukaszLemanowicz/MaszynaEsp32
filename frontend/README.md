# Frontend - Maszyna ESP32

Frontend webowy do zarządzania systemem destylacji.

## 🚀 Uruchomienie

Po utworzeniu projektu frontendowego (React, Vue, itp.):

```bash
npm install
npm start
```

## 📡 Integracja z Backendem

Frontend komunikuje się z backendem przez REST API dostępne pod adresem:
- Development: `http://localhost:3000`
- Production: (do skonfigurowania)

## 🔌 API Endpoints

Zobacz `../backend/README.md` dla pełnej dokumentacji API.

### Główne endpointy:

- `GET /api/data` - Pobierz aktualne dane z ESP32
- `POST /api/command/temperature` - Ustaw temperaturę docelową
- `POST /api/command/distillation` - Start/Stop destylacji
- `POST /api/command/reset` - Reset systemu

## 📝 Uwagi

Ten folder jest przygotowany na projekt frontendowy. Wybierz framework (React, Vue, Angular, itp.) i zainicjalizuj projekt tutaj.
