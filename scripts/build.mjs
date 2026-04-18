import { copyFile, cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";

const rootDir = process.cwd();
const gamesDir = join(rootDir, "games");
const distDir = join(rootDir, "dist");
const rootManifestPath = join(rootDir, "games-manifest.js");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

function packageToSlug(packageName) {
  return packageName.replace(/^@[^/]+\//, "").replace(/[^a-z0-9-]+/gi, "-").toLowerCase();
}

async function discoverGamePackages() {
  const entries = await readdir(gamesDir, { withFileTypes: true });
  const packageDirs = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const gameDir = join(gamesDir, entry.name);
    const packagePath = join(gameDir, "package.json");
    if (existsSync(packagePath)) {
      packageDirs.push({ dir: gameDir, folder: entry.name, packagePath });
    }
  }

  return packageDirs;
}

function runGameBuild(gameDir, packageJson) {
  if (!packageJson.scripts?.build) {
    return;
  }

  const result = spawnSync("npm", ["run", "build"], {
    cwd: gameDir,
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    throw new Error(`Game build failed in ${relative(rootDir, gameDir)}`);
  }
}

async function buildGame({ dir, folder, packagePath }) {
  const packageJson = await readJson(packagePath);
  const metadata = packageJson.arcadeShelf || {};
  const slug = metadata.slug || packageToSlug(packageJson.name || folder);
  const sourceEntry = metadata.entry || "dist/index.html";
  const sourceEntryPath = join(dir, sourceEntry);
  const sourceDir = join(dir, sourceEntry.split("/")[0] || "dist");
  const outputDir = join(distDir, "games", slug);

  runGameBuild(dir, packageJson);

  if (!existsSync(sourceEntryPath)) {
    throw new Error(`${relative(rootDir, sourceEntryPath)} does not exist after build`);
  }

  await mkdir(outputDir, { recursive: true });
  await cp(sourceDir, outputDir, { recursive: true });

  return {
    id: slug,
    title: metadata.title || packageJson.name || folder,
    type: metadata.type || "arcade",
    note: metadata.note || packageJson.description || "A shared game from the games directory.",
    color: metadata.color || "#83d2f4",
    url: `games/${slug}/`,
  };
}

async function writeManifest(games) {
  const manifest = `window.ArcadeShelfGames = ${JSON.stringify(games, null, 2)};\n`;
  await writeFile(rootManifestPath, manifest);
  await writeFile(join(distDir, "games-manifest.js"), manifest);
}

async function copyHomePage() {
  await mkdir(distDir, { recursive: true });
  await copyFile(join(rootDir, "index.html"), join(distDir, "index.html"));
  await copyFile(join(rootDir, "styles.css"), join(distDir, "styles.css"));
  await copyFile(join(rootDir, "script.js"), join(distDir, "script.js"));
  await writeFile(join(distDir, ".nojekyll"), "");
}

async function main() {
  await rm(distDir, { recursive: true, force: true });
  await copyHomePage();

  const packageDirs = await discoverGamePackages();
  const games = [];
  for (const packageDir of packageDirs) {
    games.push(await buildGame(packageDir));
  }

  games.sort((a, b) => a.title.localeCompare(b.title));
  await writeManifest(games);
  console.log(`Built homepage with ${games.length} game package${games.length === 1 ? "" : "s"}.`);
  console.log(`Static site output: ${relative(rootDir, distDir)}/`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
