// Email utility using MailChannels API (free on Cloudflare Workers)

const FROM_EMAIL = 'noreply@pozospharma.pages.dev';
const FROM_NAME = 'PozosPharma';

/**
 * Send an email via MailChannels API.
 * @param {object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 */
async function sendEmail({ to, subject, html }) {
  const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[sendEmail] MailChannels error:', res.status, text);
  }

  return res.ok;
}

/**
 * Send a verification email to the user.
 * @param {string} email
 * @param {string} token
 * @param {object} env
 */
export async function sendVerificationEmail(email, token, env) {
  const baseUrl = env.FRONTEND_URL || 'https://pozospharma.pages.dev';
  const verifyUrl = `${baseUrl}/verify-email/${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #4f46e5; margin: 0;">PozosPharma</h1>
        <div style="height: 4px; background: linear-gradient(to right, #ce1126, #fcd116, #006b3f); border-radius: 2px; margin-top: 12px;"></div>
      </div>
      <h2 style="color: #111827;">Verify Your Email Address</h2>
      <p style="color: #4b5563; line-height: 1.6;">
        Welcome to PozosPharma! Please verify your email address by clicking the button below.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 32px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Verify Email
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${verifyUrl}" style="color: #4f46e5;">${verifyUrl}</a>
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        If you did not create an account, you can safely ignore this email.
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject: 'Verify your PozosPharma email', html });
}

/**
 * Send a password reset email to the user.
 * @param {string} email
 * @param {string} token
 * @param {object} env
 */
export async function sendPasswordResetEmail(email, token, env) {
  const baseUrl = env.FRONTEND_URL || 'https://pozospharma.pages.dev';
  const resetUrl = `${baseUrl}/reset-password/${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #4f46e5; margin: 0;">PozosPharma</h1>
        <div style="height: 4px; background: linear-gradient(to right, #ce1126, #fcd116, #006b3f); border-radius: 2px; margin-top: 12px;"></div>
      </div>
      <h2 style="color: #111827;">Reset Your Password</h2>
      <p style="color: #4b5563; line-height: 1.6;">
        We received a request to reset your password. Click the button below to choose a new password.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 32px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Reset Password
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${resetUrl}" style="color: #4f46e5;">${resetUrl}</a>
      </p>
      <p style="color: #ef4444; font-size: 14px; font-weight: 500;">
        This link expires in 1 hour.
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        If you did not request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject: 'Reset your PozosPharma password', html });
}
