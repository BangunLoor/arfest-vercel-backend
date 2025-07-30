import fs from 'fs';
import PDFDocument from 'pdfkit';
import qr from 'qr-image';

export default async function generatePDF({ name, email, kontak, harga, qrData, outputPath }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A5',
      layout: 'landscape'
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // ✅ Load background dari buffer
    const bgBuffer = fs.readFileSync('./assets/template.png');
    doc.image(bgBuffer, 0, 0, { width: 595, height: 420 });

    // Teks tiket
    doc.font('Helvetica-Bold').fontSize(24).fillColor('white');
    doc.text(name, 50, 50, { align: 'left' });

    doc.fontSize(14).fillColor('white');
    doc.text(`Email: ${email}`, 50, 90);
    doc.text(`Kontak: ${kontak}`, 50, 110);
    doc.text(`Harga Tiket: Rp${harga}`, 50, 130);

    // QR Code
    const qr_png = qr.imageSync(qrData, { type: 'png' });
    doc.image(qr_png, 450, 250, { width: 100 });

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}
