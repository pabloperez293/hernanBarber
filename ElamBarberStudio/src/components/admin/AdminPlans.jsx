import { useCallback, useEffect, useState } from "react";
import { cancelAdminPlan, getAdminPlans } from "../../utils/adminApi";

const formatDate = (d) => {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("todos");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAdminPlans();
      setPlans(response.plans || []);
    } catch (e) {
      setError(e.message || "No se pudieron cargar los planes.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const cancel = async (p) => {
    if (
      !window.confirm(
        `¿Cancelar el plan de ${p.clientName}? Esta acción no cancela los turnos ya reservados.`,
      )
    )
      return;
    try {
      await cancelAdminPlan(p.id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };
  const wa = (p) => {
    const phone = String(p.phone || "").replace(/\D/g, "");
    const message = `Hola ${p.clientName}, te escribimos de Elam Barber Studio. Tu plan ${p.serviceName} vence el ${formatDate(p.endDate)}. ¿Querés renovarlo?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };
  const visible = plans.filter(
    (p) =>
      filter === "todos" ||
      (filter === "vigentes" && ["Activo", "Por vencer"].includes(p.status)) ||
      (filter === "vencen" && p.status === "Por vencer") ||
      (filter === "vencidos" && p.status === "Vencido"),
  );
  const expiring = plans.filter((p) => p.status === "Por vencer").length;
  return (
    <section className="space-y-6 text-white">
      <div>
        <h2 className="text-2xl font-semibold text-[#DDC88A]">
          Planes mensuales
        </h2>
        <p className="mt-2 text-sm text-white/60">
          Se habilitan automáticamente con la primera reserva. Sin comprobación
          de pagos. Cortes ilimitados, un turno por día.
        </p>
      </div>
      {expiring > 0 && (
        <div className="rounded-xl border border-[#DDC88A]/50 bg-[#DDC88A]/10 p-4 text-[#DDC88A]">
          Hay {expiring}{" "}
          {expiring === 1 ? "plan por vencer" : "planes por vencer"} dentro de
          los próximos 7 días.
        </div>
      )}
      {error && (
        <p role="alert" className="text-red-300">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {[
          ["todos", "Todos"],
          ["vigentes", "Vigentes"],
          ["vencen", "Por vencer (7 días)"],
          ["vencidos", "Vencidos"],
        ].map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => setFilter(v)}
            className={`rounded-lg border px-3 py-2 text-sm ${filter === v ? "border-[#DDC88A] bg-[#DDC88A] text-black" : "border-white/20"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {loading && <p>Cargando planes...</p>}
      <div className="space-y-3">
        {visible.map((p) => (
          <article
            key={p.id}
            className="rounded-2xl border border-white/15 bg-white/[0.03] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <strong>{p.clientName}</strong>
                <p className="mt-1 text-sm text-white/60">{p.serviceName}</p>
              </div>
              <span className="text-sm text-[#DDC88A]">{p.status}</span>
            </div>
            <p className="mt-3 text-sm">
              Inicio: {formatDate(p.startDate)} · Vencimiento:{" "}
              {formatDate(p.endDate)}
            </p>
            <p className="mt-1 text-sm text-white/70">
              Visitas reservadas: {p.visits} · Teléfono: {p.phone}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={wa(p)}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-[#DDC88A] px-3 py-2 text-sm text-[#DDC88A]"
              >
                WhatsApp para renovar
              </a>
              {p.status !== "Cancelado" && (
                <button
                  type="button"
                  onClick={() => cancel(p)}
                  className="rounded-xl border border-red-400/50 px-3 py-2 text-sm text-red-300"
                >
                  Cancelar plan
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      {!loading && !visible.length && (
        <p className="text-sm text-white/60">No hay planes para este filtro.</p>
      )}
    </section>
  );
}
