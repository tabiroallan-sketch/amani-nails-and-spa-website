import { useAdminAuth } from "./AdminAuth";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/bookings", label: "Bookings", icon: "📅" },
  { href: "/admin/services", label: "Services", icon: "💅" },
  { href: "/admin/staff", label: "Staff", icon: "👥" },
];

export default function AdminLayout({ children }: { children: preact.ComponentChildren }) {
  const { logout } = useAdminAuth();

  return (
    <div class="min-h-screen bg-ivory-silk flex">
      <aside class="w-64 bg-espresso text-champagne p-6 flex flex-col">
        <div class="mb-8">
          <p class="font-display text-xl font-semibold">Amani Admin</p>
          <p class="font-body text-xs text-warm-taupe mt-1">Dashboard</p>
        </div>

        <nav class="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = typeof window !== "undefined" && window.location.pathname === item.href;
            return (
              <a
                href={item.href}
                class={`flex items-center gap-3 px-4 py-3 rounded-full text-sm transition-colors ${
                  isActive ? "bg-gold-leaf text-espresso font-semibold" : "text-warm-taupe hover:text-champagne hover:bg-deep-cocoa"
                }`}
              >
                <span>{item.icon}</span>
                <span class="font-body">{item.label}</span>
              </a>
            );
          })}
        </nav>

        <button
          onClick={logout}
          class="px-4 py-3 rounded-full border border-deep-cocoa text-warm-taupe hover:text-champagne font-body text-sm transition-colors mt-4"
        >
          Sign Out
        </button>
      </aside>

      <main class="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
