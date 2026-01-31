#ifndef OLEDDISPLAY_H
#define OLEDDISPLAY_H

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

class OLEDDisplay {
private:
    Adafruit_SSD1306 display;
    bool isInitialized;
    
public:
    // Konstruktor - domyślnie 128x64, ale można zmienić
    OLEDDisplay(int width = 128, int height = 64);
    
    // Inicjalizacja wyświetlacza
    bool begin();
    
    // Podstawowe metody wyświetlania
    void clear();
    void displayText();
    void setTextSize(int size);
    void setTextColor(uint16_t color);
    void setCursor(int x, int y);
    void print(const char* text);
    void print(int number);
    void print(float number, int decimals = 2);
    void println(const char* text);
    void println(int number);
    void println(float number, int decimals = 2);
    
    // Metody do rysowania
    void drawPixel(int x, int y, uint16_t color);
    void drawLine(int x0, int y0, int x1, int y1, uint16_t color);
    void drawRect(int x, int y, int width, int height, uint16_t color);
    void fillRect(int x, int y, int width, int height, uint16_t color);
    void drawCircle(int x, int y, int radius, uint16_t color);
    void fillCircle(int x, int y, int radius, uint16_t color);
    
    // Metody pomocnicze
    int getWidth() const;
    int getHeight() const;
    bool isReady() const;
    
    // Metody do wyświetlania informacji o maszynie
    void showWelcomeMessage();
    void showTemperature(float temp);
    void showError(const char* error);
    
    // Metody do debugowania i informacji
    void showWiFiStatus(bool connected, const char* ip = nullptr);
    void showSystemInfo(float temp1, float temp2, float power, const String& wifiStatus, const String& dataStatus, const String& powerStatus, const String& lastError);
    void showDebugInfo(const char* line1, const char* line2 = nullptr, const char* line3 = nullptr);
    void showConnectionAttempt(int attempt, int maxAttempts);
};

#endif
