#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>

// --- KONFIGURASI WIFI ---
const char* ssid = "Woke";
const char* password = "golfzulu57";
const char* serverUrl = "https://peternakan-bumdes.vercel.app/api/hardware";

// --- KONFIGURASI PIN RELAY ---
const int PIN_MAJU = 26;   // Relay 1
const int PIN_MUNDUR = 27;  // Relay 2

void setup() {
  Serial.begin(115200);
  
  pinMode(PIN_MAJU, OUTPUT);
  pinMode(PIN_MUNDUR, OUTPUT);
  
  // Posisi awal MATI (Active LOW)
  digitalWrite(PIN_MAJU, HIGH);
  digitalWrite(PIN_MUNDUR, HIGH);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Connect!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure();
    
    HTTPClient http;
    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");

    // Kirim ID alat ke server
    String jsonRequest = "{\"id\":\"ALAT_UTAMA\"}";
    int httpCode = http.POST(jsonRequest);

    if (httpCode == 200) {
      String response = http.getString();
      Serial.println("Respon Server: " + response);

      StaticJsonDocument<200> doc;
      deserializeJson(doc, response);

      String perintah = doc["perintah"];
      int durasi = doc["durasi"];

      if (perintah == "MANUAL") {
        Serial.println(">>> EKSEKUSI: MAJU");
        digitalWrite(PIN_MAJU, LOW);  // NYALA
        delay(durasi * 1000);
        digitalWrite(PIN_MAJU, HIGH); // MATI
        Serial.println(">>> SELESAI");
      } 
      else if (perintah == "MUNDUR") {
        Serial.println(">>> EKSEKUSI: MUNDUR");
        digitalWrite(PIN_MUNDUR, LOW);  // NYALA
        delay(durasi * 1000);
        digitalWrite(PIN_MUNDUR, HIGH); // MATI
        Serial.println(">>> SELESAI");
      }
    }
    http.end();
  }
  delay(2000); // Cek setiap 2 detik
}