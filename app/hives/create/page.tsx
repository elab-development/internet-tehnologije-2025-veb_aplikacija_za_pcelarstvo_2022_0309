"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell, FancyHeader, Card, Input, Select, PrimaryButton, GhostButton, ErrorBox } from "../../components/ui";

export default function CreateHivePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [strength, setStrength] = useState("7");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/hives", {
        method: "POST",
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
        setError(data?.error ?? "Ne mogu da kreiram košnicu.");
        return;
      }

      router.push("/hives");
    } catch {
      setError("Greška na serveru.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <FancyHeader
        title="Nova košnica"
        subtitle="🐝 Beekeeping Dashboard"
        right={
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <GhostButton onClick={() => router.push("/hives")}>← Nazad</GhostButton>
          </div>
        }
      />

      <div style={{ height: 18 }} />

      <Card>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <Input label="Naziv košnice" value={name} onChange={setName} placeholder="Npr. Bagremova košnica" required />
          <Input label="Lokacija" value={location} onChange={setLocation} placeholder="Npr. Tara" />

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
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? "Čuvanje..." : "Sačuvaj"}
            </PrimaryButton>
            <GhostButton onClick={() => router.push("/hives")}>Otkaži</GhostButton>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}
