"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditHivePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number((params as { id?: string })?.id);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [strength, setStrength] = useState(5);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/hives/${id}`);
      const data = await res.json();
      const h = data.hive;

      setName(h.name);
      setLocation(h.location ?? "");
      setStatus(h.status ?? "ACTIVE");
      setStrength(h.strength ?? 5);
    }

    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const res = await fetch(`/api/hives/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, location, status, strength }),
    });

    if (res.ok) router.push("/hives");
    else alert("Greška pri izmeni");
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 20 }}>
      <h1>Uredi košnicu</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <input value={location} onChange={(e) => setLocation(e.target.value)} />

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

        <button type="submit">Sačuvaj izmene</button>
      </form>
    </div>
  );
}
