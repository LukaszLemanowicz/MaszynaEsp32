# Instrukcje połączenia projektu z GitHubem

## Krok 1: Otwórz terminal w folderze projektu
Otwórz Git Bash, PowerShell lub Command Prompt w folderze:
`C:\Users\Łukasz\Desktop\staryKomp\MaszynaESP32`

## Krok 2: Sprawdź czy Git jest zainstalowany
```bash
git --version
```
Jeśli Git nie jest zainstalowany, pobierz go z: https://git-scm.com/download/win

## Krok 3: Zainicjalizuj repozytorium Git (jeśli jeszcze nie jest)
```bash
git init
```

## Krok 4: Dodaj wszystkie pliki do repozytorium
```bash
git add .
```

## Krok 5: Zrób pierwszy commit
```bash
git commit -m "first commit"
```

## Krok 6: Zmień nazwę gałęzi na main (jeśli potrzeba)
```bash
git branch -M main
```

## Krok 7: Dodaj repozytorium GitHub jako remote
```bash
git remote add origin https://github.com/LukaszLemanowicz/MaszynaEsp32.git
```

## Krok 8: Wypchnij kod na GitHub
```bash
git push -u origin main
```

---

## Jeśli masz już zainicjalizowane repozytorium Git:

Jeśli projekt ma już folder `.git`, pomiń kroki 3-5 i wykonaj tylko:

```bash
git remote add origin https://github.com/LukaszLemanowicz/MaszynaEsp32.git
git branch -M main
git push -u origin main
```

## Uwaga:
Jeśli podczas `git push` pojawi się błąd, że repozytorium już istnieje i ma pliki, możesz użyć:
```bash
git pull origin main --allow-unrelated-histories
```
A następnie ponownie:
```bash
git push -u origin main
```
