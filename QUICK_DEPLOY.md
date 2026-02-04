# ⚡ Szybki przewodnik wdrożenia

Skrócona wersja dla osób, które chcą szybko wdrożyć projekt.

## 📋 Przed rozpoczęciem

Masz:
- ✅ Adres IP serwera VPS
- ✅ Dostęp SSH (hasło lub klucz)

## 🚀 Kroki wdrożenia

### 1. Połącz się z serwerem

```bash
ssh root@TWOJE_IP
```

### 2. Uruchom skrypt automatycznej konfiguracji

```bash
# Skopiuj zawartość setup.sh i wykonaj na serwerze
bash <(curl -s https://raw.githubusercontent.com/TWOJE_REPO/setup.sh)
# LUB jeśli masz plik lokalnie:
# Prześlij setup.sh na serwer i wykonaj: bash setup.sh
```

### 3. Prześlij kod projektu

**Opcja A: Przez SCP (z komputera lokalnego)**
```bash
cd C:\Users\Łukasz\Desktop\staryKomp\MaszynaESP32
scp -r backend frontend root@TWOJE_IP:/var/www/maszyna-esp32/
```

**Opcja B: Przez Git (jeśli masz repozytorium)**
```bash
# Na serwerze
cd /var/www
git clone TWOJE_REPO
mv MaszynaESP32 maszyna-esp32
```

### 4. Skonfiguruj Backend

```bash
cd /var/www/maszyna-esp32/backend
npm install --production
cp .env.example .env
nano .env  # Edytuj jeśli potrzebujesz
pm2 start server.js --name maszyna-backend
pm2 save
pm2 startup  # Wykonaj wyświetloną komendę
```

### 5. Zbuduj Frontend

```bash
cd /var/www/maszyna-esp32/frontend
npm install
npm run build
```

### 6. Skonfiguruj nginx

```bash
# Skopiuj szablon konfiguracji
cp /var/www/maszyna-esp32/nginx-config.conf /etc/nginx/sites-available/maszyna-esp32

# Edytuj konfigurację (zastąp TWOJE_IP)
nano /etc/nginx/sites-available/maszyna-esp32

# Aktywuj
ln -s /etc/nginx/sites-available/maszyna-esp32 /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### 7. Skonfiguruj Firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 8. Zaktualizuj ESP32

W pliku `esp32/src/main.cpp` zmień:
```cpp
const char* serverUrl = "http://TWOJE_IP";
```

Wgraj nowy firmware na ESP32.

## ✅ Gotowe!

Otwórz w przeglądarce: `http://TWOJE_IP`

## 🐛 Problemy?

Zobacz pełną dokumentację: **[DEPLOYMENT.md](./DEPLOYMENT.md)**
