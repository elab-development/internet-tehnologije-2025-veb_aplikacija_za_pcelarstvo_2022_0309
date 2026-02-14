"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageShell, FancyHeader, Card, Input, Select, PrimaryButton, GhostButton, ErrorBox } from "../../../components/ui";

type Hive = {
  id: number;
  name: string;
  location?: string | null;
  status?: string | null;
  strength?: number | null;
};

export default function EditHivePage() {
  const router = useRouter();
 //uzimanje id-a iz URL-a
  const params = useParams();
  const id = Number((params as { id?: string })?.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [strength, setStrength] = useState("");

  useEffect(() => {
    if (Number.isNaN(id)) {
      setError("Neispravan ID.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
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

        const h: Hive = data.hive;
        setName(h.name ?? "");
        setLocation(h.location ?? "");
        setStatus(h.status ?? "ACTIVE");
        setStrength(h.strength === null || h.strength === undefined ? "" : String(h.strength));
      } catch {
        setError("Greška na serveru.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/hives/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          location: location.length ? location : null,
          status,
          strength: strength.length ? Number(strength) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Ne mogu da sačuvam izmene.");
        return;
      }

      router.push(`/hives/${id}`);
    } catch {
      setError("Greška na serveru.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageShell>
        <div style={{ padding: 16 }}>Učitavanje...</div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <FancyHeader
        title="Uredi košnicu"
        subtitle="🐝 Beekeeping Dashboard"
        right={
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <GhostButton onClick={() => router.push(`/hives/${id}`)}>← Nazad</GhostButton>
          </div>
        }
      />

      <div style={{ height: 18 }} />

      <Card>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <Input label="Naziv košnice" value={name} onChange={setName} required />
          <Input label="Lokacija" value={location} onChange={setLocation} />

          <Select
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "ACTIVE", label: "ACTIVE ✅" },
              { value: "INACTIVE", label: "INACTIVE ⛔" },
              { value: "OK", label: "OK 👍" },
            ]}
          />

          <Input label="Strength (0-10)" value={strength} onChange={setStrength} type="number" placeholder="0-10" />

          {error && <ErrorBox text={error} />}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? "Čuvanje..." : "Sačuvaj izmene"}
            </PrimaryButton>
            <GhostButton onClick={() => router.push(`/hives/${id}`)}>Otkaži</GhostButton>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}
