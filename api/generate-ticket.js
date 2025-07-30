import sendEmail from '../utils/sendEmail.js';
import generatePDF from '../utils/generatePDF.js';
import fs from 'fs';

export default async function handler(req, res) {
  // ✅ Tambahan untuk fix CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*'); // ganti * dengan domain Netlify kamu jika ingin lebih aman

  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, kontak, harga } = req.body;
  const id = Date.now().toString();
  const qrData = `ARTFEST-${id}`;
  const pdfPath = `/tmp/ticket-${id}.pdf`;

  try {
    await generatePDF({ name, email, kontak, harga, qrData, outputPath: pdfPath });
    await sendEmail(email, name, pdfPath);
    res.status(200).json({ success: true, message: 'Tiket dikirim ke email!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}
