import { useState, useEffect } from "preact/hooks";
import { useAdminAuth } from "./AdminAuth";
import AdminLayout from "./AdminLayout";

type Booking = {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  status: string;
  staff: string;
};

const MOCK_BOOKINGS: Booking[] = [
  { id: "AMN-A1B2C3", customerName: "Grace M.", service: "Deep Tissue Massage", date: "2026-07-03", time: "10:00", status: "confirmed", staff: "James" },
  { id: "AMN-D4E5F6", customerName: "Amina K.", service: "Brow Shaping", date: "2026-07-03", time: "11:30", status: "confirmed", staff: "Faith" },
  { id: "AMN-G7H8I9", customerName: "David N.", service: "Manicure + Pedicure", date: "2026-07-03", time: "14:00", status: "confirmed", staff: "Esther" },
  { id: "AMN-J0K1L2", customerName: "Wanjiku M.", service: "Bridal Package", date: "2026-07-04", time: "09:00", status: "confirmed", staff: "Grace" },
  { id: "AMN-M3N4O5", customerName: "Susan W.", service: "Hot Stone Massage", date: "2026-07-04", time: "15:00", status: "pending", staff: "James" },
  { id: "AMN-P6Q7R8", customerName: "Zahara A.", service: "Nose Piercing", date: "2026-07-05", time: "13:00", status: "confirmed", staff: "Faith" },
];

export default function AdminBookings() {
  const { isAuthenticated } = useAdminAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;
    setTimeout(() => setBookings(MOCK_BOOKINGS), 200);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    window.location.href = "/admin";
    return null;
  }

  const filtered = bookings.filter((b) => {
    const matchFilter = filter === "all" || b.status === filter;
    const matchSearch = !search || b.customerName.toLowerCase().includes(search.toLowerCase()) || b.service.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const statusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-sage-whisper/30 text-sage-whisper";
      case "pending": return "bg-gold-leaf/30 text-gold-leaf";
      case "cancelled": return "bg-red-200/30 text-red-500";
      default: return "bg-champagne text-warm-taupe";
    }
  };

  return (
    <AdminLayout>
      <div class="mb-8">
        <h1 class="font-display text-3xl font-semibold text-espresso">Bookings</h1>
        <p class="font-body text-sm text-warm-taupe mt-1">Manage all appointments.</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          value={search}
          onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
          placeholder="Search by name, service, or reference..."
          class="flex-1 h-12 px-4 rounded-full bg-ivory-silk border-2 border-transparent focus:border-gold-leaf focus:outline-none transition-colors font-body text-sm"
        />
        <div class="flex gap-2">
          {["all", "confirmed", "pending", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              class={`px-5 py-2 rounded-full font-body text-xs uppercase tracking-[0.1em] font-semibold transition-all ${
                filter === f ? "bg-gold-leaf text-espresso" : "bg-champagne text-warm-taupe hover:bg-rose-dust"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div class="bg-ivory-silk rounded-[var(--radius-card)] overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-champagne">
                <th class="text-left px-4 py-3 font-body text-xs uppercase tracking-[0.1em] text-warm-taupe">Reference</th>
                <th class="text-left px-4 py-3 font-body text-xs uppercase tracking-[0.1em] text-warm-taupe">Customer</th>
                <th class="text-left px-4 py-3 font-body text-xs uppercase tracking-[0.1em] text-warm-taupe">Service</th>
                <th class="text-left px-4 py-3 font-body text-xs uppercase tracking-[0.1em] text-warm-taupe">Date</th>
                <th class="text-left px-4 py-3 font-body text-xs uppercase tracking-[0.1em] text-warm-taupe">Time</th>
                <th class="text-left px-4 py-3 font-body text-xs uppercase tracking-[0.1em] text-warm-taupe">Staff</th>
                <th class="text-left px-4 py-3 font-body text-xs uppercase tracking-[0.1em] text-warm-taupe">Status</th>
                <th class="text-right px-4 py-3 font-body text-xs uppercase tracking-[0.1em] text-warm-taupe">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colspan="8" class="px-4 py-12 text-center font-body text-sm text-warm-taupe">No bookings found.</td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} class="border-b border-champagne hover:bg-champagne/50 transition-colors">
                    <td class="px-4 py-3 font-body text-xs text-gold-leaf font-mono">{b.id}</td>
                    <td class="px-4 py-3 font-body text-sm text-espresso font-medium">{b.customerName}</td>
                    <td class="px-4 py-3 font-body text-sm text-espresso">{b.service}</td>
                    <td class="px-4 py-3 font-body text-sm text-espresso">{b.date}</td>
                    <td class="px-4 py-3 font-body text-sm text-espresso">{b.time}</td>
                    <td class="px-4 py-3 font-body text-sm text-espresso">{b.staff}</td>
                    <td class="px-4 py-3">
                      <span class={`inline-block px-2 py-0.5 rounded-full text-xs font-body ${statusColor(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <button class="text-xs font-body text-red-400 hover:text-red-600 transition-colors">
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
