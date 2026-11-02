const nodemailer = require('nodemailer');

const env = require('../config/env');
const logger = require('../utils/logger');

let cachedTransporter;

const isConfigured = () => Boolean(env.smtpHost && env.smtpUser && env.smtpPass);

const getTransporter = () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
    // Keep a warm connection pool so a cold SMTP handshake doesn't make the
    // first send after an idle period slow or flaky.
    pool: true,
    maxConnections: 3,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  return cachedTransporter;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Send an email. When SMTP is not configured (e.g. local dev without
 * credentials) the message is logged instead of sent, so flows that depend on
 * email still work end-to-end during development.
 */
const sendMail = async ({ to, subject, text, html }) => {
  if (!isConfigured()) {
    logger.warn('SMTP not configured — logging email instead of sending', {
      to,
      subject,
      text,
    });
    return;
  }

  // Retry once on a transient failure (dropped/cold connection, brief Gmail
  // hiccup) before giving up, so a single flaky handshake doesn't lose the email.
  const maxAttempts = 2;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await getTransporter().sendMail({ from: env.mailFrom, to, subject, text, html });
      return;
    } catch (error) {
      if (attempt >= maxAttempts) {
        throw error;
      }
      logger.warn('Email send failed — retrying', { to, subject, attempt, error: error.message });
      await sleep(500);
    }
  }
};

const buildPasswordResetEmail = (code) => {
  const ttl = env.passwordResetCodeTtlMinutes;
  const subject = `Your ${env.appName} password reset code`;
  const text = [
    `Your ${env.appName} password reset code is ${code}.`,
    `It expires in ${ttl} minutes.`,
    'If you did not request this, you can safely ignore this email.',
  ].join('\n\n');

  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #0f172a; max-width: 480px; margin: 0 auto;">
      <h1 style="font-size: 20px; margin: 0 0 16px;">Reset your ${env.appName} password</h1>
      <p style="font-size: 15px; line-height: 1.5; margin: 0 0 20px;">Use the code below to reset your password. It expires in ${ttl} minutes.</p>
      <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; background: #f4f4ee; border-radius: 12px; padding: 18px; text-align: center; margin: 0 0 20px;">${code}</div>
      <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0;">If you did not request this, you can safely ignore this email.</p>
    </div>
  `;

  return { subject, text, html };
};

const sendPasswordResetCode = async ({ to, code }) => {
  const { subject, text, html } = buildPasswordResetEmail(code);
  await sendMail({ to, subject, text, html });
};

module.exports = {
  sendMail,
  sendPasswordResetCode,
  isConfigured,
};
