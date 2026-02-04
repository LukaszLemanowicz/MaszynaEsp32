# 📚 Podsumowanie wdrożenia - Komendy i ich znaczenie

Krótkie wyjaśnienie wszystkich komend użytych podczas wdrożenia projektu na VPS.

---

## 🚀 Szybka aktualizacja projektu (po zmianach w kodzie)

### Krok 1: Wypchnij zmiany do Git (na swoim komputerze)
```bash
git add .
git commit -m "Opis zmian"
git push origin main
```

### Krok 2: Połącz się z serwerem (VNC Console lub SSH)
- VNC: Panel Contabo → VPS → VNC Control
- SSH: `ssh root@45.90.121.228` (jeśli działa)

### Krok 3: Pobierz najnowsze zmiany
```bash
cd /var/www/maszyna-esp32
git pull origin main
```

### Krok 4: Aktualizacja Backendu (jeśli zmiany w backendzie)
```bash
cd /var/www/maszyna-esp32/backend
npm install --production  # Jeśli dodano nowe pakiety
pm2 restart maszyna-backend
```

### Krok 5: Aktualizacja Frontendu (jeśli zmiany w frontendzie)
```bash
cd /var/www/maszyna-esp32/frontend
npm install  # Jeśli dodano nowe pakiety
npm run build  # Rebuild aplikacji
```

### Krok 6: Przeładuj nginx (jeśli zmieniono konfigurację)
```bash
nginx -t  # Test konfiguracji
systemctl reload nginx
```

### ⚡ Szybki skrót (wszystko naraz):
```bash
cd /var/www/maszyna-esp32
git pull origin main
cd backend && npm install --production && pm2 restart maszyna-backend
cd ../frontend && npm install && npm run build
nginx -t && systemctl reload nginx
```

**Uwaga:** Jeśli zmieniasz tylko kod (nie dodajesz pakietów), możesz pominąć `npm install`.

---

## 🔧 Krok 1: Przygotowanie serwera

### Aktualizacja systemu
```bash
apt update && apt upgrade -y
```
- **`apt update`** - pobiera listę dostępnych aktualizacji pakietów
- **`apt upgrade -y`** - instaluje aktualizacje (`-y` = automatycznie "tak")
- **`&&`** - wykonaj drugą komendę tylko jeśli pierwsza się powiodła

### Instalacja Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
```
- **`curl`** - pobiera plik z internetu
- **`-fsSL`** - opcje: `-f` (fail silently), `-s` (silent), `-S` (show errors), `-L` (follow redirects)
- **`| bash -`** - przekazuje pobrany skrypt do bash do wykonania

```bash
apt install -y nodejs
```
- Instaluje Node.js (i npm) na system

```bash
node --version
npm --version
```
- Sprawdza czy instalacja się powiodła (pokazuje wersje)

---

## 📥 Krok 2: Pobranie kodu projektu

### Utworzenie katalogu
```bash
mkdir -p /var/www
```
- **`mkdir`** - tworzy katalog
- **`-p`** - tworzy też katalogi nadrzędne jeśli nie istnieją
- **`/var/www`** - standardowy katalog dla aplikacji webowych

### Sklonowanie repozytorium Git
```bash
cd /var/www
git clone https://github.com/LukaszLemanowicz/MaszynaEsp32.git maszyna-esp32
```
- **`cd`** - zmienia katalog
- **`git clone`** - pobiera kod z repozytorium Git
- **`maszyna-esp32`** - nazwa folderu lokalnego

### Aktualizacja kodu (po zmianach w Git)
```bash
cd /var/www/maszyna-esp32
git pull origin main
```
- **`git pull`** - pobiera najnowsze zmiany z repozytorium
- **`origin main`** - z gałęzi `main` na zdalnym repozytorium `origin`

---

## ⚙️ Krok 3: Konfiguracja Backendu

### Przejście do katalogu backendu
```bash
cd /var/www/maszyna-esp32/backend
```

### Instalacja zależności Node.js
```bash
npm install --production
```
- **`npm install`** - instaluje pakiety z `package.json`
- **`--production`** - tylko pakiety produkcyjne (bez dev dependencies)

### Utworzenie pliku konfiguracyjnego .env
```bash
cat > .env << 'EOF'
PORT=3000
NODE_ENV=production
EOF
```
- **`cat > .env`** - tworzy plik `.env` i zapisuje do niego zawartość
- **`<< 'EOF'`** - heredoc - wszystko do `EOF` jest zapisywane do pliku
- **`'EOF'`** - pojedynczy cudzysłów zapobiega interpretacji zmiennych

### Test uruchomienia backendu
```bash
node server.js
```
- Uruchamia backend ręcznie (do testu)
- Zatrzymaj: `Ctrl+C`

---

## 🔄 Krok 4: PM2 - Zarządzanie procesami

### Instalacja PM2
```bash
npm install -g pm2
```
- **`-g`** - instalacja globalna (dostępna systemowo)

### Uruchomienie backendu przez PM2
```bash
pm2 start server.js --name maszyna-backend
```
- **`pm2 start`** - uruchamia proces
- **`--name`** - nadaje nazwę procesowi (łatwiejsze zarządzanie)

### Zapisanie listy procesów PM2
```bash
pm2 save
```
- Zapisuje aktualną listę procesów (przywróci po restarcie serwera)

### Włączenie autostartu PM2
```bash
pm2 startup
```
- Tworzy skrypt systemd do automatycznego uruchomienia PM2 po restarcie serwera
- Wyświetla komendę do wykonania - **skopiuj i wykonaj ją!**

### Sprawdzenie statusu
```bash
pm2 status
```
- Pokazuje listę wszystkich procesów zarządzanych przez PM2

### Przydatne komendy PM2:
```bash
pm2 logs maszyna-backend    # Logi backendu
pm2 restart maszyna-backend # Restart procesu
pm2 stop maszyna-backend    # Zatrzymaj proces
pm2 delete maszyna-backend  # Usuń z PM2
```

---

## 🎨 Krok 5: Build Frontendu

### Przejście do katalogu frontendu
```bash
cd /var/www/maszyna-esp32/frontend
```

### Instalacja zależności
```bash
npm install
```
- Instaluje wszystkie pakiety (w tym dev dependencies - potrzebne do builda)

### Build produkcyjny
```bash
npm run build
```
- Kompiluje Angular do statycznych plików (HTML, CSS, JS)
- Wynik w folderze `dist/app/browser/`

### Sprawdzenie plików builda
```bash
ls -la dist/app/browser/
```
- **`ls`** - lista plików
- **`-la`** - `-l` (long format), `-a` (all - pokazuje też ukryte)
- Sprawdza czy pliki zostały utworzone

---

## 🌐 Krok 6: Konfiguracja Nginx

### Instalacja nginx
```bash
apt install -y nginx
```
- Instaluje serwer webowy nginx

### Skopiowanie konfiguracji
```bash
cp /var/www/maszyna-esp32/nginx-config.conf /etc/nginx/sites-available/maszyna-esp32
```
- **`cp`** - kopiuje plik
- **`sites-available`** - dostępne konfiguracje (nieaktywne)
- **`sites-enabled`** - aktywne konfiguracje (symlinki)

### Aktywacja konfiguracji (utworzenie symlinku)
```bash
ln -s /etc/nginx/sites-available/maszyna-esp32 /etc/nginx/sites-enabled/
```
- **`ln -s`** - tworzy symlink (symbolic link)
- **`-s`** - symbolic (nie hard link)
- Symlink = "skrót" do oryginalnego pliku

### Usunięcie domyślnej konfiguracji
```bash
rm /etc/nginx/sites-enabled/default
```
- **`rm`** - usuwa plik
- Usuwa domyślną stronę "Welcome to nginx!"

### Test konfiguracji
```bash
nginx -t
```
- **`-t`** - test (sprawdza składnię konfiguracji)
- Musi pokazać "syntax is ok" i "test is successful"

### Przeładowanie nginx
```bash
systemctl reload nginx
```
- **`systemctl reload`** - przeładowuje konfigurację bez przerywania działania
- Alternatywnie: **`systemctl restart nginx`** - pełny restart

### Sprawdzenie statusu nginx
```bash
systemctl status nginx
```
- Pokazuje czy nginx działa (`active (running)`)

---

## 🔥 Krok 7: Firewall

### Sprawdzenie statusu firewall
```bash
ufw status
```
- **`ufw`** - Uncomplicated Firewall (prosty firewall dla Ubuntu)

### Otwarcie portów
```bash
ufw allow 80/tcp
ufw allow 443/tcp
```
- **`allow`** - zezwala na połączenia
- **`80/tcp`** - port 80, protokół TCP (HTTP)
- **`443/tcp`** - port 443, protokół TCP (HTTPS)

### Włączenie firewall
```bash
ufw enable
```
- Aktywuje firewall (zapytanie o potwierdzenie)

---

## 🔍 Przydatne komendy diagnostyczne

### Sprawdzenie czy port nasłuchuje
```bash
netstat -tlnp | grep :80
```
- **`netstat`** - pokazuje aktywne połączenia sieciowe
- **`-tlnp`** - `-t` (TCP), `-l` (listening), `-n` (numerical), `-p` (PID)
- **`grep :80`** - filtruje tylko port 80

Alternatywnie:
```bash
ss -tlnp | grep :80
```
- **`ss`** - nowsza wersja netstat (szybsza)

### Test połączenia lokalnego
```bash
curl http://localhost
```
- **`curl`** - narzędzie do testowania HTTP
- Sprawdza czy serwer odpowiada lokalnie

### Test API backendu
```bash
curl http://localhost:3000/api/health
```
- Testuje endpoint health check backendu

### Sprawdzenie logów nginx
```bash
tail -30 /var/log/nginx/error.log
```
- **`tail`** - pokazuje ostatnie linie pliku
- **`-30`** - ostatnie 30 linii
- Sprawdza błędy nginx

### Sprawdzenie konfiguracji nginx
```bash
nginx -T 2>/dev/null | grep -A 10 "server_name"
```
- **`nginx -T`** - pokazuje pełną konfigurację nginx
- **`2>/dev/null`** - ukrywa ostrzeżenia
- **`grep -A 10`** - pokazuje 10 linii po znalezionym tekście

---

## 📁 Struktura katalogów

```
/var/www/maszyna-esp32/          # Główny katalog projektu
├── backend/                      # Backend Node.js
│   ├── server.js                # Główny plik serwera
│   ├── .env                     # Zmienne środowiskowe (NIE w Git!)
│   └── node_modules/            # Zależności npm
├── frontend/                     # Frontend Angular
│   ├── dist/app/browser/        # Zbudowane pliki produkcyjne
│   └── node_modules/            # Zależności npm
└── esp32/                       # Firmware ESP32

/etc/nginx/                       # Konfiguracja nginx
├── nginx.conf                   # Główna konfiguracja
├── sites-available/             # Dostępne konfiguracje
│   └── maszyna-esp32           # Nasza konfiguracja
└── sites-enabled/               # Aktywne konfiguracje
    └── maszyna-esp32 -> ...    # Symlink do sites-available
```

---

## 🔄 Przepływ żądań

```
Przeglądarka → http://45.90.121.228
                ↓
            Nginx (port 80)
                ↓
        ┌───────┴───────┐
        ↓               ↓
    / (root)        /api
        ↓               ↓
    Frontend        Backend
  (statyczne)    (Node.js:3000)
  pliki HTML         ↓
                     PM2
```

---

## 🎯 Kluczowe pojęcia

### PM2
- **Process Manager 2** - zarządza procesami Node.js
- Utrzymuje aplikację działającą po zamknięciu terminala
- Automatyczny restart przy błędach
- Autostart po restarcie serwera

### Nginx
- **Reverse Proxy** - przekierowuje żądania
- **Static File Server** - serwuje statyczne pliki (HTML, CSS, JS)
- **Load Balancer** - może rozdzielać ruch (nie używamy w MVP)

### Symlink
- Symboliczny link = "skrót" do pliku
- `sites-enabled` zawiera symlinki do `sites-available`
- Nginx ładuje tylko pliki z `sites-enabled`

### Firewall (ufw)
- Blokuje nieautoryzowany dostęp
- Musi zezwolić na porty 80 (HTTP) i 443 (HTTPS)
- Port 22 (SSH) - domyślnie otwarty

---

## ✅ Checklist wdrożenia

- [x] Node.js zainstalowany
- [x] Git zainstalowany
- [x] Kod projektu sklonowany
- [x] Backend: `npm install --production`
- [x] Backend: `.env` utworzony
- [x] Backend: PM2 uruchomiony
- [x] Frontend: `npm install`
- [x] Frontend: `npm run build`
- [x] Nginx zainstalowany
- [x] Nginx skonfigurowany
- [x] Nginx aktywowany (symlink)
- [x] Firewall skonfigurowany
- [x] Test w przeglądarce: `http://45.90.121.228`

---

## 🐛 Częste problemy i rozwiązania

### Problem: "Welcome to nginx!" zamiast aplikacji
**Rozwiązanie:**
- Sprawdź: `ls -la /etc/nginx/sites-enabled/`
- Usuń: `rm /etc/nginx/sites-enabled/default`
- Restart: `systemctl restart nginx`

### Problem: Backend nie działa
**Rozwiązanie:**
- Sprawdź: `pm2 status`
- Logi: `pm2 logs maszyna-backend`
- Restart: `pm2 restart maszyna-backend`

### Problem: Port 80 zablokowany
**Rozwiązanie:**
- Sprawdź firewall: `ufw status`
- Otwórz port: `ufw allow 80/tcp`
- Sprawdź czy nginx nasłuchuje: `netstat -tlnp | grep :80`

---

**Ostatnia aktualizacja:** 2026-02-04
**Wersja:** 1.0.0
