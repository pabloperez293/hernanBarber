import { useEffect, useState } from "react";
import { getAdminServices, saveAdminService } from "../../utils/adminApi";

const field =
  "w-full rounded-xl border border-white/15 bg-[#171717] px-3 py-2 text-white outline-none focus:border-[#DDC88A]";
const label = "block text-xs text-white/60 mb-1";

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [busy, setBusy] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let alive = true;
    setBusy(true);
    getAdminServices()
      .then((result) => {
        if (alive) setServices(result.services || []);
      })
      .catch((err) => {
        if (alive) setError(err.message);
      })
      .finally(() => {
        if (alive) setBusy(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const edit = (id, key, value) =>
    setServices((prev) =>
      prev.map((s) =>
        String(s.id) === String(id) ? { ...s, [key]: value } : s,
      ),
    );

  const save = async (service) => {
    setError("");
    setNotice("");
    setSavingId(service.id);
    try {
      const result = await saveAdminService(service);
      setServices((prev) =>
        prev.map((s) =>
          String(s.id) === String(service.id) ? result.service : s,
        ),
      );
      setNotice(
        `Se guardó "${result.service.name}". Los próximos turnos usarán sus nuevos valores.`,
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-[#DDC88A]">
          Servicios y precios
        </h2>
        <p className="mt-2 text-sm text-white/60">
          Los cambios afectan futuras reservas; no alteran los importes de
          turnos anteriores.
        </p>
      </div>
      {busy && <p>Cargando servicios…</p>}
      {error && (
        <p role="alert" className="text-red-300">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-green-300">
          {notice}
        </p>
      )}
      {services.map((s) => (
        <div
          key={s.id}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3"
        >
          <div className="text-xs text-[#DDC88A]">Servicio #{s.id}</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label>
              <span className={label}>Nombre</span>
              <input
                className={field}
                value={s.name}
                onChange={(e) => edit(s.id, "name", e.target.value)}
              />
            </label>
            <label>
              <span className={label}>Precio ($ ARS)</span>
              <input
                className={field}
                type="number"
                min="0"
                step="1"
                value={s.price}
                onChange={(e) => edit(s.id, "price", e.target.value)}
              />
            </label>
            <label>
              <span className={label}>Duración (minutos)</span>
              <input
                className={field}
                type="number"
                min="5"
                step="5"
                value={s.durationMinutes}
                onChange={(e) => edit(s.id, "durationMinutes", e.target.value)}
              />
            </label>
            <label>
              <span className={label}>Categoría</span>
              <input
                className={field}
                value={s.category || ""}
                onChange={(e) => edit(s.id, "category", e.target.value)}
              />
            </label>
          </div>
          <label className="block">
            <span className={label}>Descripción</span>
            <textarea
              rows={2}
              className={field}
              value={s.description || ""}
              onChange={(e) => edit(s.id, "description", e.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-5 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={s.active !== false}
                onChange={(e) => edit(s.id, "active", e.target.checked)}
              />{" "}
              Activo
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!s.isPromo}
                onChange={(e) => edit(s.id, "isPromo", e.target.checked)}
              />{" "}
              Promoción
            </label>
          </div>
          <button
            type="button"
            disabled={savingId !== null}
            onClick={() => save(s)}
            className="rounded-xl bg-[#DDC88A] px-5 py-3 font-semibold text-black disabled:opacity-50"
          >
            {savingId === s.id ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      ))}
    </div>
  );
}
