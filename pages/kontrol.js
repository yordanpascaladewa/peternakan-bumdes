import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db("peternakan"); // Pastikan nama DB bener

    const { perintah, durasi } = req.body;

    // Update Database biar ESP32 baca
    await db.collection("status_alat").updateOne(
      { id: "ALAT_UTAMA" },
      { 
        $set: { 
          perintah: perintah, // "MANUAL" atau "MUNDUR"
          durasi: durasi || 10, // Kalau kosong, default 10 detik
          last_updated: new Date()
        } 
      },
      { upsert: true }
    );

    res.status(200).json({ message: 'Sukses update perintah' });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server Error' });
  }
}