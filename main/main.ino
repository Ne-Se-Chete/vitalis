#include <WiFi.h>
#include "gps.h"
#include "heart_rate_sensor.h"
#include "auth.h"

const char* ssid = "#######";
const char* password = "########";
const char* serverURL = "http://###.###.###.###:5000/location";

float heartRate = 0;
float spO2 = 0;
SemaphoreHandle_t dataMutex;
bool shouldSend = false;
unsigned long lastSentTime = 0;

String accessToken = "";
String exchangedToken = "";

// Connect to WiFi
void setupWiFi() {
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nConnected!");
}

void authenticate() {
    Serial.println("Starting authentication...");

    // Ensure ESP32 is fully initialized before making the request
    delay(3000);

    accessToken = getAccessToken("nesechete", "nesechete");
    if (!accessToken.isEmpty()) {
        exchangedToken = exchangeToken(accessToken);
    }

    Serial.println("Authentication complete!");
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
    authenticate();
    setupGPS();
    setupHeartRateSensor();

    dataMutex = xSemaphoreCreateMutex();

    // Create a FreeRTOS task for sending data
    xTaskCreatePinnedToCore(
        sendTask,        // Task function
        "SendTask",      // Name
        4096,            // Stack size
        NULL,            // Parameters
        1,               // Priority
        NULL,            // Task handle
        1                // Core 1
    );
}

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
