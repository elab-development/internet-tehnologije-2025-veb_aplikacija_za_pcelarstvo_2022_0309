import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Missing query params: lat, lon" },
      { status: 400 }
    );
  }

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${encodeURIComponent(lat)}` +
    `&longitude=${encodeURIComponent(lon)}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m` +
    `&timezone=auto`;

  const res = await fetch(url);

  if (!res.ok) {
    return NextResponse.json({ error: "Weather API failed" }, { status: 502 });
  }

  const data = await res.json();

  // vracamo samo sta treba
  return NextResponse.json({
    lat: data.latitude,
    lon: data.longitude,
    timezone: data.timezone,
    current: data.current, // temp, humidity, wind
  });
}
