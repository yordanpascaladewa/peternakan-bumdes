import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db("peternakan"); // Pastikan nama DB bener
    const { perintah, durasi } = req.body;

    // UPDATE Tabel 'alats' supaya dibaca hardware.js
    await db.collection("alats").updateOne(
      { id_alat: "ALAT_UTAMA" }, // Filter ID Alat lu
      { 
        $set: { 
          perintah_manual: perintah, // "MANUAL" atau "MUNDUR"
          durasi_manual: durasi || 10,
          last_updated: new Date()
        } 
      },
      { upsert: true }
    );

    res.status(200).json({ message: 'Sukses update perintah' });
  } catch (e) {
    res.status(500).json({ message: 'Server Error' });
  }
}