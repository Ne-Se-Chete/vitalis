#include <SoftwareSerial.h>  // Make sure you're using ESPSoftwareSerial
#include <TinyGPSPlus.h>

#define RXD2 33
#define TXD2 32
#define GPS_BAUD 9600

// Create a SoftwareSerial instance for the GPS
SoftwareSerial gpsSerial(RXD2, TXD2);
TinyGPSPlus gps;

void setup() {
  // Start Serial Monitor
  Serial.begin(115200);
  
  // Start SoftwareSerial with the defined RX and TX pins and a baud rate of 9600
  gpsSerial.begin(GPS_BAUD);
  Serial.println("SoftwareSerial (GPS) started at 9600 baud rate");
}

void loop() {
  // Read GPS data from gpsSerial
  while (gpsSerial.available() > 0) {
    char gpsData = gpsSerial.read();
    // Pass every character to TinyGPSPlus for parsing
    gps.encode(gpsData);
    // (Optional) Still print raw data if you want
    Serial.print(gpsData);
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
  }

  // Optional: Warning if no data
  if (millis() > 10000 && gps.charsProcessed() < 10) {
    Serial.println(F("No GPS data detected. Check wiring or antenna."));
    while (true);
  }
}
