import admin from 'firebase-admin';
import generatePDF from '../utils/generatePDF.js';
import sendEmail from '../utils/sendEmail.js';

// 🔍 Debug environment
console.log("🔥 FIREBASE_SERVICE_ACCOUNT type:", typeof process.env.FIREBASE_SERVICE_ACCOUNT);

let serviceAccount;

try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  console.log("✅ Firebase config loaded for project:", serviceAccount.project_id);
} catch (err) {
  console.error("❌ ERROR parsing FIREBASE_SERVICE_ACCOUNT:", err);
}

if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  // ✅ Tangani CORS preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://tiketartfestrealizm.netlify.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end(); // preflight OK
  }

  // ✅ CORS untuk semua response lainnya
  res.setHeader('Access-Control-Allow-Origin', 'https://tiketartfestrealizm.netlify.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, email, kontak, harga } = req.body;
    console.log("📨 New request:", { name, email, kontak, harga });

    const docRef = db.collection('tickets').doc();
    const qrData = `ARTFEST-${docRef.id}`;

    await docRef.set({ name, email, kontak, harga, qr: qrData });

    const pdfPath = `/tmp/ticket-${docRef.id}.pdf`;
    await generatePDF({ name, email, kontak, harga, qrData, outputPath: pdfPath });

    await sendEmail({ email, name, pdfPath });

    console.log("✅ Tiket berhasil dikirim ke:", email);
    return res.status(200).json({ success: true, message: 'Tiket berhasil dikirim!' });

  } catch (error) {
    console.error("🔥 ERROR saat proses:", error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

