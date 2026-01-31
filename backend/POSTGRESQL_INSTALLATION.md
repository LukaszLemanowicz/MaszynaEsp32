# 📦 Instalacja PostgreSQL - Co zaznaczyć?

## ✅ Podczas instalacji PostgreSQL zaznacz:

### **WYMAGANE (zaznacz wszystkie):**

1. ✅ **PostgreSQL Server** (np. PostgreSQL 18.1.2)
   - To jest główny serwer bazy danych - **MUSISZ** to mieć

2. ✅ **Command Line Tools** (psql, pg_restore, itp.)
   - To są narzędzia wiersza poleceń - **MUSISZ** to mieć, żeby używać komendy `psql`

### **OPCJONALNE (ale polecane):**

3. ✅ **pgAdmin 4** (lub nowsza wersja)
   - To jest graficzne narzędzie do zarządzania bazą danych
   - **Bardzo przydatne** dla początkujących - możesz zarządzać bazą przez interfejs graficzny zamiast wiersza poleceń
   - Jeśli nie jesteś pewien - **zaznacz to**, nie zaszkodzi

### **MOŻESZ POMINĄĆ:**

4. ❌ **Stack Builder**
   - Narzędzie do instalacji dodatkowych komponentów
   - **Nie jest potrzebne** na razie - możesz pominąć

5. ❌ **Wszelkie dodatkowe rozszerzenia/extensions**
   - Na razie nie są potrzebne

---

## 📝 Podsumowanie - Co zaznaczyć:

```
✅ PostgreSQL Server (18.1.2)
✅ Command Line Tools
✅ pgAdmin 4 (opcjonalne, ale polecane)
❌ Stack Builder (pomiń)
```

---

## 🔐 Ważne podczas instalacji:

1. **Hasło dla użytkownika `postgres`:**
   - Podczas instalacji zostaniesz poproszony o ustawienie hasła
   - **Zapamiętaj to hasło!** Będziesz go potrzebować w pliku `.env`
   - Zapisz je w bezpiecznym miejscu

2. **Port:**
   - Domyślnie PostgreSQL używa portu **5432**
   - Zostaw domyślny port (chyba że masz już coś na tym porcie)

3. **Lokalizacja:**
   - Zostaw domyślną lokalizację (chyba że masz powód, żeby zmienić)

---

## ✅ Po instalacji sprawdź:

### Windows:
```powershell
# Sprawdź czy PostgreSQL działa
Get-Service postgresql*
```

Powinieneś zobaczyć usługę PostgreSQL uruchomioną.

### Test połączenia:
```bash
# Spróbuj połączyć się z PostgreSQL
psql -U postgres
```

Jeśli poprosi o hasło - wpisz hasło, które ustawiłeś podczas instalacji.

---

## 🎯 Co dalej?

Po zainstalowaniu PostgreSQL:

1. ✅ Sprawdź czy działa: `Get-Service postgresql*` (Windows)
2. ✅ Utwórz bazę danych (zobacz `INSTALLATION.md` lub `QUICK_START.md`)
3. ✅ Uruchom skrypt SQL (`backend/database/schema.sql`)
4. ✅ Skonfiguruj plik `.env` z hasłem do PostgreSQL

---

## 💡 Wskazówka o pgAdmin:

Jeśli zainstalujesz **pgAdmin**, będziesz mógł:
- Zarządzać bazą danych przez interfejs graficzny
- Widzieć tabele, dane, itp. bez używania wiersza poleceń
- Łatwiej debugować problemy

**pgAdmin** otwiera się w przeglądarce (domyślnie http://localhost:5050) i wymaga ustawienia hasła przy pierwszym uruchomieniu.

---

**PostgreSQL 18.1.2 jest w porządku!** ✅ Będzie działać z naszym kodem (wymagamy wersji 12+, a 18 to najnowsza wersja).
