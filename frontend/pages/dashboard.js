import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [statusAlat, setStatusAlat] = useState("OFFLINE"); // Default Offline
  const [lastUpdate, setLastUpdate] = useState("-");

  // 1. Cek Status Alat (Auto-Refresh tiap 5 detik)
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/hardware'); // Endpoint ini harus balikin status terakhir
        const data = await res.json();
        
        // Logika sederhana: Kalau data baru diupdate < 30 detik lalu = ONLINE
        // (Sesuaikan sama logika backend lu ya)
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
    const interval = setInterval(fetchStatus, 5000); // Cek tiap 5 detik
    return () => clearInterval(interval);
  }, []);

  // 2. Fungsi Tombol Kontrol (Maju/Mundur)
  const handleManualFeed = async (arah) => {
    if (isLoading) return;
    setIsLoading(true);

    const perintahKirim = arah === "MAJU" ? "MANUAL" : "MUNDUR";
    const durasiKirim = 5; // Default 5 detik

    try {
      const response = await fetch('/api/kontrol', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          perintah: perintahKirim,
          durasi: durasiKirim
        }),
      });

      if (response.ok) {
        alert(`✅ SUKSES! Perintah '${arah}' dikirim.`);
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
        
        {/* HEADER & LOGOUT */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🦆 Smart Feeder
          </h1>
          <button 
            onClick={() => window.location.href = '/'}
            className="text-sm bg-gray-800 px-3 py-1 rounded border border-gray-700 hover:bg-gray-700"
          >
            Logout
          </button>
        </div>

        {/* STATUS CARD */}
        <div className={`p-4 rounded-xl border flex items-center justify-between shadow-lg transition-all
          ${statusAlat === "ONLINE" 
            ? "bg-green-900/30 border-green-500 shadow-green-500/20" 
            : "bg-red-900/30 border-red-500 shadow-red-500/20"}`
        }>
          <div>
            <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Status Alat</p>
            <h2 className="text-2xl font-bold mt-1">
              {statusAlat === "ONLINE" ? "ALAT ONLINE 🟢" : "ALAT OFFLINE 🔴"}
            </h2>
          </div>
          <div className="text-right">
             <p className="text-xs text-gray-400">Terakhir dicek:</p>
             <p className="text-sm font-mono">{lastUpdate}</p>
          </div>
        </div>

        {/* JADWAL (Placeholder) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Pagi (09:00 - 7kg)</p>
            <p className="font-bold text-lg">⏳ BELUM</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Sore (15:00 - 8kg)</p>
            <p className="font-bold text-lg">⏳ BELUM</p>
          </div>
        </div>

        {/* KONTROL MANUAL (BAGIAN UTAMA) */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl relative overflow-hidden">
          {/* Efek Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center z-10 backdrop-blur-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="ml-3 font-bold">Mengirim Perintah...</span>
            </div>
          )}

          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            🎮 Kontrol Manual
          </h3>

          <div className="flex flex-col gap-3">
            {/* TOMBOL MAJU */}
            <button
              onClick={() => handleManualFeed("MAJU")}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
            >
              <span>📤</span> KIRIM PAKAN SEKARANG (MAJU)
            </button>

            {/* TOMBOL MUNDUR */}
            <button
              onClick={() => handleManualFeed("MUNDUR")}
              className="w-full bg-transparent border-2 border-red-600 text-red-500 hover:bg-red-600 hover:text-white font-bold py-3 px-6 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>🔄</span> ANTI MACET (MUNDUR)
            </button>
          </div>

          <p className="text-gray-500 text-xs text-center mt-4">
            *Tombol Biru untuk memberi pakan normal.<br/>
            *Tombol Merah untuk memutar balik motor jika macet.
          </p>
        </div>

      </div>
    </div>
  );
}