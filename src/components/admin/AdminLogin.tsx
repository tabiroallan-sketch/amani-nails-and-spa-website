import { useState } from "preact/hooks";
import { useAdminAuth } from "./AdminAuth";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAdminAuth();

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (login(password)) {
      window.location.href = "/admin/dashboard";
    } else {
      setError("Invalid password");
    }
  };

  return (
    <div class="min-h-screen bg-ivory-silk flex items-center justify-center p-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <p class="font-display text-3xl font-semibold text-espresso">Amani</p>
          <p class="font-body text-sm text-warm-taupe mt-1">Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} class="p-8 rounded-[var(--radius-blob)] glass">
          <div>
            <label for="admin-password" class="block font-body text-sm font-medium text-espresso mb-2">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onInput={(e) => { setPassword((e.target as HTMLInputElement).value); setError(""); }}
              class="w-full h-12 px-4 rounded-full bg-ivory-silk border-2 border-transparent focus:border-gold-leaf focus:outline-none transition-colors font-body text-sm"
              placeholder="Enter admin password"
              autoFocus
            />
            {error && <p class="mt-2 font-body text-xs text-red-500">{error}</p>}
          </div>

          <button
            type="submit"
            class="mt-6 w-full h-12 rounded-full bg-gold-leaf text-espresso font-body text-sm font-semibold tracking-[0.05em] uppercase hover:bg-espresso transition-colors"
          >
            Sign In
          </button>
        </form>

        <p class="mt-6 text-center font-body text-xs text-warm-taupe">
          Secure access — authorised personnel only.
        </p>
      </div>
    </div>
  );
}
