# Instrukcja konfiguracji Git dla projektu MaszynaESP32

## Krok 1: Instalacja Git

Jeśli Git nie jest jeszcze zainstalowany, pobierz i zainstaluj go:

1. Pobierz Git dla Windows: https://git-scm.com/download/win
2. Zainstaluj używając domyślnych ustawień
3. Po instalacji, zamknij i otwórz ponownie terminal/PowerShell

## Krok 2: Konfiguracja Git (pierwszy raz)

Jeśli używasz Git po raz pierwszy, skonfiguruj swoje dane:

```bash
git config --global user.name "Twoje Imię"
git config --global user.email "twoj@email.com"
```

## Krok 3: Inicjalizacja repozytorium

W katalogu głównym projektu (`MaszynaESP32`) wykonaj:

```bash
git init
```

## Krok 4: Dodanie plików do repozytorium

```bash
git add .
```

## Krok 5: Pierwszy commit

```bash
git commit -m "Initial commit - projekt MaszynaESP32"
```

## Przydatne komendy Git

- `git status` - sprawdza status repozytorium
- `git add .` - dodaje wszystkie zmiany
- `git add <plik>` - dodaje konkretny plik
- `git commit -m "wiadomość"` - tworzy commit z wiadomością
- `git log` - pokazuje historię commitów
- `git branch` - pokazuje listę branchy
- `git checkout -b <nazwa>` - tworzy nowy branch

## Uwaga

Plik `.gitignore` jest już skonfigurowany i będzie ignorował:
- `node_modules/` (zależności Node.js)
- `.pio/` (pliki build PlatformIO)
- pliki środowiskowe (`.env`)
- pliki IDE i systemowe
