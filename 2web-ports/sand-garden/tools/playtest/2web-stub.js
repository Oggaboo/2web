// TEST STAND-IN for the real 2Web SDK (which is not in this repo). Implements the
// four documented calls and records what the game does with them.
(function () {
  const log = (window.__tw = { ready: 0, scores: [], ads: [], pauseCalls: [], cbs: [] });
  const setPaused = (p) => { log.pauseCalls.push(p); log.cbs.forEach((f) => f(p)); };
  window.TwoWeb = {
    ready() { log.ready++; },
    onPause(fn) { log.cbs.push(fn); },
    score(n) { log.scores.push(n); },
    ad(kind) {
      log.ads.push(kind);
      return new Promise((res) => {
        const o = document.createElement("div");
        o.id = "fake-ad";
        o.style.cssText = "position:fixed;inset:0;background:#000c;color:#fff;z-index:99;display:flex;align-items:center;justify-content:center;font:20px sans-serif";
        o.textContent = "TEST AD (" + kind + ")";
        document.body.appendChild(o);
        setPaused(true);
        setTimeout(() => { o.remove(); setPaused(false); res({ rewarded: kind === "rewarded" }); }, 1500);
      });
    },
  };
})();
