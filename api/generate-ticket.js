import admin from 'firebase-admin';
import generatePDF from '../utils/generatePDF.js';
import sendEmail from '../utils/sendEmail.js';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

export default async function handler(req, res) {
  // Set header CORS di semua jenis response
  res.setHeader('Access-Control-Allow-Origin', 'https://tiketartfestrealizm.netlify.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Preflight request
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, kontak, harga } = req.body;
    const docRef = db.collection('tickets').doc();
    const qrData = `ARTFEST-${docRef.id}`;

    await docRef.set({ name, email, kontak, harga, qr: qrData });

    const pdfPath = `/tmp/ticket-${docRef.id}.pdf`;
    await generatePDF({ name, email, kontak, harga, qrData, outputPath: pdfPath });

    await sendEmail({ email, name, pdfPath });

    return res.status(200).json({ success: true, message: 'Tiket berhasil dikirim!' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}
