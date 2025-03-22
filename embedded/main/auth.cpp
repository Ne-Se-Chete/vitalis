#include "auth.h"
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

String getAccessToken(String username, String password, String client_id) {
  HTTPClient http;
  http.begin(keycloakURL);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");

  String postData = 
      "grant_type=password"
      "&client_id=" + client_id +
      "&username=" + username +
      "&password=" + password;

  int httpResponseCode = http.POST(postData);
  String token = "";

  if (httpResponseCode == 200) {
    String response = http.getString();
    Serial.println("Initial response: " + response);
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, response);
    token = doc["access_token"].as<String>();
  } else {
    Serial.println("Token request failed: " + String(httpResponseCode));
  }

  http.end();
  return token;
}

String exchangeToken(String subject_token, String client_id, String audience) {
  HTTPClient http;
  http.begin(keycloakURL);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");

  String postData = 
      "grant_type=urn:ietf:params:oauth:grant-type:token-exchange"
      "&client_id=" + client_id +
      "&subject_token=" + subject_token;

  if (audience != "") {
    postData += "&audience=" + audience;
  }

  int httpResponseCode = http.POST(postData);
  String exchangedToken = "";

  if (httpResponseCode == 200) {
    String response = http.getString();
    Serial.println("Exchange response: " + response);
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, response);
    exchangedToken = doc["access_token"].as<String>();
  } else {
    Serial.println("Token exchange failed: " + String(httpResponseCode));
  }

  http.end();
  return exchangedToken;
}
