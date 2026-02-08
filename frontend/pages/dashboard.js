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
  const handleFeed = async () => {
    if (isLoading) return;
    setIsLoading(true);

    // KITA SET DURASI 10 DETIK DI SINI
    const durasiDetik = 10; 

    try {
      const response = await fetch('/api/kontrol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          perintah: "MANUAL", // Perintah MAJU
          durasi: durasiDetik // Durasi 10 Detik
        }),
      });

      if (response.ok) {
        alert(`✅ SIP! Pakan dibuka selama ${durasiDetik} detik, nanti nutup sendiri.`);
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

  // Fungsi buat Mundur (Anti Macet) - Opsional kalau masih mau dipake
  const handleReverse = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await fetch('/api/kontrol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perintah: "MUNDUR", durasi: 5 }),
      });
      alert("🔄 Motor MUNDUR (Anti-Macet) dijalankan.");
    } catch (e) { alert("Error"); }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-sans">
      <Head>
        <title>Dashboard Pakan Ternak</title>
      </Head>

      <div className="max-w-md mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">🦆 Smart Feeder</h1>
          <button onClick={() => window.location.href = '/'} className="text-xs bg-gray-800 px-3 py-2 rounded border border-gray-700">Logout</button>
        </div>

        {/* STATUS ALAT */}
        <div className={`p-5 rounded-xl border shadow-lg flex items-center justify-between transition-all
          ${statusAlat === "ONLINE" ? "bg-green-900/40 border-green-500" : "bg-red-900/40 border-red-500"}`}>
          <div>
            <p className="text-gray-400 text-xs font-bold tracking-wider">STATUS ALAT</p>
            <h2 className="text-xl font-bold mt-1 flex items-center gap-2">
              {statusAlat === "ONLINE" ? "🟢 ONLINE" : "🔴 OFFLINE"}
            </h2>
          </div>
          <div className="text-right">
             <p className="text-[10px] text-gray-400">Update Terakhir:</p>
             <p className="text-sm font-mono">{lastUpdate}</p>
          </div>
        </div>

        {/* --- TOMBOL UTAMA (10 DETIK) --- */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl relative overflow-hidden group">
          
          <h3 className="text-lg font-bold mb-4 text-gray-200">🍽️ Beri Pakan Manual</h3>

          {/* Tombol Besar Biru */}
          <button
            onClick={handleFeed}
            disabled={isLoading}
            className={`w-full py-5 px-6 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-3
              ${isLoading 
                ? "bg-gray-600 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 border-b-4 border-blue-800"
              }
            `}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">⏳ Sedang Mengirim...</span>
            ) : (
              <>
                <span>🚀</span> KIRIM PAKAN (10 DETIK)
              </>
            )}
          </button>

          <p className="text-gray-500 text-xs text-center mt-3">
            *Alat akan membuka pakan selama 10 detik, lalu menutup otomatis.
          </p>
        </div>

        {/* TOMBOL DARURAT (MUNDUR) */}
        <div className="text-center">
            <button 
                onClick={handleReverse}
                disabled={isLoading}
                className="text-red-500 text-sm hover:text-red-400 hover:underline transition-all"
            >
                ⚠️ Pakan Nyangkut? Tekan tombol ini (Mundur)
            </button>
        </div>

      </div>
    </div>
  );
}