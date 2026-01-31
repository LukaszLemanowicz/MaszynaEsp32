# Podłączenie wyświetlacza OLED SSD1306 do ESP32

## Wymagane połączenia

Wyświetlacz OLED SSD1306 0.96" należy podłączyć do ESP32 w następujący sposób:

### Połączenia I2C (zalecane)

| Wyświetlacz OLED | ESP32 | Opis |
|------------------|-------|------|
| VCC              | 3.3V  | Zasilanie |
| GND              | GND   | Masa |
| SCL              | GPIO 22 | Szerokosc zegarowa I2C |
| SDA              | GPIO 21 | Dane I2C |

### Schemat połączeń

```
ESP32 DevKit          OLED SSD1306
┌─────────────┐       ┌─────────────┐
│ 3.3V        │───────│ VCC         │
│ GND         │───────│ GND         │
│ GPIO 22     │───────│ SCL         │
│ GPIO 21     │───────│ SDA         │
└─────────────┘       └─────────────┘
```

## Uwagi

1. **Zasilanie**: Wyświetlacz wymaga napięcia 3.3V (nie 5V!)
2. **Rezystory pull-up**: W większości przypadków nie są potrzebne, ale jeśli masz problemy z komunikacją, dodaj rezystory 4.7kΩ między SCL a 3.3V oraz SDA a 3.3V
3. **Adres I2C**: Domyślny adres to 0x3C (zdefiniowany w kodzie)
4. **Kable**: Używaj krótkich kabli (max 20cm) aby uniknąć problemów z sygnałem

## Testowanie

Po podłączeniu uruchom kod - powinieneś zobaczyć:
1. Komunikat powitalny "Maszyna ESP32 v1.0"
2. Status "proces" z temperaturą
3. Pasek postępu
4. Komunikat "Gotowe!"

## Rozwiązywanie problemów

- **Czarny ekran**: Sprawdź połączenia zasilania (3.3V, GND)
- **Brak komunikacji**: Sprawdź połączenia SCL i SDA
- **Zniekształcony obraz**: Sprawdź jakość połączeń i długość kabli
