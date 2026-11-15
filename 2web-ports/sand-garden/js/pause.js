// The simulation stops while the player has paused it, while the Info page is
// open, OR while 2Web is showing an ad. Resuming from an ad restores whatever
// the player had chosen.
const pauseState = { user: false, platform: false, menu: false };

const setPaused = (who, value) => {
  pauseState[who] = !!value;
  window.paused = pauseState.user || pauseState.platform || pauseState.menu;
  if (window.UI) window.UI.forceUpdate();
};
window.paused = false;

export { pauseState, setPaused };
