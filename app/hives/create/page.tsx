"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateHivePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [strength, setStrength] = useState(5);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const res = await fetch("/api/hives", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, location, status, strength }),
    });

    if (res.ok) {
      router.push("/hives");
    } else {
      alert("Greška pri dodavanju košnice");
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20 }}>
      <h1>Dodaj košnicu</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <input placeholder="Naziv" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Lokacija" value={location} onChange={(e) => setLocation(e.target.value)} />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>

        <input
          type="number"
          min={0}
          max={10}
          value={strength}
          onChange={(e) => setStrength(Number(e.target.value))}
        />

        <button type="submit">Sačuvaj</button>
      </form>
    </div>
  );
}
