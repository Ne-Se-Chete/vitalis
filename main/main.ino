#include <WiFi.h>
#include "gps.h"
#include "heart_rate_sensor.h"

const char* ssid = "bobinet";
const char* password = "bobkata2";
const char* serverURL = "http://192.168.107.164:5000/location";

float heartRate = 0;
float spO2 = 0;

// Shared flag and mutex
SemaphoreHandle_t dataMutex;
bool shouldSend = false;

void setupWiFi() {
    WiFi.begin(ssid, password);
    unsigned long start = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - start < 10000) {
        delay(500);
    }
}

void sendTask(void *parameter) {
    while (true) {
        if (shouldSend) {
            xSemaphoreTake(dataMutex, portMAX_DELAY);
            float hr = heartRate;
            float s = spO2;
            shouldSend = false;
            xSemaphoreGive(dataMutex);

            sendData(23, 23, hr, s, serverURL);
        }
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}

void setup() {
    Serial.begin(115200);
    setupWiFi();
    setupGPS();
    setupHeartRateSensor();

    dataMutex = xSemaphoreCreateMutex();

    xTaskCreatePinnedToCore(
        sendTask,        // Task function
        "SendTask",      // Name
        4096,            // Stack size
        NULL,            // Parameters
        1,               // Priority
        NULL,            // Task handle
        0                // Core 0
    );
}

unsigned long lastSentTime = 0;

void loop() {
    updateHeartRateSensor();
    updateGPS();

    xSemaphoreTake(dataMutex, portMAX_DELAY);
    heartRate = getHeartRate();
    spO2 = getSpO2();
    xSemaphoreGive(dataMutex);

    Serial.printf("HR: %.2f | SpO2: %.2f\n", heartRate, spO2);

    if (millis() - lastSentTime >= 10000) {
        shouldSend = true;
        lastSentTime = millis();
    }

    delay(100);
}
