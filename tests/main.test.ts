import { expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const main = fileURLToPath(new URL("../src/main.ts", import.meta.url));

function program(stdin: Uint8Array, ...args: string[]) {
  const result = Bun.spawnSync([process.execPath, main, ...args], {
    stdin,
    stdout: "pipe",
    stderr: "pipe",
  });
  return { code: result.exitCode, out: result.stdout.toString(), err: result.stderr.toString() };
}

test("programReadsRealFilesAndWritesLfOnly", () => {
  const dir = mkdtempSync(join(tmpdir(), "deltaglue-"));
  try {
    const path = join(dir, "s.txt");
    const stream =
      'data: {"choices":[{"index":0,"delta":{"content":"a\\r\\nb"},"finish_reason":"stop"}]}\r\n\r\ndata: [DONE]\r\n\r\n';
    writeFileSync(path, stream);
    const joined = program(new Uint8Array(0), "join", path);
    expect(joined).toEqual({
      code: 0,
      out: 'choice 0\n  finish "stop"\n  content "a\\r\\nb"\n',
      err: "",
    });
    const missing = program(new Uint8Array(0), "check", `${path}.missing`);
    expect(missing).toEqual({ code: 2, out: "", err: `deltaglue: cannot read ${path}.missing\n` });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("programReadsStandardInputAsBytes", () => {
  const bad = program(Uint8Array.from([100, 97, 116, 97, 58, 32, 0xff, 10, 10]), "check", "-");
  expect(bad).toEqual({ code: 2, out: "", err: "deltaglue: <stdin>: input is not valid UTF-8\n" });
  const text = Buffer.from(
    'data: {"choices":[{"index":0,"delta":{"content":"\u00e9\\n"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
  );
  const good = program(text, "text", "-");
  expect(good).toEqual({ code: 0, out: "\u00e9\n", err: "" });
  const none = program(new Uint8Array(0));
  expect(none.code).toBe(2);
  expect(none.err).toBe("deltaglue: missing command\n");
});
