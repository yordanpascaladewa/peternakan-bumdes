import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [statusAlat, setStatusAlat] = useState("OFFLINE");
  const [lastUpdate, setLastUpdate] = useState("-");

  // Cek Status Alat (Auto-Refresh 5 detik)
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
      } catch (err) { console.error(err); }
    };
    fetchStatus();
    setInterval(fetchStatus, 5000); 
  }, []);

  // FUNGSI UTAMA: KIRIM PERINTAH
  const kirimPerintah = async (arah) => {
    if (isLoading) return;
    setIsLoading(true);

    // Tentukan Perintah: MAJU ("MANUAL") atau MUNDUR
    const command = arah === "MAJU" ? "MANUAL" : "MUNDUR";
    
    // DURASI FIX 10 DETIK
    const durasiDetik = 10; 

    try {
      const response = await fetch('/api/kontrol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          perintah: command, 
          durasi: durasiDetik 
        }),
      });

      if (response.ok) {
        alert(`✅ SUKSES! Motor ${arah} selama 10 detik.`);
      } else {
        alert("❌ Gagal kirim perintah.");
      }
    } catch (error) {
      alert("⚠️ Error koneksi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-sans">
      <Head><title>Kontrol Pakan</title></Head>

      <div className="max-w-md mx-auto space-y-6">
        
        {/* STATUS CARD */}
        <div className={`p-4 rounded-xl border flex justify-between items-center shadow-lg
          ${statusAlat === "ONLINE" ? "bg-green-900/40 border-green-500" : "bg-red-900/40 border-red-500"}`}>
          <div>
            <h2 className="text-xl font-bold">
              {statusAlat === "ONLINE" ? "🟢 ALAT ONLINE" : "🔴 ALAT OFFLINE"}
            </h2>
          </div>
          <div className="text-right text-xs text-gray-400">
             <p>Update: {lastUpdate}</p>
          </div>
        </div>

        {/* KONTROL PANEL */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
          <h3 className="text-lg font-bold mb-4 text-center">🎮 KONTROL MANUAL</h3>

          <div className="flex flex-col gap-4">
            
            {/* TOMBOL MAJU 10 DETIK */}
            <button
              onClick={() => kirimPerintah("MAJU")}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-lg shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2"
            >
              {isLoading ? "⏳ Mengirim..." : "📤 MAJU (KELUAR PAKAN) - 10 Detik"}
            </button>

            {/* TOMBOL MUNDUR 10 DETIK */}
            <button
              onClick={() => kirimPerintah("MUNDUR")}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-lg shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2"
            >
               {isLoading ? "⏳ Mengirim..." : "🔄 MUNDUR (ANTI MACET) - 10 Detik"}
            </button>

          </div>
          <p className="text-gray-500 text-xs text-center mt-4">*Setiap tombol akan menyalakan motor selama 10 detik lalu mati otomatis.</p>
        </div>

      </div>
    </div>
  );
}