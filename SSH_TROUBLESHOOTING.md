# 🔧 Rozwiązywanie problemów z SSH (Contabo VPS)

## Problem: "Connection timed out"

Jeśli widzisz błąd:
```
ssh: connect to host 45.90.121.228 port 22: Connection timed out
```

## ✅ Rozwiązania (krok po kroku)

### 1. Sprawdź czy serwer jest uruchomiony

1. Zaloguj się do **panelu Contabo** (https://www.contabo.com/)
2. Przejdź do **VPS** → **Twoja instancja**
3. Sprawdź status serwera - powinien być **"Running"** (zielony)
4. Jeśli nie działa, kliknij **"Start"** i poczekaj 1-2 minuty

### 2. Otwórz port 22 w firewall Contabo

**To jest najczęstsza przyczyna problemu!**

1. W panelu Contabo, przejdź do **Firewall** lub **Network**
2. Znajdź opcję **"Firewall Rules"** lub **"Security Groups"**
3. Dodaj regułę:
   - **Port:** `22`
   - **Protokół:** `TCP`
   - **Kierunek:** `Inbound` (przychodzące)
   - **Akcja:** `Allow`
4. Zapisz zmiany

**Alternatywnie** - jeśli nie ma opcji firewall w panelu:
- Sprawdź czy masz dostęp do **VNC Console** w panelu Contabo
- Możesz zalogować się przez konsolę VNC i skonfigurować firewall z poziomu serwera

### 3. Sprawdź czy używasz poprawnego użytkownika

Contabo może używać różnych użytkowników w zależności od systemu:

**Dla Ubuntu/Debian:**
```bash
ssh root@45.90.121.228
```

**Dla niektórych obrazów:**
```bash
ssh ubuntu@45.90.121.228
# lub
ssh admin@45.90.121.228
```

**Sprawdź w panelu Contabo:**
- Przejdź do **VPS** → **Twoja instancja** → **Details**
- Znajdź informację o **"Default User"** lub **"SSH User"**

### 4. Sprawdź czy port SSH nie jest inny

Niektóre serwery mogą używać innego portu niż 22:

```bash
# Spróbuj port 2222
ssh -p 2222 root@45.90.121.228

# Lub sprawdź w panelu Contabo jaki port jest ustawiony
```

### 5. Sprawdź hasło/klucz SSH

**Jeśli używasz hasła:**
- Sprawdź email od Contabo - tam powinno być hasło root
- Jeśli nie masz hasła, użyj **"Reset Password"** w panelu Contabo

**Jeśli używasz klucza SSH:**
- Upewnij się, że masz poprawny klucz prywatny
- Użyj: `ssh -i ścieżka/do/klucza root@45.90.121.228`

### 6. Sprawdź firewall na Twoim komputerze

**Windows Firewall:**
1. Otwórz **Windows Defender Firewall**
2. Sprawdź czy nie blokuje połączeń wychodzących
3. Tymczasowo wyłącz firewall i spróbuj ponownie (tylko do testu!)

**Antywirus:**
- Niektóre antywirusy blokują SSH
- Tymczasowo wyłącz i spróbuj ponownie

### 7. Użyj VNC Console (jeśli SSH nie działa)

1. W panelu Contabo, przejdź do **VPS** → **Twoja instancja**
2. Kliknij **"VNC Console"** lub **"Console"**
3. Zaloguj się przez przeglądarkę
4. Skonfiguruj firewall z poziomu serwera:

```bash
# Sprawdź czy SSH działa
systemctl status ssh
# lub
systemctl status sshd

# Jeśli nie działa, uruchom:
systemctl start ssh
systemctl enable ssh

# Sprawdź firewall (ufw)
ufw status
# Jeśli port 22 jest zablokowany:
ufw allow 22/tcp
ufw reload
```

## 🛠️ Alternatywne metody połączenia

### Opcja 1: PuTTY (Windows GUI)

1. Pobierz PuTTY: https://www.putty.org/
2. Otwórz PuTTY
3. Wpisz:
   - **Host Name:** `45.90.121.228`
   - **Port:** `22`
   - **Connection Type:** `SSH`
4. Kliknij **"Open"**
5. Zaloguj się (użytkownik: `root`, hasło: z emaila Contabo)

### Opcja 2: Windows Terminal (zalecane)

1. Zainstaluj **Windows Terminal** z Microsoft Store
2. Otwórz nowy terminal
3. Wpisz: `ssh root@45.90.121.228`
4. Wpisz hasło gdy zostaniesz poproszony

### Opcja 3: PowerShell

```powershell
ssh root@45.90.121.228
```

### Opcja 4: WinSCP (dla przesyłania plików)

1. Pobierz WinSCP: https://winscp.net/
2. Użyj do przesyłania plików bezpośrednio (bez SSH terminala)

## 📋 Checklist przed połączeniem

- [ ] Serwer VPS jest uruchomiony w panelu Contabo
- [ ] Port 22 jest otwarty w firewall Contabo
- [ ] Masz hasło root z emaila Contabo (lub klucz SSH)
- [ ] Firewall na Twoim komputerze nie blokuje SSH
- [ ] Używasz poprawnego użytkownika (zwykle `root`)
- [ ] Czekasz 2-3 minuty po uruchomieniu serwera

## 🔍 Diagnostyka

### Test połączenia (ping)

```bash
ping 45.90.121.228
```

Jeśli ping działa, ale SSH nie - problem jest z portem 22 lub firewall.

### Test portu SSH

```bash
# Windows PowerShell
Test-NetConnection -ComputerName 45.90.121.228 -Port 22

# Lub użyj online tool:
# https://www.yougetsignal.com/tools/open-ports/
```

### Sprawdź logi w panelu Contabo

W panelu Contabo możesz zobaczyć logi połączeń i błędów.

## 💡 Najczęstsze rozwiązania

**90% problemów rozwiązuje się przez:**
1. ✅ Otwarcie portu 22 w firewall Contabo
2. ✅ Sprawdzenie czy serwer jest uruchomiony
3. ✅ Użycie poprawnego hasła z emaila Contabo

## 📞 Jeśli nadal nie działa

1. **Sprawdź dokumentację Contabo:**
   - https://contabo.com/en/help/
   - Szukaj: "SSH connection", "Firewall", "VPS access"

2. **Skontaktuj się z supportem Contabo:**
   - Otwórz ticket w panelu
   - Opisz problem: "Cannot connect via SSH, connection timeout on port 22"

3. **Użyj VNC Console:**
   - Zaloguj się przez przeglądarkę
   - Skonfiguruj SSH z poziomu serwera

## ✅ Po udanym połączeniu

Gdy już się połączysz, możesz kontynuować wdrożenie:

```bash
# Sprawdź system
uname -a
lsb_release -a

# Zaktualizuj system
apt update && apt upgrade -y

# Kontynuuj zgodnie z DEPLOYMENT.md
```

---

**Uwaga:** Jeśli używasz Windows 10/11, masz wbudowany SSH client - nie potrzebujesz PuTTY, ale możesz go użyć jeśli wolisz GUI.
