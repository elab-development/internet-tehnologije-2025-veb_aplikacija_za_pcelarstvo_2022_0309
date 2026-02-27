import { NextResponse } from "next/server";
// OpenAPI 3.0 specifikacija za HoneyFlow API
// Ova ruta vraća dinamički generisanu Swagger dokumentaciju
export async function GET() {
  return NextResponse.json({
    openapi: "3.0.3",
    info: {
      title: "HoneyFlow API",
      version: "1.0.0",
      description: "API specifikacija za HoneyFlow aplikaciju.",
    },
    servers: [{ url: "http://localhost:3000" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    paths: {
      "/api/auth/login": {
        post: { summary: "Login", responses: { "200": { description: "OK" } } },
      },
      "/api/auth/register": {
        post: { summary: "Register", responses: { "201": { description: "Created" } } },
      },
      "/api/hives": {
        get: {
          summary: "Lista košnica",
          security: [{ bearerAuth: [] }],
          responses: { "200": { description: "OK" } },
        },
        post: {
          summary: "Kreiranje košnice",
          security: [{ bearerAuth: [] }],
          responses: { "201": { description: "Created" } },
        },
      },
    },
  });
}
