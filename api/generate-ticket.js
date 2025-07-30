import admin from 'firebase-admin';
import generatePDF from '../utils/generatePDF.js';
import sendEmail from '../utils/sendEmail.js';

// 🔍 DEBUG: Cek env
console.log("🔥 ENV TYPE:", typeof process.env.FIREBASE_SERVICE_ACCOUNT);

let serviceAccount;

try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  console.log("✅ FIREBASE Loaded:", serviceAccount.project_id);
} catch (err) {
  console.error("❌ Gagal parse FIREBASE_SERVICE_ACCOUNT:", err);
}

if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  // ✅ Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://tiketartfestrealizm.netlify.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, email, kontak, harga } = req.body;

    console.log("📨 Request Diterima:", { name, email, kontak, harga });

    const docRef = db.collection('tickets').doc();
    const qrData = `ARTFEST-${docRef.id}`;

    await docRef.set({ name, email, kontak, harga, qr: qrData });

    const pdfPath = `/tmp/ticket-${docRef.id}.pdf`;
    await generatePDF({ name, email, kontak, harga, qrData, outputPath: pdfPath });

    await sendEmail({ email, name, pdfPath });

    console.log("✅ Tiket berhasil dikirim ke", email);
    return res.status(200).json({ success: true, message: 'Tiket berhasil dikirim!' });

  } catch (error) {
    console.error('🔥 ERROR SAAT MEMPROSES TIKET:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}
