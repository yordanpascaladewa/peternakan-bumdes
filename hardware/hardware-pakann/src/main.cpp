#include <Arduino.h>
#include <SPI.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WiFiClientSecure.h>

// ================= KONFIGURASI =================
const char* ssid = "Woke";          
const char* password = "golfzulu57";    
const char* serverUrl = "https://peternakan-bumdes.vercel.app/api/hardware";
const char* ALAT_ID = "ALAT_UTAMA";

// KONFIGURASI RELAY (2 Channel)
const int PIN_MAJU = 26;   // IN1 (Maju/Keluar Pakan)
const int PIN_MUNDUR = 27; // IN2 (Mundur/Anti-Macet)

void setup() {
  Serial.begin(115200);
  
  // Setup Pin Relay (Active LOW: HIGH=Mati, LOW=Nyala)
  pinMode(PIN_MAJU, OUTPUT);
  pinMode(PIN_MUNDUR, OUTPUT);
  
  // Pastikan Keduanya MATI dulu pas nyala
  digitalWrite(PIN_MAJU, HIGH);
  digitalWrite(PIN_MUNDUR, HIGH);

  Serial.println("\n=== TES HARDWARE (CEKLEK-CEKLEK) ===");
  // Tes Maju Dikit
  digitalWrite(PIN_MAJU, LOW); delay(200); digitalWrite(PIN_MAJU, HIGH); delay(200);
  // Tes Mundur Dikit
  digitalWrite(PIN_MUNDUR, LOW); delay(200); digitalWrite(PIN_MUNDUR, HIGH); delay(200);

  // Konek WiFi
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
    client.setInsecure(); // Bypass SSL
    
    HTTPClient http;
    
    if (http.begin(client, serverUrl)) { 
      
      http.addHeader("Content-Type", "application/json");
      StaticJsonDocument<200> doc;
      doc["id"] = ALAT_ID;
      doc["status"] = "ONLINE"; 
      
      String requestBody;
      serializeJson(doc, requestBody);

      int httpResponseCode = http.POST(requestBody);
      
      if (httpResponseCode == 200) {
        String response = http.getString();
        
        StaticJsonDocument<1024> docResponse;
        DeserializationError error = deserializeJson(docResponse, response);

        if (!error) {
          String perintah = docResponse["perintah"].as<String>();
          int durasi = docResponse["durasi"].as<int>(); // Ambil durasi dari server

          if (durasi <= 0) durasi = 5; // Default 5 detik kalau kosong

          // === LOGIKA GERAK ===
          if (perintah == "MANUAL" || perintah == "MAJU") {
            Serial.println("🦆 GERAK: MAJU (Pakan Keluar)...");
            
            digitalWrite(PIN_MUNDUR, HIGH); // Pastikan mundur MATI
            delay(100); // Safety delay
            digitalWrite(PIN_MAJU, LOW);    // Maju NYALA
            
            delay(durasi * 1000); // Tunggu sesuai durasi
            
            digitalWrite(PIN_MAJU, HIGH);   // MATI
            Serial.println("✅ Selesai Maju.");
            
          } else if (perintah == "MUNDUR") {
            Serial.println("⚠️ GERAK: MUNDUR (Anti-Macet)...");
            
            digitalWrite(PIN_MAJU, HIGH);   // Pastikan maju MATI
            delay(100); // Safety delay
            digitalWrite(PIN_MUNDUR, LOW);  // Mundur NYALA
            
            delay(durasi * 1000); // Tunggu sesuai durasi
            
            digitalWrite(PIN_MUNDUR, HIGH); // MATI
            Serial.println("✅ Selesai Mundur.");
          }
        } 
      }
      http.end();
    }
  }
  delay(1000); 
}