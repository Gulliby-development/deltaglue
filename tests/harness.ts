import { expect } from "bun:test";
import { type Io, run } from "../src/cli";

export type Value = string | Uint8Array;

export interface Row {
  args: string[];
  files?: Record<string, Value>;
  stdin?: Value;
  want: { code: number; out: string; err: string };
}

/** The bytes of a literal whose characters are all U+0000 to U+00FF: one byte per character. */
export function bytes(latin1: string): Uint8Array {
  return Uint8Array.from(latin1, (character) => character.charCodeAt(0));
}

/** Runs one command line against in-memory files and standard input. */
export function exec(
  args: string[],
  files: Record<string, Value> = {},
  stdin: Value = "",
): { code: number; out: string; err: string } {
  const encoder = new TextEncoder();
  const data = (value: Value): Uint8Array =>
    typeof value === "string" ? encoder.encode(value) : value;
  let out = "";
  let err = "";
  const io: Io = {
    readFile: (name) => (Object.hasOwn(files, name) ? data(files[name] as Value) : null),
    readStdin: () => data(stdin),
    out: (text) => {
      out += text;
    },
    err: (text) => {
      err += text;
    },
  };
  const code = run(args, io);
  return { code, out, err };
}

export function checkRows(rows: Row[]): void {
  for (const row of rows) {
    expect({ args: row.args, ...exec(row.args, row.files, row.stdin) }).toEqual({
      args: row.args,
      ...row.want,
    });
  }
}
