import 'dotenv/config';
import nodemailer from 'nodemailer';

let transporter;
let cachedConfig;

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null) {
    return fallback;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  return `${value}`.toLowerCase() === 'true';
};

const buildConfig = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    const error = new Error('SMTP configuration is incomplete. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS.');
    error.code = 'SMTP_CONFIG_MISSING';
    throw error;
  }

  const port = Number(SMTP_PORT) || 587;
  return {
    host: SMTP_HOST,
    port,
    secure: port === 465 ? true : parseBoolean(SMTP_SECURE, false),
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    defaultFrom: SMTP_FROM || SMTP_USER,
  };
};

const getConfig = () => {
  if (!cachedConfig) {
    cachedConfig = buildConfig();
  }
  return cachedConfig;
};

const getTransporter = () => {
  if (!transporter) {
    const { host, port, secure, auth } = getConfig();
    transporter = nodemailer.createTransport({ host, port, secure, auth });
  }
  return transporter;
};

const escapeHtml = (value = '') =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const isEmailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

export const sendContactEmail = async ({ name, email, message, to }) => {
  const config = getConfig();
  const mailer = getTransporter();
  const safeMessage = escapeHtml(message || '').replace(/\n/g, '<br />');

  await mailer.sendMail({
    from: config.defaultFrom,
    to,
    replyTo: email,
    subject: `New contact request from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p>
           <p><strong>Email:</strong> ${escapeHtml(email)}</p>
           <p><strong>Message:</strong></p>
           <p>${safeMessage}</p>`,
  });
};
