import { Species } from "../crate/pkg";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Opening scene: a strip of sand with a row of seeds dropped onto it.
async function boot(width, height) {
  for (let x = 5; x <= width - 5; x += 10) {
    if (window.stopboot) return;
    window.u.paint(
      x,
      Math.floor(height - 40 + 5 * Math.sin(x / 20)),
      Math.random() * 6 + 10,
      Species.Sand
    );
    await sleep(16);
  }
  for (let x = 40; x <= width - 40; x += 50 + Math.random() * 10) {
    if (window.stopboot) return;
    window.u.paint(
      x,
      Math.floor(height / 2 + 20 * Math.sin(x / 20)),
      6,
      Species.Seed
    );
    await sleep(180);
  }
}

export { sleep, boot };
