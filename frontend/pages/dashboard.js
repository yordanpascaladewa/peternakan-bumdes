import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [statusAlat, setStatusAlat] = useState("OFFLINE");
  const [lastUpdate, setLastUpdate] = useState("-");

  // 1. Cek Status Alat (Auto-Refresh tiap 5 detik)
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/hardware');
        const data = await res.json();
        
        // Logika Status
        if (data && data.status === "ONLINE") {
            setStatusAlat("ONLINE");
        } else {
            setStatusAlat("OFFLINE");
        }
        setLastUpdate(new Date().toLocaleTimeString());
      } catch (err) {
        console.error("Gagal ambil status:", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); 
    return () => clearInterval(interval);
  }, []);

  // 2. Fungsi Tombol Kontrol
  const handleManualFeed = async (arah) => {
    if (isLoading) return;
    setIsLoading(true);

    const perintahKirim = arah === "MAJU" ? "MANUAL" : "MUNDUR";
    const durasiKirim = 10; // <--- UDAH GUA SET JADI 10 DETIK BANG! ⏱️

    try {
      const response = await fetch('/api/kontrol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          perintah: perintahKirim,
          durasi: durasiKirim
        }),
      });

      if (response.ok) {
        alert(`✅ SUKSES! Perintah '${arah}' selama 10 detik dikirim.`);
      } else {
        alert("❌ Gagal mengirim perintah.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("⚠️ Error koneksi internet.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <Head>
        <title>Dashboard Pakan Ternak</title>
      </Head>

      <div className="max-w-md mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">🦆 Smart Feeder</h1>
          <button onClick={() => window.location.href = '/'} className="text-sm bg-gray-800 px-3 py-1 rounded border border-gray-700">Logout</button>
        </div>

        {/* STATUS CARD */}
        <div className={`p-4 rounded-xl border flex items-center justify-between shadow-lg transition-all ${statusAlat === "ONLINE" ? "bg-green-900/30 border-green-500 shadow-green-500/20" : "bg-red-900/30 border-red-500 shadow-red-500/20"}`}>
          <div>
            <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Status Alat</p>
            <h2 className="text-2xl font-bold mt-1">{statusAlat === "ONLINE" ? "ALAT ONLINE 🟢" : "ALAT OFFLINE 🔴"}</h2>
          </div>
          <div className="text-right">
             <p className="text-xs text-gray-400">Terakhir dicek:</p>
             <p className="text-sm font-mono">{lastUpdate}</p>
          </div>
        </div>

        {/* KONTROL MANUAL (TOMBOL BARU) */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl relative">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center z-10 backdrop-blur-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="ml-3 font-bold">Mengirim...</span>
            </div>
          )}

          <h3 className="text-xl font-bold mb-4">🎮 Kontrol Manual</h3>

          <div className="flex flex-col gap-3">
            {/* TOMBOL MAJU */}
            <button
              onClick={() => handleManualFeed("MAJU")}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-lg transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
            >
              📤 KELUAR PAKAN (MAJU)
            </button>

            {/* TOMBOL MUNDUR (INI YANG LU CARI) */}
            <button
              onClick={() => handleManualFeed("MUNDUR")}
              className="w-full bg-transparent border-2 border-red-600 text-red-500 hover:bg-red-600 hover:text-white font-bold py-3 px-6 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              🔄 ANTI MACET (MUNDUR)
            </button>
          </div>
          <p className="text-gray-500 text-xs text-center mt-4">*Durasi otomatis 10 Detik</p>
        </div>

      </div>
    </div>
  );
}