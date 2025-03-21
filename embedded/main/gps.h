#ifndef GPS_H
#define GPS_H

#include <TinyGPSPlus.h>
#include <HardwareSerial.h>

void setupGPS();
void updateGPS();
bool isGPSUpdated();
float getLatitude();
float getLongitude();
void sendData(float latitude, float longitude, float heartRate, float spo2, signed int *ecgBuffer, const char* serverURL);

#endif
