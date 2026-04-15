import { sendEmail } from '../email';

export async function sendOrderStatusUpdate(
  to: string,
  customerName: string,
  orderId: string,
  newStatus: string
) {
  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  const statusMessages: Record<string, string> = {
    confirmed: 'Your order has been confirmed and is being prepared.',
    processing: 'Your order is now being processed.',
    shipped: 'Great news — your order is on its way!',
    delivered: 'Your order has been delivered. Enjoy your coffee!',
    cancelled: 'Your order has been cancelled. If you have questions, please contact us.',
  };

  const label = statusLabels[newStatus] ?? newStatus;
  const message = statusMessages[newStatus] ?? `Your order status has been updated to ${label}.`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="background:#fafaf9;margin:0;padding:40px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <tr><td style="padding:32px 40px 24px;border-bottom:1px solid #e7e5e4;">
      <h1 style="margin:0;font-size:24px;font-weight:600;color:#1c1917;letter-spacing:-0.5px;">Rostid</h1>
    </td></tr>
    <tr><td style="padding:32px 40px;">
      <h2 style="margin:0 0 12px;font-size:20px;color:#1c1917;">Order update</h2>
      <p style="margin:0 0 8px;color:#57534e;font-size:15px;">Hi ${customerName},</p>
      <p style="margin:0 0 24px;color:#57534e;font-size:15px;">${message}</p>
      <div style="background:#f5f5f4;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#78716c;">Order ID</p>
        <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#1c1917;font-family:monospace;">${orderId}</p>
        <p style="margin:12px 0 0;font-size:13px;color:#78716c;">Status</p>
        <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#44403c;">${label}</p>
      </div>
    </td></tr>
    <tr><td style="padding:24px 40px;border-top:1px solid #e7e5e4;text-align:center;">
      <p style="margin:0;font-size:12px;color:#a8a29e;">© 2026 Rostid Stockholm</p>
    </td></tr>
  </table>
</body>
</html>`;

  await sendEmail({ to, subject: `Order update — ${label}`, html });
}
