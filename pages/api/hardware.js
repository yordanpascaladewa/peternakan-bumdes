import dbConnect from '../../lib/db';
import Alat from '../../models/Alat';

export default async function handler(req, res) {
  await dbConnect();
  if (req.method === 'POST') {
    const { id } = req.body;

    // 1. Update status online alat
    let alat = await Alat.findOneAndUpdate(
      { id_alat: id },
      { status_koneksi: "ONLINE", terakhir_checkin: new Date() },
      { new: true, upsert: true }
    );

    // 2. Kirim perintah balik ke ESP32
    const responseData = {
      // Cek kalau ada perintah MANUAL atau MUNDUR
      perintah: alat.perintah_manual || "STANDBY",
      durasi: alat.durasi_manual || 0
    };

    // 3. Reset perintah di DB biar gak jalan terus-terusan
    if (alat.perintah_manual !== "STANDBY") {
      await Alat.findOneAndUpdate(
        { id_alat: id }, 
        { perintah_manual: "STANDBY", durasi_manual: 0 }
      );
    }

    res.status(200).json(responseData);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}