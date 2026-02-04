# 🚀 Przewodnik wdrożenia na VPS (Contabo)

Kompleksowy przewodnik wdrożenia projektu MaszynaESP32 na serwerze VPS.

## 📋 Wymagania

- Serwer VPS z systemem Linux (Ubuntu 20.04/22.04 lub Debian 11/12)
- Adres IP serwera
- Dostęp SSH do serwera (użytkownik root lub z uprawnieniami sudo)
- Klucz SSH lub hasło do logowania

## 📦 Krok 1: Połączenie z serwerem

### Windows (PowerShell lub CMD)

```bash
ssh root@TWOJE_IP
# lub jeśli masz innego użytkownika:
ssh uzytkownik@TWOJE_IP
```

**Przykład:**
```bash
ssh root@123.45.67.89
```

Jeśli to pierwsze połączenie, system zapyta o potwierdzenie - wpisz `yes`.

### Jeśli masz problemy z połączeniem:

**Zobacz szczegółowy przewodnik:** [SSH_TROUBLESHOOTING.md](./SSH_TROUBLESHOOTING.md)

**Najczęstsze problemy:**
1. **Port 22 zablokowany** - Otwórz port 22 w firewall Contabo (panel → Firewall → Add Rule)
2. **Serwer nie uruchomiony** - Sprawdź status w panelu Contabo
3. **Błędne hasło** - Sprawdź email od Contabo z danymi logowania
4. **Zły użytkownik** - Zwykle `root`, ale sprawdź w panelu Contabo

**Szybkie rozwiązanie:**
- Zaloguj się do panelu Contabo
- Przejdź do **Firewall** → Dodaj regułę: Port `22`, TCP, Inbound, Allow
- Sprawdź czy serwer jest **Running**
- Spróbuj ponownie: `ssh root@TWOJE_IP`

---

## 🔧 Krok 2: Przygotowanie serwera

Po zalogowaniu się na serwer, wykonaj następujące komendy:

### 2.1 Aktualizacja systemu

```bash
apt update && apt upgrade -y
```

### 2.2 Instalacja Node.js (v18+)

```bash
# Instalacja Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Sprawdź wersję
node --version
npm --version
```

Powinieneś zobaczyć:
- `node v20.x.x` lub wyższe
- `npm 10.x.x` lub wyższe

### 2.3 Instalacja nginx (reverse proxy)

```bash
apt install -y nginx
systemctl enable nginx
systemctl start nginx
```

### 2.4 Instalacja PM2 (zarządzanie procesami Node.js)

```bash
npm install -g pm2
```

### 2.5 Instalacja Git (jeśli nie ma)

```bash
apt install -y git
```

---

## 📥 Krok 3: Przesłanie kodu na serwer

Masz dwie opcje:

### Opcja A: Przez Git (zalecane)

Jeśli masz repozytorium Git:

```bash
# Na serwerze
cd /var/www
git clone https://github.com/TWOJE_REPO/MaszynaESP32.git
cd MaszynaESP32
```

### Opcja B: Przez SCP (bezpośrednie przesłanie)

Na swoim komputerze (Windows PowerShell):

```bash
# Przejdź do folderu projektu
cd C:\Users\Łukasz\Desktop\staryKomp\MaszynaESP32

# Prześlij cały projekt (pomijając node_modules)
scp -r -o "StrictHostKeyChecking=no" backend frontend esp32 root@TWOJE_IP:/var/www/maszyna-esp32/
```

**Uwaga:** To może zająć trochę czasu. Możesz też użyć WinSCP (graficzny klient SFTP).

---

## ⚙️ Krok 4: Konfiguracja Backendu

### 4.1 Instalacja zależności

```bash
cd /var/www/maszyna-esp32/backend
npm install --production
```

### 4.2 Konfiguracja zmiennych środowiskowych

```bash
nano .env
```

Dodaj następującą zawartość:

```env
PORT=3000
NODE_ENV=production
```

Zapisz plik: `Ctrl+O`, `Enter`, `Ctrl+X`

### 4.3 Test uruchomienia

```bash
npm start
```

Jeśli wszystko działa, zatrzymaj serwer: `Ctrl+C`

---

## 🎨 Krok 5: Konfiguracja Frontendu

### 5.1 Instalacja zależności

```bash
cd /var/www/maszyna-esp32/frontend
npm install
```

### 5.2 Konfiguracja API URL

Musimy zaktualizować konfigurację API, aby wskazywała na serwer zamiast localhost.

**Opcja 1: Zmienna środowiskowa (zalecane)**

Stwórz plik `src/environments/environment.prod.ts`:

```bash
mkdir -p src/environments
nano src/environments/environment.prod.ts
```

Dodaj:

```typescript
export const environment = {
  production: true,
  apiUrl: 'http://TWOJE_IP/api'
};
```

Następnie zaktualizuj `api.config.ts`, aby używał zmiennej środowiskowej.

**Opcja 2: Bezpośrednia edycja (szybkie rozwiązanie)**

```bash
nano src/app/core/config/api.config.ts
```

Zmień:
```typescript
baseUrl: 'http://TWOJE_IP/api',
```

### 5.3 Build frontendu

```bash
npm run build
```

Pliki produkcyjne znajdą się w folderze `dist/app/browser/`.

---

## 🔄 Krok 6: Uruchomienie aplikacji przez PM2

### 6.1 Uruchomienie backendu

```bash
cd /var/www/maszyna-esp32/backend
pm2 start server.js --name maszyna-backend
pm2 save
pm2 startup
```

Ostatnia komenda wyświetli komendę do wykonania - skopiuj ją i wykonaj.

### 6.2 Sprawdzenie statusu

```bash
pm2 status
pm2 logs maszyna-backend
```

Powinieneś zobaczyć, że backend działa.

---

## 🌐 Krok 7: Konfiguracja nginx

### 7.1 Konfiguracja reverse proxy

```bash
nano /etc/nginx/sites-available/maszyna-esp32
```

Dodaj następującą konfigurację:

```nginx
server {
    listen 80;
    server_name TWOJE_IP;  # lub twoja domena, jeśli masz

    # Frontend (statyczne pliki)
    location / {
        root /var/www/maszyna-esp32/frontend/dist/app/browser;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Zapisz: `Ctrl+O`, `Enter`, `Ctrl+X`

### 7.2 Aktywacja konfiguracji

```bash
ln -s /etc/nginx/sites-available/maszyna-esp32 /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # usuń domyślną konfigurację
nginx -t  # sprawdź składnię
systemctl reload nginx
```

---

## 🔥 Krok 8: Konfiguracja Firewall

```bash
# Zainstaluj ufw (jeśli nie ma)
apt install -y ufw

# Zezwól na SSH
ufw allow 22/tcp

# Zezwól na HTTP
ufw allow 80/tcp

# Zezwól na HTTPS (jeśli będziesz używać SSL)
ufw allow 443/tcp

# Włącz firewall
ufw enable

# Sprawdź status
ufw status
```

---

## ✅ Krok 9: Testowanie

### 9.1 Sprawdź backend

W przeglądarce lub przez curl:

```bash
curl http://TWOJE_IP/api/health
```

Lub w przeglądarce: `http://TWOJE_IP/api/health`

### 9.2 Sprawdź frontend

Otwórz w przeglądarce: `http://TWOJE_IP`

Powinieneś zobaczyć stronę logowania.

---

## 🔌 Krok 10: Konfiguracja ESP32

Musisz zaktualizować kod ESP32, aby wskazywał na nowy adres IP serwera.

### 10.1 Edycja kodu ESP32

Na swoim komputerze, otwórz `esp32/src/main.cpp` i zmień:

```cpp
const char* serverUrl = "http://TWOJE_IP:80";
// lub jeśli używasz portu 3000 bezpośrednio:
const char* serverUrl = "http://TWOJE_IP:3000";
```

**Uwaga:** Jeśli używasz nginx (port 80), możesz użyć `http://TWOJE_IP` bez portu.

### 10.2 Wgranie nowego firmware

```bash
cd esp32
pio run --target upload
```

---

## 🛠️ Przydatne komendy

### PM2 - Zarządzanie backendem

```bash
pm2 status              # Status wszystkich procesów
pm2 logs maszyna-backend # Logi backendu
pm2 restart maszyna-backend # Restart backendu
pm2 stop maszyna-backend    # Zatrzymaj backend
pm2 delete maszyna-backend  # Usuń z PM2
```

### nginx - Zarządzanie serwerem webowym

```bash
systemctl status nginx  # Status nginx
systemctl restart nginx # Restart nginx
nginx -t                # Test konfiguracji
tail -f /var/log/nginx/error.log  # Logi błędów
```

### Baza danych SQLite

```bash
cd /var/www/maszyna-esp32/backend
sqlite3 database/app.db
# W konsoli SQLite:
.tables
.quit
```

---

## 🔒 Bezpieczeństwo (opcjonalne, ale zalecane)

### SSL/HTTPS z Let's Encrypt

Jeśli masz domenę wskazującą na serwer:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d twoja-domena.pl
```

Certbot automatycznie skonfiguruje HTTPS.

### Zmiana portu SSH (opcjonalne)

```bash
nano /etc/ssh/sshd_config
# Zmień Port 22 na inny (np. 2222)
systemctl restart sshd
ufw allow 2222/tcp
```

---

## 🐛 Rozwiązywanie problemów

### Backend nie działa

```bash
pm2 logs maszyna-backend
cd /var/www/maszyna-esp32/backend
node server.js  # Uruchom ręcznie, aby zobaczyć błędy
```

### Frontend nie ładuje się

```bash
# Sprawdź czy pliki są w odpowiednim miejscu
ls -la /var/www/maszyna-esp32/frontend/dist/app/browser/

# Sprawdź logi nginx
tail -f /var/log/nginx/error.log
```

### ESP32 nie może połączyć się z serwerem

1. Sprawdź czy backend działa: `curl http://TWOJE_IP/api/health`
2. Sprawdź firewall: `ufw status`
3. Sprawdź logi backendu: `pm2 logs maszyna-backend`
4. Upewnij się, że ESP32 ma dostęp do internetu (nie tylko lokalnej sieci)

### Port 3000 nie jest dostępny z zewnątrz

To jest OK! Backend powinien być dostępny tylko przez nginx (port 80). ESP32 powinno łączyć się przez nginx, nie bezpośrednio na port 3000.

---

## 📝 Checklist wdrożenia

- [ ] Połączenie SSH z serwerem działa
- [ ] Node.js zainstalowany (v18+)
- [ ] nginx zainstalowany i działa
- [ ] PM2 zainstalowany
- [ ] Kod projektu przesłany na serwer
- [ ] Backend zainstalowany i działa (PM2)
- [ ] Frontend zbudowany i skonfigurowany
- [ ] nginx skonfigurowany jako reverse proxy
- [ ] Firewall skonfigurowany
- [ ] Frontend dostępny w przeglądarce
- [ ] Backend odpowiada na `/api/health`
- [ ] ESP32 skonfigurowane z nowym adresem IP
- [ ] ESP32 może łączyć się z backendem

---

## 🎉 Gotowe!

Twój projekt powinien być teraz dostępny pod adresem `http://TWOJE_IP`.

Jeśli masz problemy, sprawdź sekcję "Rozwiązywanie problemów" lub logi:
- Backend: `pm2 logs maszyna-backend`
- nginx: `tail -f /var/log/nginx/error.log`
