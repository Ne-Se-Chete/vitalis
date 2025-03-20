#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPSPlus.h>
#include <HardwareSerial.h>  // Use HardwareSerial instead of SoftwareSerial

#define RXD2 33
#define TXD2 32
#define GPS_BAUD 9600

// Use HardwareSerial for GPS to avoid conflicts
HardwareSerial gpsSerial(1);
TinyGPSPlus gps;

// WiFi Credentials
const char* ssid = "bobinet";  // Change this
const char* password = "bobkata2";  // Change this

// Server URL
const char* serverURL = "http://192.168.107.164:5000/location";

// Function to connect WiFi
void setupWiFi() {
    Serial.print("Connecting to WiFi...");
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.print(".");
    }
    Serial.println("\nConnected to WiFi!");
}

// Function to send GPS location data to Flask server
void sendLocation(float latitude, float longitude) {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverURL);
        http.addHeader("Content-Type", "application/json");

        // Create JSON payload
        String jsonPayload = "{\"latitude\": " + String(latitude, 6) + 
                             ", \"longitude\": " + String(longitude, 6) + "}";

        int httpResponseCode = http.POST(jsonPayload);
        if (httpResponseCode > 0) {
            String response = http.getString();
            Serial.println("Server Response: " + response);
        } else {
            Serial.println("Error sending data: " + String(httpResponseCode));
        }

        http.end();
    } else {
        Serial.println("WiFi not connected, unable to send data.");
    }
}

void setup() {
    Serial.begin(115200);

    setupWiFi();  // Connect to WiFi first

    // Start GPS on HardwareSerial (UART1)
    gpsSerial.begin(GPS_BAUD, SERIAL_8N1, RXD2, TXD2);
    Serial.println("HardwareSerial (GPS) started at 9600 baud rate");
}

void loop() {
    // Read GPS data from gpsSerial
    while (gpsSerial.available() > 0) {
        char gpsData = gpsSerial.read();
        gps.encode(gpsData);
        Serial.print(gpsData);  // Print raw GPS data
    }

    // When TinyGPSPlus gets an updated location, print it
    if (gps.location.isUpdated()) {
        Serial.println("\n-------------------------------");
        Serial.print("Latitude: ");
        Serial.println(gps.location.lat(), 6);
        Serial.print("Longitude: ");
        Serial.println(gps.location.lng(), 6);
        Serial.print("Speed (km/h): ");
        Serial.println(gps.speed.kmph());
        Serial.print("Altitude (m): ");
        Serial.println(gps.altitude.meters());
        Serial.print("Satellites: ");
        Serial.println(gps.satellites.value());
        Serial.print("Date: ");
        Serial.print(gps.date.day());
        Serial.print("/");
        Serial.print(gps.date.month());
        Serial.print("/");
        Serial.println(gps.date.year());
        Serial.print("Time (UTC): ");
        Serial.print(gps.time.hour());
        Serial.print(":");
        Serial.print(gps.time.minute());
        Serial.print(":");
        Serial.println(gps.time.second());

        // Google Maps link
        Serial.print("Google Maps: https://maps.google.com/?q=");
        Serial.print(gps.location.lat(), 6);
        Serial.print(",");
        Serial.println(gps.location.lng(), 6);
        Serial.println("-------------------------------\n");

        // Send data to server
        sendLocation(gps.location.lat(), gps.location.lng());
    }

    delay(5000); // Send data every 5 seconds
}
