#ifndef ECG_READER_H
#define ECG_READER_H

#include <Arduino.h>

#define OUTPUT_AD8323 35
#define LO_MINUS 26
#define LO_PLUS 25

extern const size_t ECG_BUFFER_SIZE;
extern signed int ecgBuffer[];
extern size_t ecgIndex;
extern SemaphoreHandle_t ecgDataMutex;

void setupECG();
int readECGValue();
void clearECGBuffer();
void startECGTask();

#endif
