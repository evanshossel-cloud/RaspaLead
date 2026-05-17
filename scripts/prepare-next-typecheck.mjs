import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const typesDir = path.join(process.cwd(), ".next", "types");
const routesDefinitionPath = path.join(typesDir, "routes.d.ts");
const routesShimPath = path.join(typesDir, "routes.js.d.ts");

async function main() {
  await mkdir(typesDir, { recursive: true });

  try {
    await stat(routesDefinitionPath);
  } catch {
    return;
  }

  await writeFile(routesShimPath, 'export * from "./routes";\n', "utf8");
}

await main();
