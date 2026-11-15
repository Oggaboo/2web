import { Universe } from "../crate/pkg";

import { VERSION, TITLE } from "./constants";
import { platform } from "./platform";
import { boot } from "./boot";
import { startWebGL } from "./render";
import {} from "./paint";
import {} from "./app";
import { startFluid } from "./fluid";
import { resize } from "./layout";
import { setPaused } from "./pause";

console.log(`${TITLE} v${VERSION}`);

let n = 300;
const universe = Universe.new(n, n);

let width = n;
let height = n;
const canvas = document.getElementById("sand-canvas");

canvas.height = n * Math.ceil(window.devicePixelRatio);
canvas.width = n * Math.ceil(window.devicePixelRatio);

document.getElementById("background").addEventListener(
  "touchmove",
  (e) => {
    if (e.cancelable && e.target.tagName === "CANVAS") e.preventDefault();
  },
  { passive: false }
);

const fluid = startFluid({ universe });
const drawSand = startWebGL({ canvas, universe });

let frames = 0;
const renderLoop = () => {
  if (!window.paused) {
    universe.tick();
    fluid.update();
  }
  drawSand();
  frames++;
  window.animationId = requestAnimationFrame(renderLoop);
};
renderLoop();
window.u = universe;

boot(width, height);

function reset() {
  fluid.reset();
  fluid.update();
  fluid.reset();
  fluid.update();

  universe.reset();
}

function undo() {
  reset();
  universe.pop_undo();
}

document.addEventListener("keydown", function (event) {
  if (event.repeat || !window.UI) return;
  const key = event.key.toLowerCase();
  if ((event.ctrlKey || event.metaKey) && key === "z") {
    undo();
  } else if (event.ctrlKey || event.metaKey || event.altKey) {
    return;
  } else if (key === " " || key === "p") {
    event.preventDefault();
    window.UI.togglePause();
  } else if (key === "z" || key === "u") {
    undo();
  } else if (key === "escape") {
    window.UI.closeInfo();
  } else if (key >= "1" && key <= "5") {
    window.UI.setState({ size: Number(key) - 1 });
  } else if (key === "[" || key === "]") {
    window.UI.cycleElement(key === "]" ? 1 : -1);
  }
});

document.addEventListener("paste", function (event) {
  const text = event.clipboardData.getData("text/plain");
  if (text.includes("<svg")) {
    event.preventDefault();
    window.UI.loadSVG(text);
  }
});

// Drawing on the canvas cancels the default mouse action, which would
// otherwise leave the keyboard pointing at the page around the game's frame.
window.addEventListener("pointerdown", () => window.focus(), true);

// Drawing or clearing ends the opening animation.
canvas.addEventListener("pointerdown", () => (window.stopboot = true));

// 2Web: stop the simulation while an ad shows. (The game has no sound.)
platform.onPause((paused) => setPaused("platform", paused));

// Studio rule 2.9: a handle for automated playtests.
window.__game = {
  title: TITLE,
  version: VERSION,
  universe,
  width,
  height,
  get paused() {
    return !!window.paused;
  },
  get frames() {
    return frames;
  },
  get state() {
    return window.UI ? { ...window.UI.state } : null;
  },
  setPaused: (paused) => setPaused("user", paused),
  setElement: (id) => window.UI && window.UI.setState({ selectedElement: id }),
  setSize: (i) => window.UI && window.UI.setState({ size: i }),
  paint: (x, y, size, species) => universe.paint(x, y, size, species),
  count: (species) => {
    const cells = window.__cells();
    let c = 0;
    for (let i = 0; i < cells.length; i += 4) if (cells[i] === species) c++;
    return c;
  },
  reset,
  undo,
};

resize();
// The menu is on screen and clickable: tell 2Web to drop its loading screen.
requestAnimationFrame(() => platform.ready());

export { canvas, width, height, universe, reset, undo };
