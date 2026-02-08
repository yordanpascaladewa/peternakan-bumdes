import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db("peternakan"); 
    const { perintah, durasi } = req.body;

    // Menulis perintah ke database agar bisa dibaca hardware
    await db.collection("alats").updateOne(
      { id_alat: "ALAT_UTAMA" }, 
      { 
        $set: { 
          perintah_manual: perintah, 
          durasi_manual: durasi || 10,
          terakhir_diperbarui: new Date()
        } 
      },
      { upsert: true }
    );

    return res.status(200).json({ status: "success", message: `Perintah ${perintah} tersimpan` });
  } catch (e) {
    return res.status(500).json({ status: "error", message: e.message });
  }
}