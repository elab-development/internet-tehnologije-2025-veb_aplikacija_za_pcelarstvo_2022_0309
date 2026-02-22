import { NextRequest, NextResponse } from "next/server";

/**
 * Dozvoljeni origin-i (dev + produkcija).

 */
const ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://internet-tehnologije-2025-veb-aplikacija.onrender.com",
  "https://honeyflow.onrender.com",,
]);

function addSecurityHeaders(res: NextResponse) {
  // osnovni sigurnosni header-i
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

  // CSP ume da polomi dev; zato je stavljamo samo u produkciji
   if (process.env.NODE_ENV === "production") {
     res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
   }
  

   res.headers.set(
     "Content-Security-Policy",
     [
       "default-src 'self'",
       "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
       "style-src 'self' 'unsafe-inline'",
       "img-src 'self' data: https: https://tile.openstreetmap.org",

       "font-src 'self' data:",
       // dozvoli konekcije ka eksternim API-jima koje koristimo
       "connect-src 'self' https://api.open-meteo.com https://nominatim.openstreetmap.org https://tile.openstreetmap.org",

       "frame-ancestors 'none'",
     ].join("; ")
   );
}

function getOrigin(req: NextRequest) {
  return req.headers.get("origin") || "";
}

function isAllowedOrigin(origin: string) {
  // ako nema origin (npr. curl/postman/jest) – ne blokiramo
  if (!origin) return true;
  return ALLOWED_ORIGINS.has(origin);
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Uvek dodajemo header-e za sve rute (stranice + api)
  // ali CORS/CSRF logiku radimo samo za /api
  if (!pathname.startsWith("/api")) {
    const res = NextResponse.next();
    addSecurityHeaders(res);
    return res;
  }

  // --- CORS preflight ---
  if (req.method === "OPTIONS") {
    const origin = getOrigin(req);
    const res = new NextResponse(null, { status: 204 });

    if (isAllowedOrigin(origin)) {
      res.headers.set("Access-Control-Allow-Origin", origin);
      res.headers.set("Vary", "Origin");
      res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
      res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.headers.set("Access-Control-Allow-Credentials", "true");
    }

    addSecurityHeaders(res);
    return res;
  }

  // --- “CSRF” zaštita (Origin check) ---
  // za state-changing metode: ako origin postoji i nije dozvoljen, blokiramo
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const origin = getOrigin(req);
    if (origin && !isAllowedOrigin(origin)) {
      const res = NextResponse.json({ error: "CSRF blocked (bad origin)" }, { status: 403 });
      addSecurityHeaders(res);
      return res;
    }
  }

  // --- CORS header-i i za normalne API odgovore ---
  const res = NextResponse.next();
  const origin = getOrigin(req);

  if (origin && isAllowedOrigin(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Vary", "Origin");
    res.headers.set("Access-Control-Allow-Credentials", "true");
  }

  addSecurityHeaders(res);
  return res;
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
