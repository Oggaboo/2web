// The 2Web SDK, or stand-ins that do nothing when the game is opened on its
// own (porting rule 3: "must still work without 2Web").
const sdk = typeof window !== "undefined" && window.TwoWeb ? window.TwoWeb : null;

const call = (name, fallback, ...args) => {
  try {
    if (sdk && typeof sdk[name] === "function") return sdk[name](...args);
  } catch (e) {
    console.warn("2Web SDK call failed:", name, e);
  }
  return fallback;
};

export const platform = {
  ready: () => call("ready"),
  onPause: (fn) => call("onPause", undefined, fn),
  score: (points) => call("score", undefined, points),
  // Always resolves, with rewarded === false when no ad was shown.
  ad: async (kind) => {
    try {
      const result = await call("ad", null, kind);
      return { rewarded: !!(result && result.rewarded === true) };
    } catch (e) {
      return { rewarded: false };
    }
  },
};
