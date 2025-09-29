#include "OLEDDisplay.h"

// Konstruktor
OLEDDisplay::OLEDDisplay(int width, int height) 
    : display(width, height, &Wire, -1), isInitialized(false) {
}

// Inicjalizacja wyświetlacza
bool OLEDDisplay::begin() {
    if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
        isInitialized = false;
        return false;
    }
    
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.display();
    
    isInitialized = true;
    return true;
}

// Podstawowe metody wyświetlania
void OLEDDisplay::clear() {
    if (isInitialized) {
        display.clearDisplay();
    }
}

void OLEDDisplay::displayText() {
    if (isInitialized) {
        display.display();
    }
}

void OLEDDisplay::setTextSize(int size) {
    if (isInitialized) {
        display.setTextSize(size);
    }
}

void OLEDDisplay::setTextColor(uint16_t color) {
    if (isInitialized) {
        display.setTextColor(color);
    }
}

void OLEDDisplay::setCursor(int x, int y) {
    if (isInitialized) {
        display.setCursor(x, y);
    }
}

void OLEDDisplay::print(const char* text) {
    if (isInitialized) {
        display.print(text);
    }
}

void OLEDDisplay::print(int number) {
    if (isInitialized) {
        display.print(number);
    }
}

void OLEDDisplay::print(float number, int decimals) {
    if (isInitialized) {
        display.print(number, decimals);
    }
}

void OLEDDisplay::println(const char* text) {
    if (isInitialized) {
        display.println(text);
    }
}

void OLEDDisplay::println(int number) {
    if (isInitialized) {
        display.println(number);
    }
}

void OLEDDisplay::println(float number, int decimals) {
    if (isInitialized) {
        display.println(number, decimals);
    }
}

// Metody do rysowania
void OLEDDisplay::drawPixel(int x, int y, uint16_t color) {
    if (isInitialized) {
        display.drawPixel(x, y, color);
    }
}

void OLEDDisplay::drawLine(int x0, int y0, int x1, int y1, uint16_t color) {
    if (isInitialized) {
        display.drawLine(x0, y0, x1, y1, color);
    }
}

void OLEDDisplay::drawRect(int x, int y, int width, int height, uint16_t color) {
    if (isInitialized) {
        display.drawRect(x, y, width, height, color);
    }
}

void OLEDDisplay::fillRect(int x, int y, int width, int height, uint16_t color) {
    if (isInitialized) {
        display.fillRect(x, y, width, height, color);
    }
}

void OLEDDisplay::drawCircle(int x, int y, int radius, uint16_t color) {
    if (isInitialized) {
        display.drawCircle(x, y, radius, color);
    }
}

void OLEDDisplay::fillCircle(int x, int y, int radius, uint16_t color) {
    if (isInitialized) {
        display.fillCircle(x, y, radius, color);
    }
}

// Metody pomocnicze
int OLEDDisplay::getWidth() const {
    return display.width();
}

int OLEDDisplay::getHeight() const {
    return display.height();
}

bool OLEDDisplay::isReady() const {
    return isInitialized;
}

// Metody do wyświetlania informacji o destylatorze
void OLEDDisplay::showWelcomeMessage() {
    if (!isInitialized) return;
    
    clear();
    setTextSize(2);
    setTextColor(SSD1306_WHITE);
    setCursor(5, 20);
    print("DESTYLATOR");
    setTextSize(1);
    setCursor(35, 45);
    print("ESP32 v1.0");
    displayText();
}

void OLEDDisplay::showTemperature(float temp) {
    if (!isInitialized) return;
    
    clear();
    setTextSize(1);
    setTextColor(SSD1306_WHITE);
    setCursor(0, 10);
    print("Temperatura:");
    setTextSize(3);
    setCursor(20, 30);
    print(temp, 1);
    print(" C");
    displayText();
}


void OLEDDisplay::showError(const char* error) {
    if (!isInitialized) return;
    
    clear();
    setTextSize(1);
    setTextColor(SSD1306_WHITE);
    setCursor(0, 10);
    print("BLAD:");
    setCursor(0, 25);
    print(error);
    displayText();
}

void OLEDDisplay::showWiFiStatus(bool connected, const char* ip) {
    clear();
    setTextSize(1);
    setTextColor(SSD1306_WHITE);
    
    setCursor(0, 0);
    print("WiFi: ");
    if (connected) {
        print("OK");
        if (ip) {
            setCursor(0, 12);
            print("IP: ");
            print(ip);
        }
    } else {
        print("ERR");
    }
    displayText();
}

void OLEDDisplay::showSystemInfo(float temp, float power, const String& wifiStatus, const String& dataStatus, const String& powerStatus, const String& lastError) {
    clear();
    setTextSize(1);
    setTextColor(SSD1306_WHITE);
    
    // Górna linia - temperatura i moc
    setCursor(0, 0);
    print("T:");
    print(temp, 1);
    print("C  P:");
    print(power, 0);
    print("W");
    
    // Druga linia - status WiFi
    setCursor(0, 12);
    print("WiFi: ");
    print(wifiStatus.c_str());
    
    // Trzecia linia - status danych i mocy
    setCursor(0, 24);
    print("D:");
    print(dataStatus.c_str());
    print(" M:");
    print(powerStatus.c_str());
    
    // Dolna linia - błąd (jeśli jest)
    if (lastError.length() > 0) {
        setCursor(0, 36);
        print("ERR: ");
        print(lastError.c_str());
    }
    
    displayText();
}

void OLEDDisplay::showDebugInfo(const char* line1, const char* line2, const char* line3) {
    clear();
    setTextSize(1);
    setTextColor(SSD1306_WHITE);
    
    setCursor(0, 0);
    print(line1);
    
    if (line2) {
        setCursor(0, 12);
        print(line2);
    }
    
    if (line3) {
        setCursor(0, 24);
        print(line3);
    }
    
    displayText();
}

void OLEDDisplay::showConnectionAttempt(int attempt, int maxAttempts) {
    clear();
    setTextSize(1);
    setTextColor(SSD1306_WHITE);
    
    setCursor(0, 0);
    print("Laczenie WiFi...");
    
    setCursor(0, 12);
    print("Proba: ");
    print(attempt);
    print("/");
    print(maxAttempts);
    
    // Pasek postępu
    int barWidth = (attempt * 100) / maxAttempts;
    drawRect(0, 30, 128, 8, SSD1306_WHITE);
    fillRect(0, 30, barWidth, 8, SSD1306_WHITE);
    
    displayText();
}