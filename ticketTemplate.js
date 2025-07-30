import fs from 'fs';
import PDFDocument from 'pdfkit';
import qr from 'qr-image';
import generateTicketPDF from '../utils/generateTicketPDF.js';

await generateTicketPDF({ name, email, kontak, harga, qrData, outputPath });

export default async function generateTicketPDF({ name, email, kontak, harga, qrData, outputPath }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A5',
      layout: 'landscape'
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.image('./assets/template.png', 0, 0, { width: 595, height: 420 });

    doc.font('Helvetica-Bold').fontSize(24).fillColor('white');
    doc.text(name, 50, 50);

    doc.fontSize(14).fillColor('white');
    doc.text(`Email: ${email}`, 50, 90);
    doc.text(`Kontak: ${kontak}`, 50, 110);
    doc.text(`Harga Tiket: ${harga}`, 50, 130);

    const qr_png = qr.imageSync(qrData, { type: 'png' });
    doc.image(qr_png, 450, 250, { width: 100 });

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}
