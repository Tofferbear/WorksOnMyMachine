"use strict";

import clear from 'rollup-plugin-clear';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import screeps from 'rollup-plugin-screeps';

let cfg;
const dest = process.env.DEST;
if (!dest) {
  console.log("No destination specified - code will be compiled but not uploaded");
} else if (dest !== "local" && (cfg = require("./screeps.json")[dest]) == null) {
  throw new Error("Invalid upload destination");
}

let localFolder = require("./screeps.json").local?.localPath;
if (dest === "local" && !localFolder) {
  throw new Error("Missing 'localPath' in screeps.json for local destination");
}
export default {
  input: "./src/main.ts",
  output: {
    file: "dist/main.js",
    format: "cjs",
    sourcemap: true
  },

  plugins: [
    clear({ targets: ["dist"] }),
    resolve({ rootDir: "src" }),
    commonjs(),
    typescript({tsconfig: "./tsconfig.json"}),
    dest !== "local" ? screeps({config: cfg, dryRun: cfg == null}) : null,
    dest === "local" && {
      name: 'copy-local',
      writeBundle() {
         const fs = require('fs');
         const path = require('path');
         if (!fs.existsSync(localFolder)) fs.mkdirSync(localFolder, { recursive: true });
         fs.copyFileSync("dist/main.js", path.join(localFolder, "main.js"));
         fs.copyFileSync("dist/main.js.map", path.join(localFolder, "main.js.map"));
         console.log(`Successfully copied compiled code to ${localFolder}`);
      }
    }
  ].filter(Boolean)
}
