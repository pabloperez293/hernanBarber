import { useEffect, useState } from "react";
import { getClientReport } from "../../utils/adminApi";
import { getPresetRange } from "./adminShared";
export default function AdminClients() {
  const [preset, setPreset] = useState("mes"),
    [report, setReport] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setError("");
    getClientReport(getPresetRange(preset))
      .then((r) => {
        if (active) setReport(r);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [preset]);
  return (
    <div>
      <h2 className="text-2xl font-semibold">Clientes y reportes</h2>
      <div className="mt-5 flex gap-2">
        {["hoy", "semana", "mes"].map((p) => (
          <button
            key={p}
            onClick={() => setPreset(p)}
            className={`rounded-full border px-4 py-2 text-xs ${preset === p ? "border-[#DDC88A] text-[#DDC88A]" : "border-white/20"}`}
          >
            {p}
          </button>
        ))}
      </div>
      {error && <p className="mt-4 text-red-300">{error}</p>}
      {report && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Turnos activos", report.total],
              ["Clientes nuevos", report.newClients],
              ["Recurrentes", report.returningClients],
              ["Con promoción", report.promotions],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-white/10 p-4">
                <p className="text-xs text-white/50">{k}</p>
                <strong className="text-2xl text-[#DDC88A]">{v}</strong>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-white/50">
            Cancelados en el período: {report.cancelled}
          </p>
          <p className="mt-3 text-sm text-white/50">
            La clasificación y las promociones se pueden corregir desde Agenda.
          </p>
        </>
      )}
    </div>
  );
}
