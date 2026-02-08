#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>

// ======================== KONFIGURASI ========================
const char* ssid = "Woke";              // Nama WiFi lu
const char* password = "golfzulu57";    // Password WiFi lu
// URL sudah diarahkan ke API hardware di project baru
const char* serverUrl = "https://peternakan-bumdes.vercel.app/api/hardware";
const char* ALAT_ID = "ALAT_UTAMA";     // Harus sama dengan ID di database

// KONFIGURASI RELAY (2 Channel)
const int PIN_MAJU = 26;   // IN1 (Maju/Keluar Pakan)
const int PIN_MUNDUR = 27;  // IN2 (Mundur/Anti-Macet)

void setup() {
  Serial.begin(115200);

  // Setup Pin Relay (Active LOW: HIGH=Mati, LOW=Nyala)
  pinMode(PIN_MAJU, OUTPUT);
  pinMode(PIN_MUNDUR, OUTPUT);

  // Pastikan Keduanya MATI dulu pas nyala
  digitalWrite(PIN_MAJU, HIGH);
  digitalWrite(PIN_MUNDUR, HIGH);

  Serial.println("\n=== TES HARDWARE (CEKLEK-CEKLEK) ===");
  // Tes Gerak Dikit buat mastiin relay idup
  digitalWrite(PIN_MAJU, LOW); delay(200); digitalWrite(PIN_MAJU, HIGH); delay(200);
  digitalWrite(PIN_MUNDUR, LOW); delay(200); digitalWrite(PIN_MUNDUR, HIGH); delay(200);

  // Koneksi WiFi
  WiFi.begin(ssid, password);
  Serial.print("Menghubungkan ke WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Connected!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient http;
    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");

    String httpRequestData = "{\"id\":\"ALAT_UTAMA\"}";
    int httpResponseCode = http.POST(httpRequestData);

    if (httpResponseCode == 200) {
      String response = http.getString();
      StaticJsonDocument<200> doc;
      deserializeJson(doc, response);

      String perintah = doc["perintah"]; // "MANUAL", "MUNDUR", atau "STANDBY"
      int durasi = doc["durasi"];

      if (perintah == "MANUAL") {
        Serial.println(">>> AKSI: MAJU (10 DETIK)");
        digitalWrite(26, LOW);  // Relay 1 Nyala
        delay(durasi * 1000);
        digitalWrite(26, HIGH); // Mati
      } 
      else if (perintah == "MUNDUR") {
        Serial.println(">>> AKSI: MUNDUR (10 DETIK)");
        digitalWrite(27, LOW);  // Relay 2 Nyala
        delay(durasi * 1000);
        digitalWrite(27, HIGH); // Mati
      }
    }
    http.end();
  }
  delay(3000);
}