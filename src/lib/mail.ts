import nodemailer from 'nodemailer';
export async function sendMail(to: string, subject: string, text: string): Promise<boolean> {
  if (!process.env.SMTP_HOST) { console.log('[mail]', to, subject, text); return false; }
  const t = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  await t.sendMail({ from: process.env.SMTP_USER, to, subject, text }); return true;
}
export const sendReset = (to: string, link: string, token: string) => sendMail(to, 'Reset password TodoFlow', `Token reset password kamu: ${token} (berlaku 15 menit). Atau buka: ${link}`);
