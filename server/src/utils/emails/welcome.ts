import { sendEmail } from '../email';

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:system-ui,sans-serif;background:#fafaf9;margin:0;padding:40px 20px;">
      <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;border:1px solid #e7e5e4;">
        <h1 style="font-size:24px;font-weight:600;color:#1c1917;margin:0 0 4px;">Welcome to Rostid</h1>
        <p style="color:#78716c;margin:0 0 24px;">Hi ${name}, great to have you here.</p>

        <p style="color:#57534e;line-height:1.6;">
          We roast specialty coffee in small batches in Stockholm and ship it fresh to your door.
          Every bean is traceable to its farm — we think you'll taste the difference.
        </p>

        <div style="margin:32px 0;">
          <a href="${process.env.CLIENT_URL ?? 'https://rostid.se'}/products"
             style="background:#5E3516;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
            Browse our coffees →
          </a>
        </div>

        <p style="color:#a8a29e;font-size:12px;margin-top:32px;border-top:1px solid #f5f5f4;padding-top:16px;">
          Rostid · Stockholm, Sweden
        </p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({ to, subject: 'Welcome to Rostid ☕', html });
}
