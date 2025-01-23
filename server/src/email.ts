import { createTransport } from 'nodemailer';

const transporter = createTransport({
  service: 'SMTP',
  host: process.env.NODEMAILER_HOST!,
  port: +process.env.NODEMAILER_PORT!,
  auth: {
    user: process.env.NODEMAILER_USER!,
    pass: process.env.NODEMAILER_PASS!
  }
});

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html: string,
  attachments: { file: string; cid: string; path: string }[] = []
) => {
  if (process.env.NODE_ENV !== 'production') return true;

  await transporter.sendMail({
    from: '"ICHack" <ichack@ic.ac.uk>',
    to: to,
    subject: subject,
    text: text,
    html: html,
    attachments: attachments
  });
};
