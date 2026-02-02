"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Hive = {
  id: number;
  name: string;
  location?: string | null;
  status?: string | null;
  strength?: number | null;
};

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadHives() {
      try {
        const res = await fetch("/api/hives");
        const data = await res.json();
        setHives(data?.hives ?? []);
      } catch {
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

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: 16, display: "grid", gap: 20 }}>
      {/* HEADER */}
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
          <h1 style={{ fontSize: 32, fontWeight: 900 }}>Košnice</h1>
        </div>

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

      {loading && <p>Učitavanje...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div style={{ display: "grid", gap: 16 }}>
          {hives.map((h) => {
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

                {/* STRENGTH BAR */}
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

                <button
                  onClick={() => router.push(`/hives/${h.id}`)}
                  style={{
                    marginTop: 10,
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: "#4f46e5",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Detalji
                </button>
              </div>
            );
          })}

          {hives.length === 0 && (
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
        </div>
      )}
    </div>
  );
}
