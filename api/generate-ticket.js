import { readFile } from 'fs/promises';
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import generatePDF from '../utils/generatePDF.js';
import sendEmail from '../utils/sendEmail.js';

import generateTicketPDF from '../ticketTemplate.js';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://tiketartfestrealizm.netlify.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', 'https://tiketartfestrealizm.netlify.app');

  try {
    const { name, email, kontak, harga } = req.body;
    const docRef = db.collection('tickets').doc();
    const qrData = `ARTFEST-${docRef.id}`;

    await docRef.set({ name, email, kontak, harga, qr: qrData });

    const pdfPath = `/tmp/ticket-${docRef.id}.pdf`;
    await generateTicketPDF({ name, email, kontak, harga, qrData, outputPath: pdfPath });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"ArtFest ReaLizM" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Tiket ArtFest ReaLizM',
      text: `Halo ${name}, berikut tiket kamu.`,
      attachments: [{
        filename: 'tiket-artfest.pdf',
        path: pdfPath
      }]
    });

    return res.status(200).json({ success: true, message: 'Tiket berhasil dikirim!' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}
