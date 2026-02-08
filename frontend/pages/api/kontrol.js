import clientPromise from "../../lib/mongodb"; // Pastikan path ini sesuai sama project lu

export default async function handler(req, res) {
  // Hanya terima method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db("peternakan"); // Nama Database Lu

    // Ambil data dari Body yang dikirim Website
    const { perintah, durasi } = req.body;

    // Validasi input
    if (!perintah) {
      return res.status(400).json({ message: 'Perintah tidak boleh kosong' });
    }

    // Update status di Database (Collection: 'status_alat')
    // Kita update field 'manual_command' atau 'perintah'
    // Sesuai logika hardware.js lu yang membaca field 'perintah'
    
    const updateResult = await db.collection("status_alat").updateOne(
      { id: "ALAT_UTAMA" }, // Filter cari alat
      { 
        $set: { 
          perintah: perintah, // "MANUAL" atau "MUNDUR"
          durasi: durasi || 5,
          last_updated: new Date()
        } 
      },
      { upsert: true } // Buat baru kalau belum ada
    );

    res.status(200).json({ 
      message: 'Berhasil update perintah', 
      data: { perintah, durasi } 
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}