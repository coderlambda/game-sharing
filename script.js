const starterGames = [
  {
    id: "moon-muffin-run",
    title: "Moon Muffin Run",
    type: "platformer",
    url: "https://example.com/moon-muffin-run",
    note: "Jump across snack platforms, collect moon coins, and find the shortcut above level three.",
    color: "#83d2f4",
  },
  {
    id: "switch-stack",
    title: "Switch Stack",
    type: "puzzle",
    url: "https://example.com/switch-stack",
    note: "A block swapping puzzle where every move changes the board. Try to clear it in eight turns.",
    color: "#f5d37b",
  },
  {
    id: "laser-lunch",
    title: "Laser Lunch",
    type: "arcade",
    url: "https://example.com/laser-lunch",
    note: "Dodge the lunch tray lasers and beat the high score before the cafeteria timer runs out.",
    color: "#b9a7f0",
  },
];

const savedGamesKey = "arcade-shelf-games";
const builtGames = Array.isArray(window.ArcadeShelfGames) ? window.ArcadeShelfGames : [];
const grid = document.querySelector("#game-grid");
const filterButtons = document.querySelectorAll(".filter-button");
const form = document.querySelector("#game-form");
const formStatus = document.querySelector("#form-status");
const dialog = document.querySelector("#game-dialog");
const dialogArt = document.querySelector("#dialog-art");
const dialogType = document.querySelector("#dialog-type");
const dialogTitle = document.querySelector("#dialog-title");
const dialogNote = document.querySelector("#dialog-note");
const dialogPlay = document.querySelector("#dialog-play");
const dialogShare = document.querySelector("#dialog-share");
const closeDialog = document.querySelector(".close-dialog");

let activeFilter = "all";

function loadGames() {
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem(savedGamesKey) || "[]");
  } catch {
    localStorage.removeItem(savedGamesKey);
  }

  const packagedGames = builtGames.length ? builtGames : starterGames;
  return [...packagedGames, ...saved];
}

function saveGame(game) {
  const packagedIds = new Set([...starterGames, ...builtGames].map((game) => game.id));
  const saved = loadGames().filter((item) => !packagedIds.has(item.id));
  localStorage.setItem(savedGamesKey, JSON.stringify([game, ...saved]));
}

function getFilteredGames() {
  const games = loadGames();
  if (activeFilter === "all") {
    return games;
  }

  return games.filter((game) => game.type === activeFilter);
}

function typeLabel(type) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function renderGames() {
  const games = getFilteredGames();
  grid.innerHTML = "";

  games.forEach((game) => {
    const card = document.createElement("article");
    card.className = "game-card";

    const thumb = document.createElement("div");
    thumb.className = `thumb ${game.type}`;
    thumb.style.setProperty("--thumb-bg", game.color);

    const body = document.createElement("div");
    body.className = "game-body";

    const meta = document.createElement("div");
    meta.className = "game-meta";
    const type = document.createElement("span");
    type.textContent = typeLabel(game.type);
    meta.append(type);

    const title = document.createElement("h3");
    title.textContent = game.title;

    const note = document.createElement("p");
    note.textContent = game.note;

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const details = document.createElement("button");
    details.type = "button";
    details.dataset.details = game.id;
    details.textContent = "Details";

    const play = document.createElement("a");
    play.href = game.url;
    play.target = "_blank";
    play.rel = "noreferrer";
    play.textContent = "Play";

    actions.append(details, play);
    body.append(meta, title, note, actions);
    card.append(thumb, body);
    grid.append(card);
  });

  if (!games.length) {
    grid.innerHTML = `<p class="empty-state">No games in this category yet.</p>`;
  }
}

function openDetails(gameId) {
  const game = loadGames().find((item) => item.id === gameId);
  if (!game) {
    return;
  }

  dialogArt.className = `dialog-art thumb ${game.type}`;
  dialogArt.style.setProperty("--thumb-bg", game.color);
  dialogType.textContent = typeLabel(game.type);
  dialogTitle.textContent = game.title;
  dialogNote.textContent = game.note;
  dialogPlay.href = game.url;
  dialogShare.dataset.url = game.url;
  dialog.showModal();
}

async function copyLink(url) {
  try {
    await navigator.clipboard.writeText(url);
    dialogShare.textContent = "Copied";
    window.setTimeout(() => {
      dialogShare.textContent = "Copy link";
    }, 1400);
  } catch {
    dialogShare.textContent = "Copy failed";
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderGames();
  });
});

grid.addEventListener("click", (event) => {
  const detailsButton = event.target.closest("[data-details]");
  if (detailsButton) {
    openDetails(detailsButton.dataset.details);
  }
});

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const title = formData.get("title").trim();
    const type = formData.get("type");

    const game = {
      id: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      title,
      type,
      url: formData.get("url").trim(),
      note: formData.get("note").trim(),
      color: type === "platformer" ? "#83d2f4" : type === "puzzle" ? "#f5d37b" : "#b9a7f0",
    };

    saveGame(game);
    form.reset();
    activeFilter = "all";
    filterButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.filter === "all");
    });
    renderGames();
    formStatus.textContent = `${title} was added to the shelf.`;
  });
}

closeDialog.addEventListener("click", () => dialog.close());
dialogShare.addEventListener("click", () => copyLink(dialogShare.dataset.url));

renderGames();
