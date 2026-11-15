// Checks dist/<slug>/ against the mechanical parts of the 2Web porting rules
// (sections 1, 2, 3, 6, 7) and, if they all hold, writes <slug>-<version>.zip.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const listing = JSON.parse(fs.readFileSync(path.join(root, "2web.json"), "utf8"));
const { slug, version } = listing;
const dir = path.join(root, "dist", slug);
const fails = [];
const must = (rule, cond, msg) => cond || fails.push(`${rule}: ${msg}`);

const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    e.isDirectory() ? walk(p) : files.push(p);
  }
};
walk(dir);
const rel = (p) => path.relative(dir, p);
const size = (p) => fs.statSync(p).size;

// 1. layout
must("1", /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug), "bad slug");
for (const f of ["index.html", "2web.json", "thumb.webp", "cover.jpg"])
  must("1", fs.existsSync(path.join(dir, f)), `missing ${f}`);
must("1", !files.some((f) => /\.map$|node_modules|__MACOSX|\.DS_Store/.test(f)), "source maps or junk in build");

// 2.4 sizes
const total = files.reduce((s, f) => s + size(f), 0);
must("2.4", files.every((f) => size(f) <= 25e6), "a file is over 25 MB");
must("2.4", total <= 50e6 && files.length <= 500, "over 50 MB or 500 files");

// 2.2 / 2.3 / 2.5 / 2.6: scan our text files
const html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
const refs = [...html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)].map((m) => m[1]);
must("2.2", refs.every((r) => !r.startsWith("/") && !/^[a-z]+:/i.test(r)), `absolute path in index.html: ${refs}`);
must("3", html.includes('<script src="../../sdk/2web.js"></script>'), "SDK script line missing");
must("3", html.indexOf("../../sdk/2web.js") < html.indexOf("game.js"), "SDK must load before the game");
// URLs that only appear inside library comments and error text; nothing is fetched from them.
const allowedUrl = /^https?:\/\/(www\.w3\.org\/|reactjs\.org\/docs\/error-decoder|fb\.me\/|github\.com\/regl-project|github\.com\/ashima\/webgl-noise|get\.webgl\.org|www\.npmjs\.com\/package\/glsl-read-float)/;
for (const f of files.filter((f) => /\.(js|css|html)$/.test(f))) {
  const text = fs.readFileSync(f, "utf8");
  const urls = [...text.matchAll(/https?:\/\/[^\s"'`)\\<>]+/g)].map((m) => m[0]).filter((u) => !allowedUrl.test(u));
  must("2.3", urls.length === 0, `${rel(f)} mentions ${[...new Set(urls)].join(", ")}`);
  for (const [rule, re] of [
    ["2.3", /googlesyndication|google-analytics|googletagmanager|gtag\(|firebase|sentry|simpleanalytics|serviceWorker/],
    ["2.5", /window\.open\(|\b(alert|confirm|prompt)\(|onbeforeunload|<a\s|<form/],
    ["2.6", /localStorage|sessionStorage|indexedDB|document\.cookie/],
  ])
    must(rule, !re.test(text), `${rel(f)} matches ${re}`);
}

// 6. listing
const cats = "action puzzle racing sports casual arcade two-player idle strategy adventure simulation board dress-up io".split(" ");
const built = JSON.parse(fs.readFileSync(path.join(dir, "2web.json"), "utf8"));
must("6", JSON.stringify(Object.keys(built)) === JSON.stringify(["slug", "title", "version", "description", "controls", "categories", "tags", "rating", "ratingNote"]), "fields");
must("6", !/free|online|20\d\d|\bhd\b/i.test(built.title) && !/\p{Extended_Pictographic}/u.test(built.title), "title");
must("6", built.description.length >= 80 && built.description.length <= 300, `description is ${built.description.length} chars`);
must("6", built.categories.length >= 1 && built.categories.length <= 3 && built.categories.every((c) => cats.includes(c)), "categories");
must("6", built.tags.length >= 3 && built.tags.length <= 6 && built.tags.every((t) => /^[a-z0-9-]+$/.test(t)), "tags");
must("6", ["everyone", "12"].includes(built.rating) && (built.rating !== "12" || built.ratingNote), "rating");
must("6", html.includes(`<title>${built.title}</title>`), "page title differs from listing");
must("6", fs.readFileSync(path.join(root, "js/constants.js"), "utf8").includes(`"${version}"`), "version differs from js/constants.js");

// 7. pictures: read the pixel size from the file headers
const webp = fs.readFileSync(path.join(dir, "thumb.webp"));
const jpg = fs.readFileSync(path.join(dir, "cover.jpg"));
let tw = 0, th = 0;
const kind = webp.toString("ascii", 12, 16);
if (kind === "VP8 ") { tw = webp.readUInt16LE(26) & 0x3fff; th = webp.readUInt16LE(28) & 0x3fff; }
else if (kind === "VP8L") { const b = webp.readUInt32LE(21); tw = (b & 0x3fff) + 1; th = ((b >> 14) & 0x3fff) + 1; }
else if (kind === "VP8X") { tw = webp.readUIntLE(24, 3) + 1; th = webp.readUIntLE(27, 3) + 1; }
must("7", tw === 512 && th === 512 && webp.length < 150e3, `thumb is ${tw}x${th}, ${webp.length} bytes`);
let cw = 0, ch = 0;
for (let i = 2; i < jpg.length; ) {
  const marker = jpg[i + 1], len = jpg.readUInt16BE(i + 2);
  if (marker >= 0xc0 && marker <= 0xc3) { ch = jpg.readUInt16BE(i + 5); cw = jpg.readUInt16BE(i + 7); break; }
  i += 2 + len;
}
must("7", cw === 1280 && ch === 720 && jpg.length < 300e3, `cover is ${cw}x${ch}, ${jpg.length} bytes`);

if (fails.length) {
  console.error("NOT PACKAGED:\n  " + fails.join("\n  "));
  process.exit(1);
}
const zip = path.join(root, "..", `${slug}-${version}.zip`);
fs.rmSync(zip, { force: true });
execFileSync("zip", ["-r", "-X", "-q", zip, slug], { cwd: path.join(root, "dist") });
console.log(`ok: ${files.length} files, ${(total / 1e6).toFixed(2)} MB -> ${path.relative(root, zip)} (${(size(zip) / 1e6).toFixed(2)} MB)`);
