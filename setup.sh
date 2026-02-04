#!/bin/bash

# Skrypt automatycznej konfiguracji serwera VPS
# Użycie: Na serwerze: bash setup.sh

set -e

echo "🔧 Rozpoczynam konfigurację serwera..."

# Aktualizacja systemu
echo "📦 Aktualizacja systemu..."
apt update && apt upgrade -y

# Instalacja Node.js
if ! command -v node &> /dev/null; then
    echo "📦 Instalacja Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
else
    echo "✅ Node.js już zainstalowany: $(node --version)"
fi

# Instalacja nginx
if ! command -v nginx &> /dev/null; then
    echo "📦 Instalacja nginx..."
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
else
    echo "✅ nginx już zainstalowany"
fi

# Instalacja PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalacja PM2..."
    npm install -g pm2
else
    echo "✅ PM2 już zainstalowany"
fi

# Instalacja Git
if ! command -v git &> /dev/null; then
    echo "📦 Instalacja Git..."
    apt install -y git
else
    echo "✅ Git już zainstalowany"
fi

# Tworzenie katalogu projektu
PROJECT_DIR="/var/www/maszyna-esp32"
if [ ! -d "$PROJECT_DIR" ]; then
    echo "📁 Tworzenie katalogu projektu..."
    mkdir -p $PROJECT_DIR
fi

echo ""
echo "✅ Podstawowa konfiguracja zakończona!"
echo ""
echo "📝 Następne kroki:"
echo "1. Prześlij kod projektu do $PROJECT_DIR"
echo "2. Przejdź do DEPLOYMENT.md - Krok 4 (Konfiguracja Backendu)"
echo ""
echo "Lub wykonaj ręcznie:"
echo "  cd $PROJECT_DIR/backend"
echo "  npm install --production"
echo "  cp .env.example .env"
echo "  nano .env  # Edytuj konfigurację"
echo "  pm2 start server.js --name maszyna-backend"
echo "  pm2 save"
