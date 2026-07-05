import { SCHEMA_SQL } from "./schema";

export async function migrate(db: D1Database): Promise<void> {
  const statements = SCHEMA_SQL
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    await db.prepare(stmt + ";").run();
  }

  await seedServices(db);
  await seedStaff(db);
}

async function seedServices(db: D1Database): Promise<void> {
  const count = await db.prepare("SELECT COUNT(*) as count FROM services").first<{ count: number }>();
  if (count && count.count > 0) return;

  const services = [
    { id: "manicure", slug: "manicure", title: "Manicure", category: "nails", duration_min: 30, price_kes: 1500, order_index: 1 },
    { id: "pedicure", slug: "pedicure", title: "Pedicure", category: "nails", duration_min: 45, price_kes: 2000, order_index: 2 },
    { id: "gel-polish", slug: "gel-polish", title: "Gel Polish", category: "nails", duration_min: 45, price_kes: 2500, order_index: 3 },
    { id: "gel-manicure", slug: "gel-manicure", title: "Gel Manicure", category: "nails", duration_min: 45, price_kes: 2500, order_index: 4 },
    { id: "acrylic-nails", slug: "acrylic-nails", title: "Acrylic Nails", category: "nails", duration_min: 90, price_kes: 3500, order_index: 5 },
    { id: "nail-art", slug: "nail-art", title: "Nail Art", category: "nails", duration_min: 30, price_kes: 1000, order_index: 6 },
    { id: "swedish-massage", slug: "swedish-massage", title: "Swedish Massage", category: "massages", duration_min: 60, price_kes: 4000, order_index: 7 },
    { id: "deep-tissue-massage", slug: "deep-tissue-massage", title: "Deep Tissue Massage", category: "massages", duration_min: 60, price_kes: 5000, order_index: 8 },
    { id: "hot-stone-massage", slug: "hot-stone-massage", title: "Hot Stone Massage", category: "massages", duration_min: 75, price_kes: 6000, order_index: 9 },
    { id: "massages", slug: "massages", title: "Massages", category: "massages", duration_min: 60, price_kes: 4000, order_index: 10 },
    { id: "body-scrubs", slug: "body-scrubs", title: "Body Scrubs", category: "body", duration_min: 45, price_kes: 4500, order_index: 11 },
    { id: "waxing", slug: "waxing", title: "Waxing", category: "body", duration_min: 30, price_kes: 1500, order_index: 12 },
    { id: "facials", slug: "facials", title: "Facials", category: "face", duration_min: 60, price_kes: 3500, order_index: 13 },
    { id: "eyebrow-shaping", slug: "eyebrow-shaping", title: "Eyebrow Shaping", category: "face", duration_min: 15, price_kes: 800, order_index: 14 },
    { id: "eyelash-extensions", slug: "eyelash-extensions", title: "Eyelash Extensions", category: "face", duration_min: 90, price_kes: 3000, order_index: 15 },
    { id: "ear-piercing", slug: "ear-piercing", title: "Ear Piercing", category: "piercing", duration_min: 15, price_kes: 1500, order_index: 16 },
    { id: "nose-piercing", slug: "nose-piercing", title: "Nose Piercing", category: "piercing", duration_min: 20, price_kes: 2000, order_index: 17 },
    { id: "spa-packages", slug: "spa-packages", title: "Spa Packages", category: "packages", duration_min: 120, price_kes: 8000, order_index: 18 },
  ];

  const stmt = db.prepare(
    "INSERT OR IGNORE INTO services (id, slug, title, category, description, duration_min, price_kes, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  for (const s of services) {
    await stmt.bind(s.id, s.slug, s.title, s.category, `${s.title} at Amani Nails & Spa`, s.duration_min, s.price_kes, s.order_index).run();
  }
}

async function seedStaff(db: D1Database): Promise<void> {
  const count = await db.prepare("SELECT COUNT(*) as count FROM staff").first<{ count: number }>();
  if (count && count.count > 0) return;

  const staff = [
    { id: "esther", name: "Esther Wanjiku", title: "Lead Nail Artist", services_offered: JSON.stringify(["nails", "nail-art"]), order_index: 1 },
    { id: "grace", name: "Grace Muthoni", title: "Senior Massage Therapist", services_offered: JSON.stringify(["massages"]), order_index: 2 },
    { id: "faith", name: "Faith Akinyi", title: "Aesthetician & Waxing Specialist", services_offered: JSON.stringify(["body", "face", "piercing"]), order_index: 3 },
    { id: "james", name: "James Ochieng", title: "Spa Director & Lead Therapist", services_offered: JSON.stringify(["massages", "packages"]), order_index: 4 },
  ];

  const stmt = db.prepare(
    "INSERT OR IGNORE INTO staff (id, name, title, services_offered, available) VALUES (?, ?, ?, ?, 1)"
  );
  for (const s of staff) {
    await stmt.bind(s.id, s.name, s.title, s.services_offered).run();
  }
}
