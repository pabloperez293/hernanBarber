import { useEffect, useState } from "react";

import {
  FaCalendarDay,
  FaChartBar,
  FaLock,
  FaSignOutAlt,
  FaUserClock,
} from "react-icons/fa";

import {
  ADMIN_LOGOUT_EVENT,
  adminLogin,
  adminLogout,
  getStoredToken,
} from "../../utils/adminApi";

import AdminStats from "./AdminStats";
import AdminAgenda from "./AdminAgenda";
import AdminAbsences from "./AdminAbsences";

import { inputClass, labelClass, primaryButtonClass } from "./adminShared";

const TABS = [
  { id: "resumen", label: "Resumen", icon: FaChartBar },
  { id: "agenda", label: "Agenda", icon: FaCalendarDay },
  { id: "ausencias", label: "Ausencias", icon: FaUserClock },
];

function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || loading) return;

    setLoading(true);
    setError("");

    try {
      await adminLogin(password);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#0B0B0B] px-4 py-20 text-white sm:px-6">
      <div className="mx-auto max-w-md">
        <div className="mb-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-[#DDC88A]">
            Elam Barber Studio
          </span>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Panel admin
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
        >
          <label className={labelClass} htmlFor="admin-password">
            Clave de acceso
          </label>

          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#DDC88A]" />

            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pl-11`}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-400/30 bg-red-400/5 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!password || loading}
            className={`${primaryButtonClass} mt-6 w-full py-4`}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(Boolean(getStoredToken()));
  const [tab, setTab] = useState("resumen");

  // Si el servidor dice que la sesión venció, volvemos al login.
  useEffect(() => {
    const handleLogout = () => setAuthed(false);

    window.addEventListener(ADMIN_LOGOUT_EVENT, handleLogout);

    return () =>
      window.removeEventListener(ADMIN_LOGOUT_EVENT, handleLogout);
  }, []);

  // El panel no debe aparecer en buscadores.
  useEffect(() => {
    const meta = document.createElement("meta");

    meta.name = "robots";
    meta.content = "noindex, nofollow";

    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const handleLogout = () => {
    adminLogout();
    setAuthed(false);
  };

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return (
    <section className="min-h-screen bg-[#0B0B0B] px-4 py-20 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div className="mb-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-[#DDC88A]">
            Elam Barber Studio
          </span>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Panel admin
          </h1>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          {/* TABS */}
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-6">
            <div className="flex flex-wrap gap-2">
              {TABS.map((item) => {
                const Icon = item.icon;
                const isActive = tab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                      isActive
                        ? "border-[#DDC88A] bg-[#DDC88A]/10 text-[#DDC88A]"
                        : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/30"
                    }`}
                  >
                    <Icon />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs text-white/40 transition-colors hover:text-[#DDC88A]"
            >
              <FaSignOutAlt />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>

          <div className="p-5 sm:p-8">
            {tab === "resumen" && <AdminStats />}
            {tab === "agenda" && <AdminAgenda />}
            {tab === "ausencias" && <AdminAbsences />}
          </div>
        </div>
      </div>
    </section>
  );
}
