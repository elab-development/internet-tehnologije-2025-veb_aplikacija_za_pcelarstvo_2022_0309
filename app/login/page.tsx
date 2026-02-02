"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell, FancyHeader, Card, Input, PrimaryButton, GhostButton, ErrorBox } from "../components/ui";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Login failed");
        return;
      }

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
      <FancyHeader
        title="Login"
        subtitle="🐝 Beekeeping Dashboard"
        right={
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <GhostButton onClick={() => router.push("/register")}>Register</GhostButton>
          </div>
        }
      />

      <div style={{ height: 18 }} />

      <Card>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <Input label="Email" value={email} onChange={setEmail} placeholder="test@test.com" required />
          <Input label="Lozinka" value={password} onChange={setPassword} type="password" placeholder="••••••" required />

          {error && <ErrorBox text={error} />}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? "Logovanje..." : "Login"}
            </PrimaryButton>
            <GhostButton onClick={() => router.push("/register")}>Nemam nalog → Register</GhostButton>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}
