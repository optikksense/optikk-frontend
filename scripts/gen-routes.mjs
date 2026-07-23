// Regenerates src/routeTree.gen.ts without booting Vite. Mirrors what the
// TanStackRouterVite plugin does at dev/build time, so type-check sees new
// routes. Safe to run repeatedly.
import { Generator, getConfig } from "@tanstack/router-generator";

const root = process.cwd();
const config = getConfig({}, root);
const generator = new Generator({ config, root });
await generator.run();
console.log("routeTree.gen.ts regenerated");
