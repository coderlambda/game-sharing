# Arcade Shelf

A static game-sharing site. The root npm package builds the homepage and every
game package in `games/` into static HTML, CSS, and JavaScript under `dist/`.

## Build

```bash
npm run build
```

The complete static site is written to:

```text
dist/
```

That folder is the GitHub Pages artifact. It contains the homepage, generated
game manifest, and each built game under `dist/games/<game-slug>/`.

## Preview

```bash
npm start
```

Then open:

```text
http://localhost:8000/
```

## Add a Game

Create a new npm package folder inside `games/`:

```text
games/
  my-game/
    package.json
    index.html
    styles.css
    script.js
    build.mjs
```

Each game package should include a `build` script and an `arcadeShelf` metadata
block:

```json
{
  "name": "@arcade-shelf/my-game",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "node build.mjs"
  },
  "arcadeShelf": {
    "title": "My Game",
    "type": "arcade",
    "note": "A short description for the homepage.",
    "entry": "dist/index.html",
    "color": "#83d2f4"
  }
}
```

When `npm run build` runs, the root package discovers every `games/*/package.json`,
runs each game package build, copies the game output into `dist/games/`, and adds
the game to the generated homepage manifest.

## GitHub Pages

Build with `npm run build`, then publish the contents of `dist/` with GitHub
Pages. The output is static and does not need Node at runtime.
