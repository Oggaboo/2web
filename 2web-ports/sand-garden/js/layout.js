// Fits the square sand canvas and the button panel into whatever box the game
// is given, and refits whenever that box changes (porting rule 4.1).
const MIN_PANEL = 190; // narrowest usable button panel beside the canvas
const GAP = 6;

const resize = () => {
  const stage = document.getElementById("stage");
  const ui = document.getElementById("ui");
  const background = document.getElementById("background");
  if (!stage || !ui || !background) return;

  const W = window.innerWidth;
  const H = window.innerHeight;
  // Phones: keep the outer 40px free (notches, and the 2Web exit tab that sits
  // on the left edge). The desktop frame has no such chrome.
  const phone =
    (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) ||
    Math.min(W, H) < 330;
  const inset = phone ? 40 : 4;
  const w = Math.max(W - inset * 2, 120);
  const h = Math.max(H - inset * 2, 120);

  let side, panelW, panelH, row;
  if (w - MIN_PANEL - GAP >= h * 0.75 || w > h * 1.25) {
    // wide: canvas on the left, panel on the right
    row = true;
    side = Math.floor(Math.min(h, w - MIN_PANEL - GAP));
    panelW = Math.floor(Math.min(w - side - GAP, 420));
    panelH = h;
  } else {
    // tall: panel on top, canvas underneath
    row = false;
    side = Math.floor(Math.min(w, h * 0.6));
    panelW = w;
    panelH = Math.floor(h - side - GAP);
  }

  background.style.padding = `${inset}px`;
  background.className = row ? "row" : "column";
  stage.style.width = stage.style.height = `${side}px`;
  ui.style.width = `${panelW}px`;
  ui.style.height = `${panelH}px`;

  // Size the text so every row fits the panel.
  const cols = panelW >= 330 ? 4 : 3;
  const rows = 2 + Math.ceil(20 / cols); // tools row, sizes row, 20 elements
  const cell = Math.min((panelH - 4) / rows, 54);
  ui.style.setProperty("--cols", cols);
  ui.style.setProperty("--cell", `${Math.floor(cell)}px`);
  ui.style.setProperty(
    "--font",
    `${Math.max(9, Math.min(19, Math.floor(cell * 0.55), Math.floor(panelW / cols / 4.4)))}px`
  );
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", resize);
} else {
  resize();
}
window.addEventListener("resize", resize);
window.addEventListener("orientationchange", resize);
if (window.visualViewport) window.visualViewport.addEventListener("resize", resize);

export { resize };
