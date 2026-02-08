import dbConnect from '../../lib/db';
import Alat from '../../models/Alat';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    const { id } = req.body;

    // 1. Update status alat jadi Online & ambil datanya
    let alat = await Alat.findOneAndUpdate(
      { id_alat: id },
      { status_koneksi: "ONLINE", terakhir_checkin: new Date() },
      { new: true, upsert: true }
    );

    // 2. Siapkan jawaban buat ESP32
    const responseData = {
      perintah: alat.perintah_manual || "STANDBY",
      durasi: alat.durasi_manual || 0
    };

    // 3. Reset perintah di DB kalau statusnya bukan STANDBY
    if (alat.perintah_manual && alat.perintah_manual !== "STANDBY") {
      await Alat.findOneAndUpdate(
        { id_alat: id },
        { perintah_manual: "STANDBY", durasi_manual: 0 }
      );
    }

    return res.status(200).json(responseData);
  } else {
    return res.status(405).json({ message: "Gunakan method POST" });
  }
}