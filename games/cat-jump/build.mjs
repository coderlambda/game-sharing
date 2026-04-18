import { copyFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const gameDir = process.cwd();
const distDir = join(gameDir, "dist");

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await copyFile(join(gameDir, "index.html"), join(distDir, "index.html"));

console.log("Built Cat Jump.");
