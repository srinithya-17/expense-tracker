const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If SMTP is not configured, log to console instead of failing (dev-friendly)
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('--- EMAIL (SMTP not configured, logging instead) ---');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.text}`);
    console.log('-----------------------------------------------------');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
};

module.exports = sendEmail;
