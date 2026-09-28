import { useEffect, useState } from "react";

import { getStats } from "../../utils/adminApi";

import {
  formatDateLabel,
  getPresetRange,
  inputClass,
  labelClass,
} from "./adminShared";

const PRESETS = [
  { id: "hoy", label: "Hoy" },
  { id: "semana", label: "Esta semana" },
  { id: "mes", label: "Este mes" },
  { id: "custom", label: "Personalizado" },
];

export default function AdminStats() {
  const [preset, setPreset] = useState("mes");
  const [range, setRange] = useState(() => getPresetRange("mes"));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!range.from || !range.to || range.to < range.from) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await getStats(range);

        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [range]);

  const handlePreset = (id) => {
    setPreset(id);

    if (id !== "custom") {
      setRange(getPresetRange(id));
    }
  };

  const invalidRange = range.to && range.from && range.to < range.from;

  return (
    <div>
      <h2 className="text-2xl font-semibold">Servicios por barbero</h2>

      <p className="mt-2 text-sm text-white/40">
        Cuenta los turnos reservados no cancelados dentro del período.
      </p>

      {/* FILTROS */}
      <div className="mt-6 flex flex-wrap gap-2">
        {PRESETS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handlePreset(item.id)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
              preset === item.id
                ? "border-[#DDC88A] bg-[#DDC88A] text-[#0B0B0B]"
                : "border-white/10 bg-white/[0.03] text-white/60 hover:border-[#DDC88A]/40"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Desde</label>

            <input
              type="date"
              value={range.from}
              onChange={(e) =>
                setRange((current) => ({ ...current, from: e.target.value }))
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Hasta</label>

            <input
              type="date"
              value={range.to}
              min={range.from}
              onChange={(e) =>
                setRange((current) => ({ ...current, to: e.target.value }))
              }
              className={inputClass}
            />
          </div>
        </div>
      )}

      {invalidRange && (
        <p className="mt-4 text-sm text-red-300">
          La fecha final no puede ser anterior a la inicial.
        </p>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-red-400/30 bg-red-400/5 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* RESULTADOS */}
      {loading && !data ? (
        <p className="mt-8 text-sm text-white/40">Cargando...</p>
      ) : (
        data && (
          <div className={loading ? "opacity-50 transition-opacity" : ""}>
            <div className="mt-8 rounded-2xl border border-[#DDC88A]/20 bg-[#DDC88A]/5 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-[#DDC88A]/70">
                Total del período
              </p>

              <div className="mt-2 flex items-end justify-between gap-4">
                <span className="text-5xl font-semibold text-[#DDC88A]">
                  {data.total}
                </span>

                <span className="text-right text-xs text-white/40">
                  {data.from === data.to
                    ? formatDateLabel(data.from)
                    : `${formatDateLabel(data.from)} → ${formatDateLabel(data.to)}`}
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              {data.barbers.map((barber) => {
                const max = barber.services[0]?.count || 1;

                return (
                  <div
                    key={barber.barberName}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {barber.barberName}
                      </h3>

                      <span className="text-3xl font-semibold text-[#DDC88A]">
                        {barber.total}
                      </span>
                    </div>

                    <p className="text-xs uppercase tracking-[0.2em] text-white/30">
                      {barber.total === 1 ? "servicio" : "servicios"}
                    </p>

                    {barber.services.length === 0 ? (
                      <p className="mt-5 text-sm text-white/40">
                        Sin servicios en este período.
                      </p>
                    ) : (
                      <ul className="mt-5 space-y-3">
                        {barber.services.map((service) => (
                          <li key={service.name}>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/70">
                                {service.name}
                              </span>

                              <strong>{service.count}</strong>
                            </div>

                            <div className="mt-1 h-1 rounded-full bg-white/10">
                              <div
                                className="h-1 rounded-full bg-[#DDC88A]"
                                style={{
                                  width: `${(service.count / max) * 100}%`,
                                }}
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}
    </div>
  );
}
