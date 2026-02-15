import { mkdir, cp } from "node:fs/promises";

const src = new URL("../node_modules/swagger-ui-dist", import.meta.url);
const dest = new URL("../public/swagger-ui", import.meta.url);

await mkdir(dest, { recursive: true });
await cp(src, dest, { recursive: true });

console.log("✅ Copied swagger-ui-dist -> public/swagger-ui");
