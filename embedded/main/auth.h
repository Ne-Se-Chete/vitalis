#ifndef AUTH_H
#define AUTH_H

#include <Arduino.h>
#define keycloakURL "https://keycloak.vitalis.nesechete.com/realms/nesechete/protocol/openid-connect/token"


String getAccessToken(String username, String password, String client_id);
String exchangeToken(String subject_token, String client_id, String audience = "");

#endif
