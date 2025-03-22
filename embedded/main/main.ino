#include <WiFi.h>
#include "gps.h"
#include "heart_rate_sensor.h"
#include "auth.h"
#include "ECG_Reader.h"
#include <HTTPClient.h>
#include <ArduinoJson.h>


const char* ssid = "####";
const char* password = "####";

float heartRate = 0;
float spO2 = 0;
SemaphoreHandle_t dataMutex;
bool shouldSend = false;
unsigned long lastSentTime = 0;

String bearerToken = "";
String exchangedToken = "";

String syncUserIdURL = "https://app.vitalis.nesechete.com/services/ts/vitalis/api/syncUserId.ts";
String measurmentsURL = "https://app.vitalis.nesechete.com/services/ts/vitalis/gen/vitalis/api/Measurements/MeasurementsService.ts";


int userId = 1;

#define BUTTON_PIN 5
volatile bool buttonPressed = false;


void getSyncUserId(String bearerToken, String username) {
  HTTPClient http;
  
  String url = syncUserIdURL + "?username=" + username;

  http.begin(url);
  http.addHeader("Authorization", "Bearer " + bearerToken); 
    http.addHeader("Content-Type", "application/json");

  
  int httpResponseCode = http.GET();
  
  if (httpResponseCode == 200) {
    String response = http.getString();
    Serial.println("syncUserId response: " + response);
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, response);
    if(doc["userId"].as<int>() != -1){
      userId = doc["userId"].as<int>();
    }
  } else {
    Serial.println("syncUserId GET failed: " + String(httpResponseCode));
  }

  http.end(); 
}

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
  Serial.println("Step 1: Getting initial token...");
  bearerToken  = getAccessToken("bobcho", "bobcho", "vitalis-node");
  
  do {
    Serial.println("Step 2: Exchanging token for client_id=vitalis...");
    exchangedToken = exchangeToken(bearerToken, "vitalis-node", "vitalis");

    do {
      Serial.println("Step 3: Making GET request to syncUserId.ts...");
      getSyncUserId(exchangedToken, "bobcho");

    } while (exchangedToken == "");
  } while (bearerToken == "");
}

void sendTask(void *parameter) {
    while (true) {
        if (shouldSend) {
            xSemaphoreTake(dataMutex, portMAX_DELAY);
            float hr = heartRate;
            float s = spO2;
            shouldSend = false;
            xSemaphoreGive(dataMutex);

            sendData(23, 23, hr, s, ecgBuffer, measurmentsURL.c_str(), bearerToken.c_str());
        }
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}

void IRAM_ATTR buttonISR() {
  buttonPressed = true;
}

void setup() {
    Serial.begin(115200);
    pinMode(BUTTON_PIN, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(BUTTON_PIN), buttonISR, FALLING);  

    setupWiFi();
    setupECG();
    authenticate();
    setupGPS();
    setupHeartRateSensor();
  
    dataMutex = xSemaphoreCreateMutex();

    startECGTask();
    // Create a FreeRTOS task for sending data to
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
    if (buttonPressed) {

      shouldSend = true;
      buttonPressed = false;
    }

    updateHeartRateSensor();
    updateGPS();

    xSemaphoreTake(dataMutex, portMAX_DELAY);
    heartRate = getHeartRate();
    spO2 = getSpO2();
    xSemaphoreGive(dataMutex);

    // // Serial.printf("HR: %.2f | SpO2: %.2f\n", heartRate, spO2);

    // if (millis() - lastSentTime >= 10000) {
    //     lastSentTime = millis();
    // }

    delay(100);
}

