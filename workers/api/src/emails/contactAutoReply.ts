export function contactAutoReplyHtml(data: {
  name: string;
  subject: string;
}): string {
  return `
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#F9F6F0;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#C9A86C,#D4AF37);padding:32px;text-align:center">
        <h1 style="font-family:Georgia,serif;color:#2C1810;margin:0;font-size:22px">Thank You</h1>
      </div>
      <div style="padding:32px">
        <p style="color:#2C1810;font-size:15px">Hi <strong>${data.name}</strong>,</p>
        <p style="color:#5D4E46;font-size:14px">Thank you for reaching out to <strong>Amani Nails & Spa</strong>.</p>
        <p style="color:#5D4E46;font-size:14px">We've received your message regarding <strong>"${data.subject}"</strong> and will respond within 24 hours during business hours (Mon–Sat, 9 AM–7 PM).</p>
        <div style="background:#FCF6ED;border-radius:12px;padding:20px;margin:20px 0">
          <p style="color:#2C1810;font-size:13px;margin:0 0 8px"><strong>In the meantime:</strong></p>
          <ul style="color:#5D4E46;font-size:13px;padding-left:16px;margin:0">
            <li style="padding:4px 0">Book an appointment instantly on our <a href="https://amanispanairobi.com/booking" style="color:#C9A86C">booking page</a></li>
            <li style="padding:4px 0">Follow us on <a href="https://instagram.com/amanispanairobi" style="color:#C9A86C">Instagram</a> for the latest styles</li>
            <li style="padding:4px 0">Call us directly at <a href="tel:+254700000000" style="color:#C9A86C;text-decoration:none">+254 700 000 000</a></li>
          </ul>
        </div>
        <p style="color:#5D4E46;font-size:13px">Warm regards,<br><strong style="color:#2C1810">The Amani Team</strong></p>
      </div>
    </div>
  `;
}

export function contactNotificationHtml(data: {
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
}): string {
  return `
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#F9F6F0;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#C9A86C,#D4AF37);padding:24px;text-align:center">
        <h1 style="font-family:Georgia,serif;color:#2C1810;margin:0;font-size:18px">New Contact Message</h1>
      </div>
      <div style="padding:24px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#5D4E46;font-size:13px;font-weight:600">Name</td><td style="padding:8px 0;color:#2C1810;font-size:13px">${data.name}</td></tr>
          <tr><td style="padding:8px 0;color:#5D4E46;font-size:13px;font-weight:600">Email</td><td style="padding:8px 0;color:#2C1810;font-size:13px">${data.email}</td></tr>
          ${data.phone ? `<tr><td style="padding:8px 0;color:#5D4E46;font-size:13px;font-weight:600">Phone</td><td style="padding:8px 0;color:#2C1810;font-size:13px">${data.phone}</td></tr>` : ""}
          <tr><td style="padding:8px 0;color:#5D4E46;font-size:13px;font-weight:600">Subject</td><td style="padding:8px 0;color:#2C1810;font-size:13px">${data.subject}</td></tr>
        </table>
        <div style="background:#FCF6ED;border-radius:12px;padding:16px;margin-top:16px">
          <p style="font-size:12px;color:#C9A86C;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">Message</p>
          <p style="color:#2C1810;font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap">${data.message}</p>
        </div>
      </div>
    </div>
  `;
}
