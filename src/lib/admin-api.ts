const API_BASE = import.meta.env.PUBLIC_API_URL ?? "http://localhost:8787";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error ?? "Request failed");
  }
  return res.json();
}

export const adminApi = {
  // Bookings
  getBookings: () => request<{ data: any[] }>("/api/bookings"),
  getBooking: (token: string) => request<{ data: any }>(`/api/bookings/${token}`),
  cancelBooking: (token: string) => request<{ success: boolean }>(`/api/bookings/${token}`, { method: "DELETE" }),

  // Services
  getServices: () => request<{ data: any[] }>("/api/services"),
  getService: (slug: string) => request<{ data: any }>(`/api/services/${slug}`),

  // Staff
  getStaff: () => request<{ data: any[] }>("/api/staff"),

  // Health
  health: () => request<{ status: string }>("/health"),
};
