import { sendEmail } from '../email';

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:system-ui,sans-serif;background:#fafaf9;margin:0;padding:40px 20px;">
      <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;border:1px solid #e7e5e4;">
        <h1 style="font-size:24px;font-weight:600;color:#1c1917;margin:0 0 4px;">Reset your password</h1>
        <p style="color:#78716c;margin:0 0 24px;">
          We received a request to reset your Rostid password. Click the button below to choose a new password.
          This link expires in 1 hour.
        </p>

        <div style="margin:32px 0;">
          <a href="${resetUrl}"
             style="background:#5E3516;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
            Reset password →
          </a>
        </div>

        <p style="color:#a8a29e;font-size:12px;">
          If you didn't request a password reset, you can safely ignore this email.
          Your password won't change unless you click the link above.
        </p>

        <p style="color:#a8a29e;font-size:12px;margin-top:32px;border-top:1px solid #f5f5f4;padding-top:16px;">
          Rostid · Stockholm, Sweden
        </p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({ to, subject: 'Reset your Rostid password', html });
}
