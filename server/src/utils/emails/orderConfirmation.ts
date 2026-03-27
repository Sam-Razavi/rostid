import { sendEmail } from '../email';

interface OrderItem {
  product: { name: string };
  quantity: number;
  unitPriceOre: number;
}

interface SendOrderConfirmationOptions {
  to: string;
  customerName: string;
  orderId: string;
  items: OrderItem[];
  totalOre: number;
}

function formatPrice(ore: number) {
  return `${Math.round(ore / 100)} kr`;
}

export async function sendOrderConfirmation(opts: SendOrderConfirmationOptions): Promise<void> {
  const itemRows = opts.items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;color:#292524;">${i.product.name} ×${i.quantity}</td>
        <td style="padding:8px 0;text-align:right;color:#292524;">${formatPrice(i.unitPriceOre * i.quantity)}</td>
      </tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:system-ui,sans-serif;background:#fafaf9;margin:0;padding:40px 20px;">
      <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;border:1px solid #e7e5e4;">
        <h1 style="font-size:24px;font-weight:600;color:#1c1917;margin:0 0 4px;">Order confirmed</h1>
        <p style="color:#78716c;margin:0 0 32px;">Hi ${opts.customerName}, thanks for your order!</p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          ${itemRows}
          <tr style="border-top:1px solid #e7e5e4;">
            <td style="padding:12px 0;font-weight:600;color:#1c1917;">Total</td>
            <td style="padding:12px 0;text-align:right;font-weight:600;color:#5E3516;">${formatPrice(opts.totalOre)}</td>
          </tr>
        </table>

        <p style="color:#78716c;font-size:13px;">
          Order ID: <code style="background:#f5f5f4;padding:2px 6px;border-radius:4px;">${opts.orderId}</code>
        </p>
        <p style="color:#78716c;font-size:13px;margin-top:24px;">
          Roasted fresh and shipped within 2 business days. Enjoy your coffee!
        </p>
        <p style="color:#a8a29e;font-size:12px;margin-top:32px;border-top:1px solid #f5f5f4;padding-top:16px;">
          Rostid · Stockholm, Sweden
        </p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: opts.to,
    subject: `Order confirmed — ${formatPrice(opts.totalOre)}`,
    html,
  });
}
