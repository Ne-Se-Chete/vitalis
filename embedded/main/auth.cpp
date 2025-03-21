#include "auth.h"
#include <WiFiClientSecure.h>
#include <HTTPClient.h>

String getAccessToken(const char* username, const char* password) {
    HTTPClient http;
    WiFiClientSecure client;
    client.setInsecure();  // For development only, remove this in production

    http.begin(client, "https://keycloak.vitalis.proper-invest.tech/realms/ne-se-chete/protocol/openid-connect/token");
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");

    String body = "grant_type=password&client_id=vitalis-node";
    body += "&username=" + String(username);
    body += "&password=" + String(password);

    int httpResponseCode = http.POST(body);

    if (httpResponseCode == 200) {
        String payload = http.getString();
        Serial.println("First Request Successful. Response:");
        Serial.println(payload);

        int tokenStart = payload.indexOf("access_token\":\"") + strlen("access_token\":\"");
        int tokenEnd = payload.indexOf("\"", tokenStart);
        String accessToken = payload.substring(tokenStart, tokenEnd);

        http.end();
        return accessToken;
    } else {
        Serial.print("First Request Failed! Code: ");
        Serial.println(httpResponseCode);
        http.end();
        return "";
    }
}

String exchangeToken(String accessToken) {
    if (accessToken.isEmpty()) {
        Serial.println("No Access Token to exchange.");
        return "";
    }

    HTTPClient http;
    WiFiClientSecure client;
    client.setInsecure();  // For development only, remove this in production

    http.begin(client, "https://keycloak.vitalis.proper-invest.tech/realms/ne-se-chete/protocol/openid-connect/token");
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");

    String body = "grant_type=urn:ietf:params:oauth:grant-type:token-exchange";
    body += "&client_id=vitalis-node";
    body += "&subject_token=" + accessToken;
    body += "&audience=vitalis";

    int httpResponseCode = http.POST(body);

    if (httpResponseCode == 200) {
        String payload = http.getString();
        Serial.println("Second Request Successful. Response:");
        Serial.println(payload);

        int tokenStart = payload.indexOf("access_token\":\"") + strlen("access_token\":\"");
        int tokenEnd = payload.indexOf("\"", tokenStart);
        String exchangedToken = payload.substring(tokenStart, tokenEnd);

        http.end();
        return exchangedToken;
    } else {
        Serial.print("Second Request Failed! Code: ");
        Serial.println(httpResponseCode);
        http.end();
        return "";
    }
}
