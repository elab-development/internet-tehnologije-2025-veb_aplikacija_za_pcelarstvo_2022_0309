"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix za default marker ikonice u Next bundleru
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type Hive = {
    id: number;
    name: string;
    location?: string | null;
};

type Geo = {
    lat: number;
    lon: number;
    display_name?: string;
};
type Weather = {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    time?: string;
};


export function HivesMap({ hives }: { hives: Hive[] }) {
    const [coords, setCoords] = useState<Record<number, Geo>>({});
    const [loading, setLoading] = useState(false);
    const [weather, setWeather] = useState<Record<number, Weather>>({});


    const center = useMemo(() => {
        // Ako imamo bar jedan geocodovan hive, centriraj na njega, inače Beograd
        const first = Object.values(coords)[0];
        return first ? ([first.lat, first.lon] as [number, number]) : ([44.817, 20.457] as [number, number]);
    }, [coords]);

    async function geocodeAll() {
        setLoading(true);
        try {
            const entries = await Promise.all(
                hives.map(async (h) => {
                    if (!h.location) return [h.id, null] as const;
                    const res = await fetch(`/api/external/geocode?q=${encodeURIComponent(h.location)}`);
                    const data = await res.json();
                    if (!data?.lat || !data?.lon) return [h.id, null] as const;
                    return [h.id, { lat: Number(data.lat), lon: Number(data.lon), display_name: data.display_name }] as const;
                })
            );

            const next: Record<number, Geo> = {};
            for (const [id, geo] of entries) {
                if (geo) next[id] = geo;
            }
            setCoords(next);
            // Učitaj vreme za geocodovane košnice
            const wEntries = await Promise.all(
                Object.entries(next).map(async ([idStr, g]) => {
                    const id = Number(idStr);
                    const res = await fetch(`/api/external/weather?lat=${g.lat}&lon=${g.lon}`);
                    const data = await res.json();

                    const cur = data?.current ?? {};
                    const w: Weather = {
                        temperature_2m: cur.temperature_2m,
                        relative_humidity_2m: cur.relative_humidity_2m,
                        wind_speed_10m: cur.wind_speed_10m,
                        time: cur.time,
                    };

                    return [id, w] as const;
                })
            );

            const wNext: Record<number, Weather> = {};
            for (const [id, w] of wEntries) wNext[id] = w;
            setWeather(wNext);

        } finally {
            setLoading(false);
        }
    }

    // Ne geocodujemo automatski (da ne spamujemo API), nego na dugme.

    // useEffect(() => { geocodeAll(); }, []);

    return (
        <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                    onClick={geocodeAll}
                    disabled={loading}
                    style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid #cbd5e1",
                        background: "white",
                        cursor: "pointer",
                    }}
                >
                    {loading ? "Učitavam lokacije..." : "Prikaži pčelinjake na mapi"}
                </button>

                <div style={{ color: "#64748b", fontSize: 14 }}>
                    Markeri + krug (radius) su “sopstveni objekti/lejere”.
                </div>
            </div>

            <div style={{ height: 460, borderRadius: 16, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                <MapContainer center={center} zoom={11} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {hives.map((h) => {
                        const c = coords[h.id];
                        if (!c) return null;

                        const pos: [number, number] = [c.lat, c.lon];

                        return (
                            <div key={h.id}>
                                <Marker position={pos}>
                                    <Popup>
                                        <b>{h.name}</b>
                                        <br />
                                        {h.location}
                                        <br />
                                        <small>{c.display_name}</small>

                                        <hr style={{ margin: "10px 0" }} />

                                        {weather[h.id] ? (
                                            <div style={{ display: "grid", gap: 4 }}>
                                                <div>🌡️ Temperatura: <b>{weather[h.id].temperature_2m ?? "—"}°C</b></div>
                                                <div>💧 Vlažnost: <b>{weather[h.id].relative_humidity_2m ?? "—"}%</b></div>
                                                <div>💨 Vetar: <b>{weather[h.id].wind_speed_10m ?? "—"} m/s</b></div>
                                                <div style={{ fontSize: 12, opacity: 0.7 }}>⏱ {weather[h.id].time ?? ""}</div>
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: 13, opacity: 0.7 }}>Učitavam vreme...</div>
                                        )}
                                    </Popup>

                                </Marker>

                                {/* SOPSTVENI OBJEKAT/LEJER: krug oko pčelinjaka (npr. 2km radius) */}
                                <Circle center={pos} radius={2000} />
                            </div>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
}
