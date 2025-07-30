import nodemailer from 'nodemailer';

export default async function sendEmail({ email, name, pdfPath }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: \`"ArtFest ReaLizM" <\${process.env.EMAIL_USER}>\`,
    to: email,
    subject: 'Tiket ArtFest ReaLizM',
    text: \`Halo \${name}, berikut tiket kamu. Tunjukkan ini saat masuk ke venue.\`,
    attachments: [
      {
        filename: 'tiket-artfest.pdf',
        path: pdfPath
      }
    ]
  });
}