#include "auth.h"
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

String getAccessToken(const char* username, const char* password) {
    HTTPClient http;
    WiFiClientSecure client;
    client.setInsecure(); // For development only, remove in production

    http.begin(client, "https://keycloak.vitalis.proper-invest.tech/realms/ne-se-chete/protocol/openid-connect/token");
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");

    String body = "grant_type=password&client_id=vitalis-node";
    body += "&username=" + String(username);
    body += "&password=" + String(password);

    int httpResponseCode = http.POST(body);
    String accessToken = "";

    if (httpResponseCode == 200) {
        // Stream JSON response directly to avoid holding large String
        StaticJsonDocument<2048> doc; 
        DeserializationError error = deserializeJson(doc, http.getStream());

        if (!error && doc.containsKey("access_token")) {
            accessToken = doc["access_token"].as<String>();
            Serial.println("Access token successfully extracted.");
        } else {
            Serial.print("JSON parsing failed: ");
            Serial.println(error.c_str());
        }
    } else {
        Serial.print("Auth request failed, code: ");
        Serial.println(httpResponseCode);
    }

    http.end();
    return accessToken;
}

String exchangeToken(String accessToken) {
    if (accessToken.isEmpty()) {
        Serial.println("No access token to exchange.");
        return "";
    }

    HTTPClient http;
    WiFiClientSecure client;
    client.setInsecure(); // For development only, remove in production

    http.begin(client, "https://keycloak.vitalis.proper-invest.tech/realms/ne-se-chete/protocol/openid-connect/token");
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");

    String body = "grant_type=urn:ietf:params:oauth:grant-type:token-exchange";
    body += "&client_id=vitalis-node";
    body += "&subject_token=" + accessToken;
    body += "&audience=vitalis";

    int httpResponseCode = http.POST(body);
    String exchangedToken = "";

    if (httpResponseCode == 200) {
        StaticJsonDocument<2048> doc; 
        DeserializationError error = deserializeJson(doc, http.getStream());

        if (!error && doc.containsKey("access_token")) {
            exchangedToken = doc["access_token"].as<String>();
            Serial.println("Exchanged token successfully extracted.");
        } else {
            Serial.print("JSON parsing failed: ");
            Serial.println(error.c_str());
        }
    } else {
        Serial.print("Token exchange failed, code: ");
        Serial.println(httpResponseCode);
    }

    http.end();
    return exchangedToken;
}
