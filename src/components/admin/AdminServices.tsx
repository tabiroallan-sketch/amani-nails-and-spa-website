import { useState } from "preact/hooks";
import { useAdminAuth } from "./AdminAuth";
import AdminLayout from "./AdminLayout";

const CATEGORIES = { nails: "Nails", massages: "Massages", body: "Body", face: "Face", piercing: "Piercing", packages: "Packages" };

const INITIAL_SERVICES = [
  { id: "manicure", title: "Manicure", category: "nails", duration: 30, price: 1500, available: true },
  { id: "pedicure", title: "Pedicure", category: "nails", duration: 45, price: 2000, available: true },
  { id: "gel-polish", title: "Gel Polish", category: "nails", duration: 45, price: 2500, available: true },
  { id: "deep-tissue-massage", title: "Deep Tissue Massage", category: "massages", duration: 60, price: 5000, available: true },
  { id: "facials", title: "Facials", category: "face", duration: 60, price: 3500, available: true },
  { id: "spa-packages", title: "Spa Packages", category: "packages", duration: 120, price: 8000, available: true },
];

export default function AdminServices() {
  const { isAuthenticated } = useAdminAuth();
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!isAuthenticated) {
    window.location.href = "/admin";
    return null;
  }

  const filtered = categoryFilter === "all" ? services : services.filter((s) => s.category === categoryFilter);

  const toggleAvailable = (id: string) => {
    setServices((prev) => prev.map((s) => s.id === id ? { ...s, available: !s.available } : s));
  };

  return (
    <AdminLayout>
      <div class="mb-8">
        <h1 class="font-display text-3xl font-semibold text-espresso">Services</h1>
        <p class="font-body text-sm text-warm-taupe mt-1">Manage your service catalog.</p>
      </div>

      <div class="flex gap-2 mb-6">
        <button onClick={() => setCategoryFilter("all")} class={`px-5 py-2 rounded-full font-body text-xs uppercase tracking-[0.1em] font-semibold transition-all ${categoryFilter === "all" ? "bg-gold-leaf text-espresso" : "bg-champagne text-warm-taupe hover:bg-rose-dust"}`}>All</button>
        {Object.entries(CATEGORIES).map(([key, label]) => (
          <button key={key} onClick={() => setCategoryFilter(key)} class={`px-5 py-2 rounded-full font-body text-xs uppercase tracking-[0.1em] font-semibold transition-all ${categoryFilter === key ? "bg-gold-leaf text-espresso" : "bg-champagne text-warm-taupe hover:bg-rose-dust"}`}>{label}</button>
        ))}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <div key={s.id} class="p-5 rounded-[var(--radius-card)] bg-ivory-silk border border-champagne">
            <div class="flex items-start justify-between">
              <div>
                <p class="font-display text-base font-semibold text-espresso">{s.title}</p>
                <p class="font-body text-xs text-warm-taupe mt-0.5">{CATEGORIES[s.category as keyof typeof CATEGORIES]}</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={s.available} onChange={() => toggleAvailable(s.id)} class="sr-only peer" />
                <div class="w-9 h-5 rounded-full bg-champagne peer-checked:bg-sage-whisper after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
            <div class="mt-3 flex items-center gap-4">
              <span class="font-body text-sm font-semibold text-gold-leaf">KES {s.price.toLocaleString()}</span>
              <span class="font-body text-xs text-warm-taupe">{s.duration} min</span>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
