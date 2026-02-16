import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Missing query param: q" }, { status: 400 });
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "HoneyFlow/1.0 (student project)",
      "Accept-Language": "sr,en;q=0.8",
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Geocoding failed" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json(data[0] ?? null);
}
