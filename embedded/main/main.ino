#include <TinyGsmClient.h>
#include <ArduinoHttpClient.h>
#include <ArduinoJson.h>

#include "gps.h"
#include "heart_rate_sensor.h"
#include "auth.h"
#include "ECG_Reader.h"

#define SIM800L_AXP192_VERSION_20200327

#define DUMP_AT_COMMANDS

#define SerialAT  Serial1

#define TINY_GSM_MODEM_SIM800          
#define TINY_GSM_RX_BUFFER      1024

#ifdef DUMP_AT_COMMANDS
#include <StreamDebugger.h>
StreamDebugger debugger(SerialAT, Serial);
TinyGsm modem(debugger);
#else
TinyGsm modem(SerialAT);
#endif

TinyGsmClient client(modem);

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

            sendData(getLatitude(), getLongitude(), hr, s, ecgBuffer, measurmentsURL.c_str(), bearerToken.c_str());
        }
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}

void setup() {
    Serial.begin(115200);

    setupModem();

    SerialAT.begin(115200, SERIAL_8N1, MODEM_RX, MODEM_TX);
    delay(6000);

    Serial.println("Initializing modem...");
    modem.restart();

    Serial.print("Connecting to GSM network...");
    if (!modem.waitForNetwork()) {
        Serial.println("Failed to connect to network");
        while (true); 
    }
    Serial.println("Connected to network");

    Serial.print("Connecting to GPRS with APN: ");
    Serial.println(apn);
    if (!modem.gprsConnect(apn, gprsUser, gprsPass)) {
        Serial.println("Failed to connect to GPRS");
        while (true);  
    }
    Serial.println("Connected to GPRS");
}

void loop() {

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

    updateHeartRateSensor();
    updateGPS();

    xSemaphoreTake(dataMutex, portMAX_DELAY);
    heartRate = getHeartRate();
    spO2 = getSpO2();
    xSemaphoreGive(dataMutex);

    // Serial.printf("HR: %.2f | SpO2: %.2f\n", heartRate, spO2);

    if (millis() - lastSentTime >= 10000) {
        lastSentTime = millis();
    }

    delay(100);
}

