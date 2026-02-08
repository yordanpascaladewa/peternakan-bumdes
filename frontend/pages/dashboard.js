import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [manualDurasi, setManualDurasi] = useState(10);
  const router = useRouter();

  // Cek Login & Ambil Data Rutin
  useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) router.push('/');
    
    const interval = setInterval(fetchData, 2000); // Update tiap 2 detik
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/kontrol');
      setData(res.data);
    } catch (err) { console.error(err); }
  };

  const kirimManual = async () => {
    await axios.post('/api/kontrol', { durasi: manualDurasi });
    alert(`Perintah Manual ${manualDurasi} Detik Dikirim!`);
  };

  // Cek Online (Batas toleransi 1 menit)
  const isOnline = data?.terakhir_checkin && (new Date() - new Date(data.terakhir_checkin) < 60000);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">🦆 Smart Feeder</h1>
          <button onClick={() => {localStorage.removeItem('isLoggedIn'); router.push('/')}} className="text-red-400 text-sm border border-red-500 px-3 py-1 rounded">Logout</button>
        </div>

        {/* STATUS KONEKSI */}
        <div className={`p-4 rounded-xl mb-6 text-center font-bold text-xl ${isOnline ? 'bg-green-600' : 'bg-red-600'}`}>
          {isOnline ? "ALAT ONLINE 🟢" : "ALAT OFFLINE 🔴"}
        </div>

        {/* JADWAL HARI INI */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className={`p-4 rounded-xl border ${data?.pakan_pagi ? 'bg-green-900 border-green-500' : 'bg-gray-800 border-gray-600'}`}>
            <p className="text-gray-400 text-xs">Pagi (09:00 - 7kg)</p>
            <p className="text-lg font-bold">{data?.pakan_pagi ? "✅ SELESAI" : "⏳ BELUM"}</p>
          </div>
          <div className={`p-4 rounded-xl border ${data?.pakan_sore ? 'bg-green-900 border-green-500' : 'bg-gray-800 border-gray-600'}`}>
            <p className="text-gray-400 text-xs">Sore (15:00 - 8kg)</p>
            <p className="text-lg font-bold">{data?.pakan_sore ? "✅ SELESAI" : "⏳ BELUM"}</p>
          </div>
        </div>

        {/* KONTROL MANUAL */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="mb-4 font-bold text-lg">🎮 Manual Feed</h3>
          <div className="flex gap-2 mb-4">
            <input 
              type="number" 
              value={manualDurasi}
              onChange={(e) => setManualDurasi(e.target.value)}
              className="w-full p-3 rounded text-black font-bold text-center text-xl"
            />
            <span className="self-center font-bold">Detik</span>
          </div>
          <button 
            onClick={kirimManual}
            disabled={!isOnline}
            className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed">
            KIRIM PAKAN SEKARANG
          </button>
        </div>
      </div>
    </div>
  );
}