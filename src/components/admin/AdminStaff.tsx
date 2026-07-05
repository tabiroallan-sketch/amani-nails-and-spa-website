import { useState } from "preact/hooks";
import { useAdminAuth } from "./AdminAuth";
import AdminLayout from "./AdminLayout";

const INITIAL_STAFF = [
  { id: "esther", name: "Esther Wanjiku", title: "Lead Nail Artist", specialties: "Nail Art, Acrylics, Gel", available: true },
  { id: "grace", name: "Grace Muthoni", title: "Senior Massage Therapist", specialties: "Deep Tissue, Hot Stone, Swedish", available: true },
  { id: "faith", name: "Faith Akinyi", title: "Aesthetician", specialties: "Waxing, Facials, Brow Shaping", available: true },
  { id: "james", name: "James Ochieng", title: "Spa Director", specialties: "Deep Tissue, Swedish, Packages", available: true },
];

export default function AdminStaff() {
  const { isAuthenticated } = useAdminAuth();
  const [staff, setStaff] = useState(INITIAL_STAFF);

  if (!isAuthenticated) {
    window.location.href = "/admin";
    return null;
  }

  const toggleAvailable = (id: string) => {
    setStaff((prev) => prev.map((s) => s.id === id ? { ...s, available: !s.available } : s));
  };

  return (
    <AdminLayout>
      <div class="mb-8">
        <h1 class="font-display text-3xl font-semibold text-espresso">Staff</h1>
        <p class="font-body text-sm text-warm-taupe mt-1">Manage your team members.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {staff.map((s) => (
          <div key={s.id} class="p-6 rounded-[var(--radius-card)] bg-ivory-silk border border-champagne">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-full bg-champagne flex items-center justify-center">
                  <span class="font-body text-xs text-warm-taupe">📸</span>
                </div>
                <div>
                  <p class="font-display text-lg font-semibold text-espresso">{s.name}</p>
                  <p class="font-body text-sm text-warm-taupe">{s.title}</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={s.available} onChange={() => toggleAvailable(s.id)} class="sr-only peer" />
                <div class="w-9 h-5 rounded-full bg-champagne peer-checked:bg-sage-whisper after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
            <p class="mt-3 font-body text-xs text-warm-taupe">
              <span class="font-medium text-espresso">Specialties:</span> {s.specialties}
            </p>
            <div class="mt-3 flex gap-2">
              <span class={`inline-block px-2 py-0.5 rounded-full text-xs font-body ${s.available ? "bg-sage-whisper/30 text-sage-whisper" : "bg-champagne text-warm-taupe"}`}>
                {s.available ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
