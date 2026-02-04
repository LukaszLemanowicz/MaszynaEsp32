#!/bin/bash

# Skrypt pomocniczy do wdrożenia na VPS
# Użycie: ./deploy.sh TWOJE_IP

set -e

if [ -z "$1" ]; then
    echo "❌ Błąd: Podaj adres IP serwera"
    echo "Użycie: ./deploy.sh TWOJE_IP"
    exit 1
fi

SERVER_IP=$1
SERVER_USER=${2:-root}

echo "🚀 Rozpoczynam wdrożenie na serwer $SERVER_IP..."

# Przesłanie plików na serwer (pomijając node_modules)
echo "📤 Przesyłanie plików na serwer..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' \
    backend/ frontend/ esp32/ \
    $SERVER_USER@$SERVER_IP:/var/www/maszyna-esp32/

echo "✅ Pliki przesłane!"
echo ""
echo "📝 Następne kroki:"
echo "1. Połącz się z serwerem: ssh $SERVER_USER@$SERVER_IP"
echo "2. Wykonaj komendy z DEPLOYMENT.md (Krok 4-7)"
echo ""
echo "Lub użyj skryptu setup.sh na serwerze:"
echo "ssh $SERVER_USER@$SERVER_IP 'bash -s' < setup.sh"
