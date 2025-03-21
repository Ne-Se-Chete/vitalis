#ifndef HEART_RATE_SENSOR_H
#define HEART_RATE_SENSOR_H

#include <Arduino.h>
#include "MAX30100_PulseOximeter.h"

void setupHeartRateSensor();
void updateHeartRateSensor();
float getHeartRate();
float getSpO2();

#endif
