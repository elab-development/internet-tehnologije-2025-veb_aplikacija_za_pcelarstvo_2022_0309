"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Hive = {
  id: number;
  name: string;
  location?: string | null;
  status?: string | null;
  strength?: number | null;
};

type HiveStats = {
  total: number;
  active: number;
  inactive: number;
  unknown: number;
  avgStrength: number | null;
  topLocations: { location: string; count: number }[];
};

type StoredUser = {
  id: number;
  email: string;
  fullName: string;
  role: "BEEKEEPER" | "ADMIN" | "ASSOCIATION_REP";
};

function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function statusStyles(status?: string | null) {
  if (status === "ACTIVE") return { bg: "#dcfce7", fg: "#15803d", border: "#22c55e", label: "ACTIVE ✅" };
  if (status === "INACTIVE") return { bg: "#fee2e2", fg: "#b91c1c", border: "#ef4444", label: "INACTIVE ⛔" };
  return { bg: "#fef3c7", fg: "#92400e", border: "#f59e0b", label: `${status ?? "UNKNOWN"} ⚠️` };
}

function strengthPercent(strength?: number | null) {
  if (strength === null || strength === undefined) return 0;
  const clamped = Math.max(0, Math.min(10, strength));
  return (clamped / 10) * 100;
}

function strengthColor(strength?: number | null) {
  if (strength === null || strength === undefined) return "#94a3b8";
  if (strength >= 8) return "#22c55e";
  if (strength >= 5) return "#f59e0b";
  return "#ef4444";
}

export default function HivesPage() {
  const router = useRouter();
  const [hives, setHives] = useState<Hive[]>([]);
  const [stats, setStats] = useState<HiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [me, setMe] = useState<StoredUser | null>(null);

  //  Samo ADMIN i BEEKEEPER smeju da dodaju/uređuju košnice
  const canManageHives = me?.role === "ADMIN" || me?.role === "BEEKEEPER";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // učitaj ulogovanog korisnika iz localStorage (da znamo rolu)
    setMe(getStoredUser());

    async function loadHives() {
      try {
        const res = await fetch("/api/hives", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? "Unauthorized");
        }

        const data = await res.json();

        if (data?.stats) {
          setStats(data.stats);
          setHives([]);
        } else {
          setStats(null);
          setHives(data?.hives ?? []);
        }
      } catch (e) {
        setError("Greška pri učitavanju košnica.");
      } finally {
        setLoading(false);
      }
    }

    loadHives();
  }, [router]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return hives;

    return hives.filter((h) => {
      const name = (h.name ?? "").toLowerCase();
      const loc = (h.location ?? "").toLowerCase();
      return name.includes(q) || loc.includes(q);
    });
  }, [hives, query]);

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "40px auto",
        padding: 16,
        display: "grid",
        gap: 20,
        background: "#fffbea",
        borderRadius: 20,
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #6366f1, #22c55e)",
          padding: 24,
          borderRadius: 20,
          color: "white",
          boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>🐝 Beekeeping Dashboard</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>Košnice</h1>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {/*  Sakrij za ASSOCIATION_REP */}
          {canManageHives && (
            <button
              onClick={() => router.push("/hives/create")}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                border: "none",
                background: "rgba(255,255,255,0.92)",
                color: "#111827",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              + Nova košnica
            </button>
          )}

          <button
            onClick={logout}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "none",
              background: "white",
              color: "#111827",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {!loading && !error && !stats && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: 18,
            padding: 14,
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontWeight: 800, opacity: 0.85 }}>🔎 Pretraga</div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pretraži po nazivu ili lokaciji (npr. Tara, Košnica 1...)"
            style={{
              flex: 1,
              minWidth: 260,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              outline: "none",
            }}
          />
          <button
            onClick={() => setQuery("")}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Reset
          </button>
        </div>
      )}

      {loading && <p>Učitavanje...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div style={{ display: "grid", gap: 16 }}>
          {stats && (
            <div
              style={{
                background: "#ffffff",
                borderRadius: 18,
                padding: 18,
                boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                display: "grid",
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 18 }}>📊 Pregled sistema (Udruženje)</div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                <div style={{ padding: 14, borderRadius: 14, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ opacity: 0.7, fontWeight: 700 }}>Ukupno košnica</div>
                  <div style={{ fontSize: 26, fontWeight: 900 }}>{stats.total}</div>
                </div>

                <div style={{ padding: 14, borderRadius: 14, background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <div style={{ opacity: 0.8, fontWeight: 700 }}>ACTIVE</div>
                  <div style={{ fontSize: 26, fontWeight: 900 }}>{stats.active}</div>
                </div>

                <div style={{ padding: 14, borderRadius: 14, background: "#fef2f2", border: "1px solid #fecaca" }}>
                  <div style={{ opacity: 0.8, fontWeight: 700 }}>INACTIVE</div>
                  <div style={{ fontSize: 26, fontWeight: 900 }}>{stats.inactive}</div>
                </div>

                <div style={{ padding: 14, borderRadius: 14, background: "#fffbeb", border: "1px solid #fde68a" }}>
                  <div style={{ opacity: 0.8, fontWeight: 700 }}>UNKNOWN</div>
                  <div style={{ fontSize: 26, fontWeight: 900 }}>{stats.unknown}</div>
                </div>

                <div style={{ padding: 14, borderRadius: 14, background: "#eef2ff", border: "1px solid #c7d2fe" }}>
                  <div style={{ opacity: 0.8, fontWeight: 700 }}>Prosečna jačina</div>
                  <div style={{ fontSize: 26, fontWeight: 900 }}>
                    {stats.avgStrength === null ? "—" : `${stats.avgStrength.toFixed(1)}/10`}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 6, fontWeight: 900 }}>📍 Top lokacije</div>
              {stats.topLocations.length === 0 ? (
                <div style={{ opacity: 0.75 }}>Nema podataka.</div>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {stats.topLocations.map((x) => (
                    <div
                      key={x.location}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: 12,
                        borderRadius: 12,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        fontWeight: 800,
                      }}
                    >
                      <span>{x.location}</span>
                      <span>{x.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!stats && hives.length === 0 && (
            <div
              style={{
                borderRadius: 16,
                padding: 20,
                background: "#ffffff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                textAlign: "center",
              }}
            >
              Nema košnica u bazi 🐝
            </div>
          )}

          {!stats && hives.length > 0 && filtered.length === 0 && (
            <div
              style={{
                borderRadius: 16,
                padding: 20,
                background: "#ffffff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                textAlign: "center",
              }}
            >
              Nema rezultata za: <b>{query}</b>
            </div>
          )}

          {!stats &&
            filtered.map((h) => {
              const st = statusStyles(h.status);

              return (
                <div
                  key={h.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: 18,
                    padding: 20,
                    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                    borderLeft: `6px solid ${st.border}`,
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: 20 }}>{h.name}</strong>
                    <span style={{ opacity: 0.7, fontWeight: 700 }}>ID: {h.id}</span>
                  </div>

                  <div>📍 Lokacija: {h.location ?? "-"}</div>

                  <div>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        background: st.bg,
                        color: st.fg,
                        border: `1px solid ${st.border}`,
                        fontWeight: 800,
                      }}
                    >
                      {st.label}
                    </span>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 700 }}>Strength</span>
                      <span style={{ fontWeight: 900 }}>{h.strength ?? "-"}/10</span>
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        height: 10,
                        borderRadius: 999,
                        background: "#e5e7eb",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${strengthPercent(h.strength)}%`,
                          height: "100%",
                          background: strengthColor(h.strength),
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                    <button
                      onClick={() => router.push(`/hives/${h.id}`)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 10,
                        border: "none",
                        background: "#4f46e5",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: 800,
                      }}
                    >
                      Detalji
                    </button>

                    {/* ✅ Sakrij "Uredi" za ASSOCIATION_REP */}
                    {canManageHives && (
                      <button
                        onClick={() => router.push(`/hives/edit/${h.id}`)}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 10,
                          border: "1px solid #cbd5e1",
                          background: "#f8fafc",
                          cursor: "pointer",
                          fontWeight: 800,
                        }}
                      >
                        ✏️ Uredi
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
