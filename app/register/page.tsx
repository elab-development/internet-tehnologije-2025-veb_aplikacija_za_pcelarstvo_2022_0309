"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell, FancyHeader, Card, Input, Select, PrimaryButton, GhostButton, ErrorBox } from "../components/ui";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("BEEKEEPER");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Register failed");
        return;
      }

      // posle registracije odmah login
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/hives");
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <FancyHeader title="Register" subtitle="🐝 Beekeeping Dashboard" />

      <div style={{ height: 18 }} />

      <Card>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <Input label="Ime i prezime" value={fullName} onChange={setFullName} placeholder="Npr. Test User" required />
          <Input label="Email" value={email} onChange={setEmail} placeholder="test@test.com" required />
          <Input label="Lozinka" value={password} onChange={setPassword} type="password" placeholder="••••••" required />

          <Select
            label="Uloga"
            value={role}
            onChange={setRole}
            options={[
              { value: "BEEKEEPER", label: "BEEKEEPER (pčelar)" },
              { value: "ADMIN", label: "ADMIN" },
              { value: "ASSOCIATION_REP", label: "ASSOCIATION_REP" },
            ]}
          />

          {error && <ErrorBox text={error} />}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? "Kreiranje..." : "Napravi nalog"}
            </PrimaryButton>
            <GhostButton onClick={() => router.push("/login")}>Već imam nalog → Login</GhostButton>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}
