import nodemailer from 'nodemailer';

import config from '@config/index.js';

export const sendEmail = async (to: string, resetLink: string) => {
  const transporter = nodemailer.createTransport({
    host: config.smtp_host,
    port: Number(config.smtp_port),
    secure: config.NODE_ENV === 'production',
    auth: {
      user: config.smtp_host_mail,
      pass: config.smtp_pass,
    },
  });

  const emailBody = `
    <p>Hello,</p>
    <p>You requested a password reset. Click the button below to set a new password:</p>
    <a href="${resetLink}" style="padding:10px 15px; background-color:#F28069; color:#fff; text-decoration:none; border-radius:5px;">Reset Password</a>
    <p>This link will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
    <p>Thanks,<br/>The Shop Sphere Team</p>
    `;

  transporter.sendMail({
    from: config.smtp_host_mail,
    to,
    subject: 'Reset Your Password - Action Required',
    text: `You requested to reset your password. Please click the link below to reset it. The link will expire in 10 minutes.`,
    html: emailBody,
  });
};
