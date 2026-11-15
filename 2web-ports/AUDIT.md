# 2Web porting audit of this repository

Checked 2026-11-15 against the porting rules ("Putting a game on 2Web: the rules", rewritten
2026-11-15). Scope: the 50 game folders that are actually in this repository. `zones.json` lists
855 games, but the other 805 are only links to files hosted elsewhere, so there is nothing here
to check or package for them.

## Result

- **0 of 50 folders pass as they are.** None is a 2Web submission: no folder has `2web.json`,
  `thumb.webp`, `cover.jpg`, the 2Web SDK line or a slug-named folder (sections 1, 3, 6, 7).
- **1 game could be brought into line and has been:** sandspiel (folder `317`), rebuilt from its
  MIT-licensed source as **Sand Garden**. The zip is [`sand-garden-1.0.0.zip`](sand-garden-1.0.0.zip),
  the source of the port is in [`sand-garden/`](sand-garden/).
- **49 folders cannot be made compliant by editing them**, for one or more of these reasons:
  - **They are copies of other studios' games with no licence to modify or republish them.** The
    rules assume the developer sends the build. Swapping the developer's ad SDK for 2Web's in
    someone else's commercial game is not something a code change makes acceptable, and most of
    these also fail 5.2 (other people's names, characters and look). This covers 40 folders.
  - **They are not games** (two emulators, an unlisted emulator page, loose assets) or are bare
    Flash files that no browser runs: 9 folders.
  - **Their content is outside Everyone / 12+** (guns used on people, gore, horror): 7 folders,
    all of which are also in the first group.

The only other open-licensed folder is `702` (MIT), and it is a console emulator, not a game.

## Licence checks on the other candidates (2026-11-15)

The list is not open source as a whole: most entries are commercial games. These are the folders
that looked as if they might be open, and what their own licence terms say.

| Folder | Game | Finding |
|---|---|---|
| 309 | Sandboxels | Source is public, but under the "R74n Content License": all rights reserved, no advertising or other commercial use without permission, and its credits and links may not be removed. Rules 2.5 and 5.5 need exactly those removed, so it cannot be ported |
| 260 | RE:RUN | Source is public (a game-jam repository) with no licence file, which means no permission to republish or modify |
| 330, 311, 442, 197 | BitPlanes, Sandtris, Infinimoes, Elastic Man | No licence in the folder and no open-source repository found for the game |
| 308, 203 | Nazi Zombies: Portable, DOOM | Open-source engines, but the content is outside Everyone / 12+ and the names and look belong to other games; their licences were not checked further |
| 702, 113 | JavascriptPS1, Ruffle | Open source, but emulators rather than games |

Replacing the pictures or changing the theme of a game does not change who owns its code, so a
reskin of a commercial game is still that studio's game.

## Folder by folder

"Mechanical failures" were measured by script (file layout, sizes, hosts named in the HTML).
The last column is the reason the folder cannot simply be fixed. Every row also fails sections
1, 3, 6 and 7 as described above.

| Folder | Name in zones.json | Author | Size / files | Mechanical failures | Why it can't be ported |
|---|---|---|---|---|---|
| 113 | Ruffle | Mike Welsh | 14 MB / 12 | loads from cdn.jsdelivr.net (2.2, 2.3) | Not a game: Flash emulator (rule 2.1) |
| 116 | Offroad Mountain Bike | RHM Interactive OÜ | 61 MB / 10 | 61 MB total (2.4); 56 MB file (2.4); loads from cdn.jsdelivr.net (2.2, 2.3) | Commercial or unlicensed copy; no licence in folder |
| 117 | Space Waves | do.games | 11 MB / 9 | loads from assets.msn.com, cdn.jsdelivr.net (2.2, 2.3) | Commercial or unlicensed copy; no licence in folder |
| 118 | Solar Smash | Paradyme Games | 94 MB / 8 | 94 MB total (2.4); 87 MB file (2.4); loads from cdn.jsdelivr.net (2.2, 2.3) | Commercial or unlicensed copy; no licence in folder |
| 120 | Fortzone Battle Royale | Mirra Games | 67 MB / 18 | 67 MB total (2.4); 28 MB file (2.4); loads from rawcdn.githack.com (2.2, 2.3) | Shooter with guns used on people (5.1) |
| 121 | Brawl Guys.io | Lagged | 14 MB / 82 | loads from rawcdn.githack.com, www.apple.com, www.google.com… (2.2, 2.3) | Built for Lagged's SDK; no licence in folder |
| 122 | Survival Race | Brain Massage | 37 MB / 6 | 27 MB file (2.4); loads from rawcdn.githack.com (2.2, 2.3) | Commercial or unlicensed copy; no licence in folder |
| 123 | Poly Track | Kodub | 9 MB / 83 | loads from cdn.jsdelivr.net (2.2, 2.3) | Commercial or unlicensed copy; no licence in folder |
| 124 | Moto X3M Pool Party | MadPuffers | 9 MB / 89 | none found | Commercial or unlicensed copy; no licence in folder |
| 129 | Flappy Bird | Dong Nguyen | 37 MB / 6 | loads from cdn.jsdelivr.net (2.2, 2.3) | Commercial or unlicensed copy; no licence in folder |
| 165 | Cheese Chompers 3D | NavaNoid | 95 MB / 12 | 95 MB total (2.4); 88 MB file (2.4); loads from rawcdn.githack.com (2.2, 2.3) | Commercial or unlicensed copy; no licence in folder |
| 174 | World Box | Kendja | 0 MB / 1 | no index.html (1) | Bare Flash file, cannot run in a browser (2.1) |
| 175 | Run 1 | Joseph Cloutier | 2 MB / 1 | no index.html (1) | Bare Flash file (2.1) |
| 176 | Run 2 | Joseph Cloutier | 1 MB / 1 | no index.html (1) | Bare Flash file (2.1) |
| 178 | Swords and Souls | Armor Games | 9 MB / 1 | no index.html (1) | Bare Flash file (2.1) |
| 184 | (unlisted) | ? | 47 MB / 887 | no index.html (1); 887 files (2.4) | Not in the game list; loose assets, no index.html |
| 186 | Ragdoll Archers | Ericetto | 8 MB / 7 | no index.html (1) | Commercial or unlicensed copy; no licence in folder |
| 187 | Papers, Please | Lucas Pope | 0 MB / 1 | no index.html (1) | Bare Flash file (2.1); mature themes |
| 197 | Elastic Man | David Li | 1 MB / 4 | no index.html (1) | Commercial or unlicensed copy; no licence in folder |
| 198 | Slope | coweggs | 34 MB / 14 | loads from cdn.jsdelivr.net (2.2, 2.3) | Commercial or unlicensed copy; no licence in folder |
| 199 | Time Shooter 1 | g80g | 22 MB / 8 | loads from cdn.jsdelivr.net (2.2, 2.3) | Guns used on people (5.1) |
| 200 | Time Shooter 2 | g80g | 10 MB / 8 | loads from cdn.jsdelivr.net (2.2, 2.3) | Guns used on people (5.1) |
| 203 | DOOM | Id Software | 8 MB / 8 | no index.html (1); loads from cdn.jsdelivr.net (2.2, 2.3) | Gore and realistic violence (5.1) |
| 255 | Crazy Chicken 3D | Teasle | 83 MB / 14 | 83 MB total (2.4); loads from cdn.jsdelivr.net (2.2, 2.3) | Commercial or unlicensed copy; no licence in folder |
| 256 | Crazy Kitty 3D | Teasle | 119 MB / 15 | 119 MB total (2.4); 44 MB file (2.4); loads from cdn.jsdelivr.net (2.2, 2.3) | Commercial or unlicensed copy; no licence in folder |
| 258 | A Bite at Freddy's | Garrett McKay | 351 MB / 24 | 351 MB total (2.4) | Horror, and built on another game's characters (5.1, 5.2) |
| 260 | RE:RUN | DaniDev | 20 MB / 7 | loads from cdn.jsdelivr.net (2.2, 2.3) | Commercial or unlicensed copy; no licence in folder |
| 286 | Endoparasitic | Deep Root Interactive | 148 MB / 14 | no index.html (1); 148 MB total (2.4); loads from cdn.jsdelivr.net (2.2, 2.3) | Horror and gore (5.1) |
| 294 | Idle Dice | Lutz Schönfelder | 7 MB / 33 | loads from cdn.jsdelivr.net (2.2, 2.3) | Commercial or unlicensed copy; no licence in folder |
| 296 | (unlisted) | ? | 3 MB / 7 | loads from github.com, purei.org (2.2, 2.3) | Not in the game list; console emulator page (2.1) |
| 302 | Little Runmo | juhosprite, gooseworx | 130 MB / 12 | 130 MB total (2.4); loads from cdn.jsdelivr.net, static.itch.io (2.2, 2.3) | Fan game of an animation (5.2) |
| 306 | Shipo.io | OnRush Studio | 12 MB / 228 | loads from cdn.jsdelivr.net (2.2, 2.3) | .io game built for Poki's SDK |
| 307 | Rainbow Obby | emolingo games | 95 MB / 1685 | 95 MB total (2.4); 1685 files (2.4); loads from cdn.jsdelivr.net (2.2, 2.3) | Looks styled on another platform's games; needs a by-eye check (5.2). Built for Poki's SDK |
| 308 | Nazi Zombies: Portable | nzp team | 58 MB / 7 | 58 MB total (2.4); 52 MB file (2.4); loads from hits.sh, rawcdn.githack.com (2.2, 2.3) | Gore, zombies, guns (5.1) |
| 309 | Sandboxels | R74N | 1 MB / 4 | loads from cash.app, cdn.jsdelivr.net, discord.gg… (2.2, 2.3) | Marked "All Rights Reserved"; many outbound links, donation links (2.5, 5.4) |
| 310 | Dreadhead Parkour | GameTornado | 11 MB / 133 | loads from cdn.jsdelivr.net (2.2, 2.3) | Commercial or unlicensed copy; no licence in folder |
| 311 | Sandtris | FRANCO MIRANDA | 1 MB / 7 | loads from cdn.jsdelivr.net, cdnjs.cloudflare.com, francomiranda.com… (2.2, 2.3) | Loads Google ads and CDN scripts (2.3) |
| 315 | Jelly Mario | Schteppe | 6 MB / 93 | loads from cdn.jsdelivr.net, www.googletagmanager.com (2.2, 2.3) | Another game's character and name (5.2) |
| 317 | sandspiel | maxbittker | 1 MB / 13 | loads from fonts.googleapis.com (2.2, 2.3) | MIT licensed. This copy has online uploads, sign-in, analytics, Google font (2.3, 5.3, 5.4). **Rebuilt as Sand Garden** |
| 318 | Side Effects | hi rohun, Mr.Pootsley, Jaybooty | 291 MB / 25 | 291 MB total (2.4); loads from cdn.jsdelivr.net (2.2, 2.3) | Commercial or unlicensed copy; no licence in folder |
| 330 | BitPlanes | Anton Medvedev | 1 MB / 22 | loads from cdn.jsdelivr.net, discord.gg, fonts.googleapis.com… (2.2, 2.3) | Discord link, Google font (2.3, 2.5); no licence in folder |
| 346 | Sort the Court | graebor | 15 MB / 12 | loads from cdn.jsdelivr.net (2.2, 2.3) | Commercial or unlicensed copy; no licence in folder |
| 347 | SpiderDoll | Ysopprod | 44 MB / 12 | loads from cdn.jsdelivr.net (2.2, 2.3) | Commercial or unlicensed copy; no licence in folder |
| 351 | Happy Sheepies | Berker Games | 31 MB / 9 | no index.html (1); loads from cdn.jsdelivr.net, mrdoob.github.io, pagead2.googlesyndication.com (2.2, 2.3) | Commercial or unlicensed copy; no licence in folder |
| 352 | DON'T YOU LECTURE ME | GD Colon | 32 MB / 437 | loads from ajax.googleapis.com, cdnjs.cloudflare.com, gdcolon.com… (2.2, 2.3) | Meme soundboard rather than a game (5.2 memes); links out to social sites (2.5) |
| 434 | God's Flesh | Glompyy | 44 MB / 230 | loads from cdn.jsdelivr.net (2.2, 2.3) | Commercial or unlicensed copy; no licence in folder. Content not reviewed |
| 441 | Kitty Toy | Rakqoi | 21 MB / 6 | loads from cdn.jsdelivr.net (2.2, 2.3) | Commercial or unlicensed copy; no licence in folder |
| 442 | Infinimoes | Werxzy | 2 MB / 2 | none found | PICO-8 cart; no licence in folder |
| 447 | Nijika's Ahoge | TamaniDamani | 5 MB / 46 | loads from cdn.jsdelivr.net (2.2, 2.3) | Fan game on an anime character (5.2) |
| 702 | JavascriptPS1 | Alex Ashnov | 0 MB / 28 | none found | Not a game: console emulator, needs a BIOS and disc images the site cannot supply (2.1, 5.2). MIT licensed |

Content notes are from the titles and what is in the folders; games marked "content not
reviewed" were not played.

## Sand Garden: how it meets each rule

| Rule | How |
|---|---|
| 1 | Zip unpacks to `sand-garden/` only, with `index.html`, `2web.json`, `thumb.webp`, `cover.jpg`. 12 files |
| 2.1, 2.2 | Static build, all paths relative |
| 2.3 | Removed: Google ads, Google Analytics, Simple Analytics, Sentry, Firebase, the Google web font, the service worker. The playtest saw zero requests leave the site |
| 2.4 | 0.51 MB in total, largest file 0.24 MB |
| 2.5 | `confirm()` on Reset replaced by a press-twice button; `alert()` calls, the leave-page prompt and every outbound link removed |
| 2.6 | Stores nothing: no localStorage, IndexedDB or cookies |
| 2.7 | No console errors from load through a full session at four sizes |
| 2.8, 2.9 | Logs `Sand Garden v1.0.0`; exposes `window.__game` |
| 3 | SDK line before the game script. `ready()` once the buttons are up; `onPause` freezes the simulation and restores the player's own pause afterwards; one interstitial request, when the player confirms Reset; nothing happens if the SDK is absent. The game has no sound, so there is nothing to mute |
| 4.1 | New layout that refits on every resize; checked at 600x338, 760x428, 900x506, 1100x619, 1366x768, 390x844, 375x812 and 812x375. On phones everything stays 40 px in from each edge |
| 4.2 | Mouse, touch and keyboard (Space, Z, 1 to 5, [ and ], Esc) |
| 4.3 to 4.5 | No sound, no full-screen button, nothing to type |
| 5.1 | Everyone: a sandbox of sand, water, plants, fire and lava; no characters |
| 5.2 | Renamed from sandspiel so the listing does not carry another game's name; credit and the MIT licence text are kept in the Info page and `LICENSE.txt`, as the licence requires |
| 5.3, 5.4 | Upload, browse, voting, sign-in and reporting removed with their backend calls; nothing leaves the device |
| 5.5 | Upstream's AdSense slot removed; the only advert is through `TwoWeb.ad()` |
| 6, 7 | `2web.json` filled to the table; thumb 512x512 (20 KB), cover 1280x720 (108 KB), both made from in-game captures |

`npm run build` in `sand-garden/` compiles the Rust simulation, bundles the game, runs
`tools/package.mjs` (which refuses to write the zip if a mechanical rule fails) and writes the zip.
`npm run playtest` runs the 47 browser checks.

## Not verified

- **The real 2Web SDK and site are not in this repository**, so section 8 step 2 and section 9
  steps 3 to 5 (`npm run check`, the catalog, a `provider: 'test'` ad, the live site) were not
  run. The playtest used a stand-in SDK written from the four calls in section 3
  (`sand-garden/tools/playtest/2web-stub.js`).
- **Real phones.** Phone checks used an emulated iPhone in Chromium with software rendering.
- **Console when opened alone.** With no 2Web around it the browser logs one 404 for
  `../../sdk/2web.js`. Section 3 requires that exact line and section 8.1 asks for no console
  errors, so the two rules disagree here; the game itself logs nothing.
