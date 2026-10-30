#!/usr/bin/env bun
import { readFileSync } from "node:fs";
import { run } from "./cli";

const out: string[] = [];
const code = run(process.argv.slice(2), {
  readFile: (name) => {
    try {
      return readFileSync(name);
    } catch {
      return null;
    }
  },
  readStdin: () => {
    try {
      return readFileSync(0);
    } catch {
      return new Uint8Array(0);
    }
  },
  out: (text) => {
    out.push(text);
  },
  err: (text) => {
    process.stderr.write(text);
  },
});
process.stdout.write(out.join(""), () => process.exit(code));
