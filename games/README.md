# Games

Put each shared game in its own npm package folder here.

Example:

```text
games/
  space-snack-dash/
    package.json
    index.html
    styles.css
    script.js
    build.mjs
```

Each game package should include an `arcadeShelf` field in `package.json`.
The root `npm run build` command will run each game package's build script,
copy its output into `dist/games/`, and add it to the homepage manifest.

```json
{
  "name": "@arcade-shelf/space-snack-dash",
  "private": true,
  "scripts": {
    "build": "node build.mjs"
  },
  "arcadeShelf": {
    "title": "Space Snack Dash",
    "type": "platformer",
    "note": "Jump, dodge, and collect snacks.",
    "entry": "dist/index.html",
    "color": "#83d2f4"
  }
}
```
