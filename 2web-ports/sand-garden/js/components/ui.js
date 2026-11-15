import React from "react";

import * as wasm from "../../crate/pkg/sandtable_bg.wasm";
import { Species } from "../../crate/pkg/sandtable";
const memory = wasm.memory;

import { height, universe, width, reset, undo } from "../index.js";
import { setPaused, pauseState } from "../pause";
import { pallette } from "../render.js";
import { platform } from "../platform";
import { svgToImageData, rgbaToSpecies } from "../convertSVG";
import Info from "./info";

window.species = Species;
window.__cells = () => new Uint8Array(memory.buffer, universe.cells(), width * height * 4);
let pallette_data = pallette();

const WIND = -1;
const speciesNames = Object.keys(Species).filter((x) => !Number.isInteger(Number.parseInt(x)));
// Empty (the eraser) goes last, Wind first.
const elementOrder = [
  WIND,
  ...speciesNames.filter((n) => n !== "Empty").map((n) => Species[n]),
  Species.Empty,
];
const elementName = (id) => (id === WIND ? "Wind" : Species[id]);

const ElementButton = (elementID, selectedElement, setElement) => {
  const name = elementName(elementID);
  let color = elementID === WIND ? "rgba(255,255,255,0.25)" : pallette_data[elementID];
  let selected = elementID == selectedElement;

  let background = "inherit";
  if (elementID == 14) {
    background = `linear-gradient(45deg, 
    rgba(202, 121, 125, 0.25), 
    rgba(169, 120, 200, 0.25), 
    rgba(117, 118, 195, 0.25), 
    rgba(117, 196, 193, 0.25), 
    rgba(122, 203, 168, 0.25), 
    rgba(185, 195, 117, 0.25), 
    rgba(204, 186, 122, 0.25))`;
    if (selected) {
      background = background.replace(/0.25/g, "1.0");
    }
  }
  return (
    <button
      className={selected ? "selected" : ""}
      key={name}
      onClick={() => setElement(elementID)}
      style={{
        background,
        backgroundColor: selected ? color.replace("0.25", "1.5") : color,
      }}
    >
      {name}
    </button>
  );
};

let sizeMap = [1, 3, 7, 19, 39];

class Index extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      infoOpen: false,
      confirmReset: false,
      size: 2,
      selectedElement: Species.Water,
    };
    window.UI = this;
  }

  componentWillUnmount() {
    clearTimeout(this.confirmTimer);
  }

  togglePause() {
    setPaused("user", !pauseState.user);
  }
  play() {
    setPaused("user", false);
  }
  pause() {
    setPaused("user", true);
  }

  setSize(event, size) {
    event.preventDefault();
    this.setState({ size });
  }

  cycleElement(step) {
    const i = elementOrder.indexOf(this.state.selectedElement);
    const next = (i + step + elementOrder.length) % elementOrder.length;
    this.setState({ selectedElement: elementOrder[next] });
  }

  // The 2Web frame blocks confirm(), so Reset asks again in place: the first
  // press arms the button for three seconds, the second one clears the sand.
  async reset() {
    if (!this.state.confirmReset) {
      this.setState({ confirmReset: true });
      clearTimeout(this.confirmTimer);
      this.confirmTimer = setTimeout(() => this.setState({ confirmReset: false }), 3000);
      return;
    }
    clearTimeout(this.confirmTimer);
    this.setState({ confirmReset: false });
    // Clearing the board is the one natural break in a sandbox: 2Web may show
    // an advert here. The answer always arrives, ad or not.
    await platform.ad("interstitial");
    window.stopboot = true;
    this.play();
    reset();
    universe.flush_undos();
  }

  openInfo() {
    setPaused("menu", true);
    this.setState({ infoOpen: true });
  }

  closeInfo() {
    if (!this.state.infoOpen) return;
    setPaused("menu", false);
    this.setState({ infoOpen: false });
  }

  async loadSVG(svgString) {
    const imgData = await svgToImageData(svgString);

    const cellsData = window.__cells();

    reset();
    window.stopboot = true;

    for (let i = 0, len = width * height * 4; i < len; i += 4) {
      const species = rgbaToSpecies(
        imgData.data[i],
        imgData.data[i + 1],
        imgData.data[i + 2],
        imgData.data[i + 3]
      );
      cellsData[i] = species; // should be 0 to 19
      cellsData[i + 1] = Math.floor(100 + Math.random() * 50); // register A
      cellsData[i + 2] = 0; // register B
      cellsData[i + 3] = 0; // clock
    }
    universe.flush_undos();
    universe.push_undo();

    this.pause();
  }

  render() {
    let { size, selectedElement, confirmReset, infoOpen } = this.state;
    const paused = pauseState.user;
    return (
      <React.Fragment>
        <div className="tools">
          <button
            onClick={() => this.togglePause()}
            className={paused ? "selected" : ""}
            aria-label={paused ? "Play" : "Pause"}
          >
            {paused ? (
              <svg viewBox="0 0 300 300">
                <polygon points="0,0 , 300,150 0,300" />
              </svg>
            ) : (
              <svg viewBox="0 0 300 300">
                <polygon points="0,0 110,0 110,300 0,300" />
                <polygon points="190,0 300,0 300,300 190,300" />
              </svg>
            )}
          </button>
          <button onClick={() => undo()} aria-label="Undo" className="undo">
            ↶
          </button>
          <button onClick={() => this.reset()} className={confirmReset ? "warn" : ""}>
            {confirmReset ? "Sure?" : "Reset"}
          </button>
          <button onClick={() => this.openInfo()}>Info</button>
        </div>
        <div className="sizes">
          {sizeMap.map((v, i) => (
            <button
              key={i}
              className={i == size ? "selected" : ""}
              onClick={(e) => this.setSize(e, i)}
              aria-label={`Brush size ${i + 1}`}
            >
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={3 + v} />
              </svg>
            </button>
          ))}
        </div>
        <div className="elements">
          {elementOrder.map((id) =>
            ElementButton(id, selectedElement, (id) => this.setState({ selectedElement: id }))
          )}
        </div>
        {infoOpen && <Info close={() => this.closeInfo()} />}
      </React.Fragment>
    );
  }
}

export { sizeMap, Index };
