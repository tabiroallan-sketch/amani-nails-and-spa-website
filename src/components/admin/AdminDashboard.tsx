import { useState, useEffect } from "preact/hooks";
import { useAdminAuth } from "./AdminAuth";
import AdminLayout from "./AdminLayout";

export default function AdminDashboard() {
  const { isAuthenticated } = useAdminAuth();
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0, total: 0 });

  useEffect(() => {
    if (!isAuthenticated) return;
    setTimeout(() => {
      setStats({ today: 3, week: 18, month: 72, total: 1246 });
    }, 300);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    window.location.href = "/admin";
    return null;
  }

  const statCards = [
    { label: "Today's Bookings", value: stats.today, color: "bg-gold-leaf" },
    { label: "This Week", value: stats.week, color: "bg-sage-whisper" },
    { label: "This Month", value: stats.month, color: "bg-rose-dust" },
    { label: "Total Bookings", value: stats.total, color: "bg-espresso text-champagne" },
  ];

  return (
    <AdminLayout>
      <div class="mb-8">
        <h1 class="font-display text-3xl font-semibold text-espresso">Dashboard</h1>
        <p class="font-body text-sm text-warm-taupe mt-1">Overview of your salon's performance.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((card) => (
          <div class={`p-6 rounded-[var(--radius-card)] ${card.color}`}>
            <p class="font-body text-sm opacity-80">{card.label}</p>
            <p class="font-display text-3xl font-semibold mt-2">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="p-6 rounded-[var(--radius-card)] glass">
          <h2 class="font-display text-lg font-semibold text-espresso mb-4">Recent Bookings</h2>
          <div class="space-y-3">
            {[{ name: "Grace M.", service: "Deep Tissue Massage", time: "10:00", status: "confirmed" },
              { name: "Amina K.", service: "Brow Shaping", time: "11:30", status: "confirmed" },
              { name: "David N.", service: "Manicure + Pedicure", time: "14:00", status: "confirmed" }].map((b, i) => (
              <div key={i} class="flex items-center justify-between py-2 border-b border-champagne last:border-0">
                <div>
                  <p class="font-body text-sm font-medium text-espresso">{b.name}</p>
                  <p class="font-body text-xs text-warm-taupe">{b.service}</p>
                </div>
                <div class="text-right">
                  <p class="font-body text-sm text-espresso">{b.time}</p>
                  <span class="inline-block px-2 py-0.5 rounded-full bg-sage-whisper/30 text-xs font-body text-sage-whisper">
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div class="p-6 rounded-[var(--radius-card)] glass">
          <h2 class="font-display text-lg font-semibold text-espresso mb-4">Quick Actions</h2>
          <div class="space-y-3">
            <a href="/admin/bookings" class="block p-4 rounded-full bg-champagne hover:bg-rose-dust transition-colors font-body text-sm text-espresso">
              📅 View All Bookings
            </a>
            <a href="/admin/services" class="block p-4 rounded-full bg-champagne hover:bg-rose-dust transition-colors font-body text-sm text-espresso">
              💅 Manage Services
            </a>
            <a href="/admin/staff" class="block p-4 rounded-full bg-champagne hover:bg-rose-dust transition-colors font-body text-sm text-espresso">
              👥 Manage Staff
            </a>
            <a href="/" target="_blank" class="block p-4 rounded-full bg-gold-leaf text-espresso font-body text-sm font-semibold text-center transition-colors hover:bg-espresso">
              🔗 View Public Site
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
