"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "../../components/Card";
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

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16, display: "grid", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>{hive.name}</h1>
        <Button onClick={() => router.push("/hives")}>Nazad</Button>
      </div>

      <Card>
        <div style={{ display: "grid", gap: 6 }}>
          <div><b>ID:</b> {hive.id}</div>
          <div><b>Lokacija:</b> {hive.location ?? "-"}</div>
          <div><b>Status:</b> {hive.status ?? "-"}</div>
          <div><b>Strength:</b> {hive.strength ?? "-"}</div>
          {hive.owner && (
            <div><b>Owner:</b> {hive.owner.fullName} ({hive.owner.email})</div>
          )}
        </div>
      </Card>

      <Card>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Komentari</h2>
        {hive.comments && hive.comments.length > 0 ? (
          <div style={{ display: "grid", gap: 10 }}>
            {hive.comments.map((c) => (
              <div key={c.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
                <div style={{ fontWeight: 600 }}>{c.text}</div>
                <div style={{ opacity: 0.7, marginTop: 4 }}>Comment ID: {c.id}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ opacity: 0.8 }}>Nema komentara.</div>
        )}
      </Card>
    </div>
  );
}
