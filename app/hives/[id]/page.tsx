"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "../../components/Button";

type Hive = {
  id: number;
  name: string;
  location?: string | null;
  status?: string | null;
  strength?: number | null;
  owner?: { id: number; fullName: string; email: string };
  comments?: { id: number; text: string; hiveId: number; authorId: number; createdAt: string }[];
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

export default function HiveDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number((params as { id?: string })?.id);

  const [hive, setHive] = useState<Hive | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(id)) {
      setError("Neispravan ID košnice.");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const res = await fetch(`/api/hives/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error ?? "Ne mogu da učitam košnicu.");
          return;
        }
        setHive(data.hive);
      } catch {
        setError("Greška na serveru.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) return <div style={{ padding: 16 }}>Učitavanje...</div>;

  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <p style={{ color: "red" }}>{error}</p>
        <Button onClick={() => router.push("/hives")}>Nazad</Button>
      </div>
    );
  }

  if (!hive) {
    return (
      <div style={{ padding: 16 }}>
        <p>Košnica nije pronađena.</p>
        <Button onClick={() => router.push("/hives")}>Nazad</Button>
      </div>
    );
  }

  const st = statusStyles(hive.status);

  return (
    <div
      style={{
        maxWidth: 980,
        margin: "40px auto",
        padding: 16,
        display: "grid",
        gap: 14,
        background: "#fffbea",
        borderRadius: 20,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: "linear-gradient(135deg, #6366f1, #22c55e)",
          padding: 22,
          borderRadius: 18,
          color: "white",
          boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ fontSize: 12, opacity: 0.9 }}>🐝 Hive details</div>
          <h1 style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.1 }}>{hive.name}</h1>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.25)",
                fontWeight: 700,
              }}
            >
              ID: {hive.id}
            </span>

            <span
              style={{
                padding: "6px 10px",
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
        </div>

        {/* EDIT + DELETE + BACK */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button onClick={() => router.push(`/hives/edit/${hive.id}`)}>✏️ Uredi</Button>

          <Button
            onClick={async () => {
              const token = localStorage.getItem("token");
              if (!token) return router.push("/login");

              const ok = confirm(`Obriši košnicu "${hive.name}"?`);
              if (!ok) return;

              const res = await fetch(`/api/hives/${hive.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });

              if (!res.ok) {
                const data = await res.json().catch(() => null);
                alert(data?.error ?? "Brisanje nije dozvoljeno.");
                return;
              }

              router.push("/hives");
            }}
          >
            🗑 Obriši
          </Button>

          <Button onClick={() => router.push("/hives")}>← Nazad</Button>
        </div>
      </div>

      {/* INFO CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div
          style={{
            background: "#ffffff",
            borderRadius: 18,
            padding: 18,
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
            borderLeft: "6px solid #6366f1",
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>📍 Osnovni podaci</h2>

          <div style={{ display: "grid", gap: 8 }}>
            <div>
              <b>Lokacija:</b> {hive.location ?? "-"}
            </div>

            {hive.owner && (
              <div>
                <b>Owner:</b> {hive.owner.fullName}{" "}
                <span style={{ opacity: 0.7 }}>({hive.owner.email})</span>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            borderRadius: 18,
            padding: 18,
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
            borderLeft: `6px solid ${strengthColor(hive.strength)}`,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>💪 Snaga košnice</h2>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div style={{ fontWeight: 700, opacity: 0.9 }}>Strength</div>
            <div style={{ fontWeight: 900 }}>
              {hive.strength ?? "-"} <span style={{ opacity: 0.6 }}>/ 10</span>
            </div>
          </div>

          <div
            style={{
              marginTop: 10,
              height: 12,
              borderRadius: 999,
              background: "#e5e7eb",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${strengthPercent(hive.strength)}%`,
                height: "100%",
                background: strengthColor(hive.strength),
              }}
            />
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
            {hive.strength === null || hive.strength === undefined
              ? "Nema unete vrednosti snage."
              : hive.strength >= 8
                ? "Odlično stanje, košnica je jaka ✅"
                : hive.strength >= 5
                  ? "Solidno stanje, pratiti razvoj 🟠"
                  : "Slabije stanje, preporuka kontrola 🔴"}
          </div>
        </div>
      </div>

      {/* COMMENTS */}
      <div
        style={{
          background: "linear-gradient(180deg, #ffffff, #f8fafc)",
          borderRadius: 18,
          padding: 18,
          boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
          border: "1px solid #eef2f7",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <h2 style={{ fontSize: 18, fontWeight: 900 }}>💬 Komentari</h2>
          <span style={{ opacity: 0.7, fontWeight: 700 }}>{hive.comments?.length ?? 0} ukupno</span>
        </div>

        <div style={{ marginTop: 12 }}>
          {hive.comments && hive.comments.length > 0 ? (
            <div style={{ display: "grid", gap: 12 }}>
              {hive.comments.map((c, idx) => {
                const accent = idx % 3 === 0 ? "#38bdf8" : idx % 3 === 1 ? "#a78bfa" : "#22c55e";
                const bubbleBg = idx % 3 === 0 ? "#f0f9ff" : idx % 3 === 1 ? "#f5f3ff" : "#f0fdf4";

                return (
                  <div
                    key={c.id}
                    style={{
                      background: bubbleBg,
                      borderRadius: 16,
                      padding: 14,
                      border: `1px solid ${accent}`,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                      borderLeft: `6px solid ${accent}`,
                      display: "grid",
                      gap: 6,
                    }}
                  >
                    <div style={{ fontWeight: 800 }}>{c.text}</div>
                    <div style={{ fontSize: 12, opacity: 0.7, display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <span>Comment ID: {c.id}</span>
                      <span>Hive ID: {c.hiveId}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                marginTop: 10,
                padding: 14,
                borderRadius: 14,
                border: "1px dashed #cbd5e1",
                background: "#f8fafc",
                opacity: 0.9,
              }}
            >
              Još uvek nema komentara za ovu košnicu. 📝
            </div>
          )}
        </div>
      </div>
    </div>
  );

}
