#include <Arduino.h>
#include <Wire.h>
#include "MAX30100_PulseOximeter.h"
#include "heart_rate_sensor.h"

#define SDA_PIN 21
#define SCL_PIN 22
#define UPDATE_RATE 1000

PulseOximeter pox;
float currentHeartRate = 0;
float currentSpO2 = 0;
unsigned long lastBeatTime = 0;

// Sensor update function
void updateHeartRateSensor() {
    pox.update();
    currentHeartRate = pox.getHeartRate();
    currentSpO2 = pox.getSpO2();
}

void setupHeartRateSensor() {
    delay(1000);
    Wire.begin(SDA_PIN, SCL_PIN);
    Wire.setClock(400000);

    if (!pox.begin()) {
        Serial.println("Failed to initialize MAX30100. Restarting ESP...");
        ESP.restart();  // Restart instead of infinite loop
    }

    pox.setIRLedCurrent(MAX30100_LED_CURR_7_6MA);
}

float getHeartRate() {
    return currentHeartRate;
}

float getSpO2() {
    return currentSpO2;
}
