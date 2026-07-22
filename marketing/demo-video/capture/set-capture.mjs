/**
 * Merge a single key into src/captures.json so Remotion picks up a freshly
 * captured clip. Used by the `capture:terminal` script after VHS runs.
 *
 *   node capture/set-capture.mjs terminal terminal.mp4
 *   node capture/set-capture.mjs terminal            # clears it (back to null)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.resolve(__dirname, "../src/captures.json");

const [, , key, file] = process.argv;
if (!key) {
  console.error("usage: node capture/set-capture.mjs <key> [filename]");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest[key] = file ? `captures/${file}` : null;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`captures.json: ${key} = ${manifest[key]}`);
