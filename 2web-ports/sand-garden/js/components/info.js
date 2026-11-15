import React from "react";
import { VERSION, TITLE } from "../constants";

const elements = [
  ["Wind", "Blows everything around. Drag to make a gust."],
  ["Wall", "Indestructible."],
  ["Sand", "Sinks in water."],
  ["Water", "Puts out fire."],
  ["Stone", "Forms arches, turns into sand under pressure."],
  ["Ice", "Freezes water, slippery!"],
  ["Gas", "Highly flammable!"],
  ["Cloner", "Copies the first element it touches."],
  ["Mite", "Eats wood and plant, but loves dust! Slides on ice."],
  ["Wood", "Sturdy, but biodegradable."],
  ["Plant", "Thrives in wet environments."],
  ["Fungus", "Spreads over everything."],
  ["Seed", "Grows on sand, plant and fungus."],
  ["Fire", "Hot!"],
  ["Lava", "Flammable and heavy."],
  ["Acid", "Corrodes other elements."],
  ["Dust", "Pretty, but dangerously explosive."],
  ["Oil", "Produces smoke when set on fire."],
  ["Rocket", "Explodes into copies of the first element it touches."],
  ["Empty", "Erases."],
];

const Info = ({ close }) => (
  <div className="menu-scrim" onClick={close}>
    <div className="menu" onClick={(e) => e.stopPropagation()}>
      <button className="x" onClick={close} aria-label="Close">
        x
      </button>
      <h1>{TITLE}</h1>
      <p>
        Pick an element, then draw with it. Watch what it does to the others.
        There is no score and no way to lose.
      </p>
      <h2>Controls</h2>
      <p>
        <b>Mouse / touch:</b> drag on the sand to draw. Tap the buttons to
        change element and brush size.
      </p>
      <p>
        <b>Keyboard:</b> Space pause, Z undo, 1 to 5 brush size, [ and ] previous
        / next element, Esc closes this page.
      </p>
      <h2>Elements</h2>
      <dl>
        {elements.map(([name, text]) => (
          <React.Fragment key={name}>
            <dt>{name}</dt>
            <dd>{text}</dd>
          </React.Fragment>
        ))}
      </dl>
      <h2>Credits</h2>
      <p className="small">
        {TITLE} v{VERSION}. Built from Sandspiel, copyright (c) 2018 Max
        Bittker, used under the MIT licence (see LICENSE.txt in the game
        folder). Online sharing, accounts, adverts and tracking were removed
        for this build.
      </p>
    </div>
  </div>
);

export default Info;
