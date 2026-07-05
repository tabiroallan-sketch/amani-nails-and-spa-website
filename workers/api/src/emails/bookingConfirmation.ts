export function bookingConfirmationHtml(data: {
  name: string;
  date: string;
  time: string;
  services: string[];
  token: string;
}): string {
  const items = data.services
    .map((s) => `<li style="color:#5D4E46;padding:4px 0">${s}</li>`)
    .join("");

  return `
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#F9F6F0;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#C9A86C,#D4AF37);padding:32px;text-align:center">
        <h1 style="font-family:Georgia,serif;color:#2C1810;margin:0;font-size:22px">Booking Confirmed</h1>
      </div>
      <div style="padding:32px">
        <p style="color:#2C1810;font-size:15px">Hi <strong>${data.name}</strong>,</p>
        <p style="color:#5D4E46;font-size:14px">Your appointment at Amani Nails & Spa is confirmed.</p>
        <div style="background:#FCF6ED;border-radius:12px;padding:20px;margin:20px 0">
          <p style="font-size:13px;color:#C9A86C;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px">Appointment Details</p>
          <ul style="list-style:none;padding:0;margin:0">${items}</ul>
          <div style="border-top:1px solid #E8D5C4;margin-top:8px;padding-top:8px">
            <p style="color:#2C1810;font-size:13px"><strong>Date:</strong> ${data.date}</p>
            <p style="color:#2C1810;font-size:13px"><strong>Time:</strong> ${data.time}</p>
          </div>
        </div>
        <div style="background:#2C1810;border-radius:12px;padding:16px;text-align:center;margin:20px 0">
          <p style="color:#C9A86C;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px">Reference</p>
          <p style="color:#F9F6F0;font-size:20px;font-family:Georgia,serif;margin:0;letter-spacing:2px">${data.token}</p>
        </div>
        <div style="text-align:center;margin-top:24px">
          <a href="https://amanispanairobi.com/book/${data.token}/cancel"
             style="color:#C9A86C;font-size:12px;text-decoration:underline">Cancel or reschedule</a>
        </div>
        <p style="color:#5D4E46;font-size:12px;text-align:center;margin-top:16px">We'll send a reminder 24 hours before your appointment.</p>
      </div>
    </div>
  `;
}

export function bookingNotificationHtml(data: {
  name: string;
  email: string;
  phone: string | null;
  date: string;
  time: string;
  services: string[];
  token: string;
}): string {
  return `
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#F9F6F0;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#C9A86C,#D4AF37);padding:24px;text-align:center">
        <h1 style="font-family:Georgia,serif;color:#2C1810;margin:0;font-size:18px">New Booking</h1>
      </div>
      <div style="padding:24px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#5D4E46;font-size:13px;font-weight:600">Name</td><td style="padding:8px 0;color:#2C1810;font-size:13px">${data.name}</td></tr>
          <tr><td style="padding:8px 0;color:#5D4E46;font-size:13px;font-weight:600">Email</td><td style="padding:8px 0;color:#2C1810;font-size:13px">${data.email}</td></tr>
          ${data.phone ? `<tr><td style="padding:8px 0;color:#5D4E46;font-size:13px;font-weight:600">Phone</td><td style="padding:8px 0;color:#2C1810;font-size:13px">${data.phone}</td></tr>` : ""}
          <tr><td style="padding:8px 0;color:#5D4E46;font-size:13px;font-weight:600">Date</td><td style="padding:8px 0;color:#2C1810;font-size:13px">${data.date}</td></tr>
          <tr><td style="padding:8px 0;color:#5D4E46;font-size:13px;font-weight:600">Time</td><td style="padding:8px 0;color:#2C1810;font-size:13px">${data.time}</td></tr>
          <tr><td style="padding:8px 0;color:#5D4E46;font-size:13px;font-weight:600">Services</td><td style="padding:8px 0;color:#2C1810;font-size:13px">${data.services.join(", ")}</td></tr>
          <tr><td style="padding:8px 0;color:#5D4E46;font-size:13px;font-weight:600">Reference</td><td style="padding:8px 0;color:#2C1810;font-size:13px">${data.token}</td></tr>
        </table>
      </div>
    </div>
  `;
}
