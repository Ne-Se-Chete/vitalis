#include "ECG_Reader.h"

const size_t ECG_BUFFER_SIZE = 500;
signed int ecgBuffer[ECG_BUFFER_SIZE];
size_t ecgIndex = 0;
SemaphoreHandle_t ecgDataMutex = NULL;

void setupECG() {
  pinMode(LO_PLUS, INPUT);
  pinMode(LO_MINUS, INPUT);
  pinMode(OUTPUT_AD8323, INPUT);
}

void clearECGBuffer() {
  xSemaphoreTake(ecgDataMutex, portMAX_DELAY);
  ecgIndex = 0;
  xSemaphoreGive(ecgDataMutex);
}

int readECGValue() {
  if (digitalRead(LO_PLUS) == 1 || digitalRead(LO_MINUS) == 1) {
    Serial.println("-1");
    return -1; // leads off detected
  } else {
    int ecgValue = analogRead(OUTPUT_AD8323);
    Serial.println(ecgValue);
    return ecgValue;

  }
}

void ecgReadTask(void *parameter) {
  while (true) {
    signed int ecgValue = readECGValue();

    xSemaphoreTake(ecgDataMutex, portMAX_DELAY);
    if (ecgValue != -1) {
      if (ecgIndex < ECG_BUFFER_SIZE) {
        ecgBuffer[ecgIndex++] = ecgValue;
      }
    }else{
      if (ecgIndex < ECG_BUFFER_SIZE) {
        ecgBuffer[ecgIndex++] = -1;
      }
    }
    xSemaphoreGive(ecgDataMutex);

    delay(1); // adjust sampling rate if needed
  }
}

void startECGTask() {
  ecgDataMutex = xSemaphoreCreateMutex();
  xTaskCreatePinnedToCore(
    ecgReadTask,
    "ECGReadTask",
    4096,
    NULL,
    1,
    NULL,
    1 // Run on Core 0, opposite to sending
  );
}
