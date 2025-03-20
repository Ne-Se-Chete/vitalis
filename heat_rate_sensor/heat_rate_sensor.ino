#include <Wire.h>
#include "MAX30100_PulseOximeter.h"

#define SDA_PIN 5  // I2C SDA Pin
#define SCL_PIN 6  // I2C SCL Pin
#define UPDATE_RATE 1000  // Time interval (ms) for updates

PulseOximeter pox;
unsigned long lastUpdate = 0;
float heartRate = 0;
float spo2 = 0;  // Oxygen Saturation (SpO2)

// Callback for detecting heartbeats
void onBeatDetected() {
    Serial.println("Beat detected!");
    Serial.flush();  // Ensure immediate output
}

void setup() {
    Serial.begin(115200);
    delay(1000);  // Allow Serial to initialize
    Serial.println("\nStarting MAX30100 Sensor...");

    Wire.begin(SDA_PIN, SCL_PIN);
    Wire.setClock(400000);  // Increase I2C speed for better stability

    // Initialize MAX30100
    if (!pox.begin()) {
        Serial.println("MAX30100 initialization failed. Check wiring!");
        while (1);  // Stop if initialization fails
    }

    pox.setOnBeatDetectedCallback(onBeatDetected);
    pox.setIRLedCurrent(MAX30100_LED_CURR_7_6MA);

    Serial.println("MAX30100 Initialized. Reading heart rate and SpO2...");
    Serial.flush();
}

void loop() {
    pox.update();  // Read sensor data

    if (millis() - lastUpdate > UPDATE_RATE) {
        heartRate = pox.getHeartRate();
        spo2 = pox.getSpO2();  // Get SpO2 level

        Serial.printf("Heart Rate: %.2f BPM | SpO2: %.2f%%\n", heartRate, spo2);
        Serial.flush();
        lastUpdate = millis();
    }
}
