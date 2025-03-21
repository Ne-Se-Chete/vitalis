#ifndef AUTH_H
#define AUTH_H

#include <Arduino.h>

String getAccessToken(const char* username, const char* password);
String exchangeToken(String accessToken);

#endif
