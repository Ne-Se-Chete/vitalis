#include <WiFi.h>
#include <Arduino.h>
#include <HTTPClient.h>
#include <TinyGPSPlus.h>
#include <HardwareSerial.h>
#include "gps.h"
#include <ECG_Reader.h>

#define RXD2 33
#define TXD2 32
#define GPS_BAUD 9600

HardwareSerial gpsSerial(1);
TinyGPSPlus gps;
unsigned long lastGPSUpdate = 0;

void setupGPS() {
    gpsSerial.begin(GPS_BAUD, SERIAL_8N1, RXD2, TXD2);
}

void updateGPS() {
    unsigned long startTime = millis();
    
    while (gpsSerial.available() > 0) {
        char gpsData = gpsSerial.read();
        gps.encode(gpsData);

        // Timeout after 500ms to prevent blocking
        if (millis() - startTime > 500) {
            break;
        }
    }
}

bool isGPSUpdated() {
    return gps.location.isUpdated();
}

float getLatitude() {
    return gps.location.lat();
}

float getLongitude() {
    return gps.location.lng();
}

void sendData(float latitude, float longitude, float heartRate, float spo2, signed int *ecgBuffer, const char* serverURL, const char* bearerToken) {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverURL);
        http.addHeader("Authorization", String("Bearer ") + bearerToken);
        http.addHeader("Content-Type", "application/json");

        String ecgData = "";
        for (int i = 0; i < ECG_BUFFER_SIZE; i++) {
            ecgData += String(ecgBuffer[i]);
            if (i < ECG_BUFFER_SIZE - 1) ecgData += ",";
        }

        Serial.println(ecgData);
        Serial.println();


        String jsonPayload = "{"
                     "\"Latitude\": " + String(latitude, 6) +
                     ", \"Longitude\": " + String(longitude, 6) +
                     ", \"HeartRate\": " + String(heartRate, 2) +
                     ", \"BloodOxidation\": " + String(spo2, 2) +
                     ", \"Patient\": " + String(1) +
                     ", \"ECG\": \"" + ecgData + "\"" 
                     "}";

        int httpResponseCode = http.POST(jsonPayload);

        if (httpResponseCode > 0) {
            Serial.printf("Data sent successfully! Response: %d\n", httpResponseCode);
        } else {
            Serial.printf("Failed to send data. HTTP Response: %d\n", httpResponseCode);
        }

        http.end();

        clearECGBuffer();
    } else {
        Serial.println("No WiFi connection, skipping data send.");
    }
}
