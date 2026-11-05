import { expect, test } from "bun:test";
import { MESSY, TWO, WEATHER } from "./fixtures.test";
import { checkRows, exec } from "./harness";

test("quietPrintsNothingForAValidCapture", () => {
  checkRows([
    {
      args: ["check", "--quiet", "s.txt"],
      files: { "s.txt": WEATHER },
      want: { code: 0, out: "", err: "" },
    },
    {
      args: ["check", "s.txt", "--quiet"],
      files: { "s.txt": TWO },
      want: { code: 0, out: "", err: "" },
    },
    {
      args: ["check", "--quiet", "-"],
      stdin: MESSY,
      want: { code: 0, out: "", err: "" },
    },
    {
      args: ["check", "--quiet", "--", "-x"],
      files: { "-x": WEATHER },
      want: { code: 0, out: "", err: "" },
    },
  ]);
});

test("quietKeepsTheProblemReports", () => {
  checkRows([
    {
      args: ["check", "--quiet", "s.txt"],
      files: { "s.txt": "data: {\n\n" },
      want: { code: 1, out: "", err: exec(["check", "s.txt"], { "s.txt": "data: {\n\n" }).err },
    },
    {
      args: ["check", "--quiet", "s.txt"],
      want: { code: 2, out: "", err: "deltaglue: cannot read s.txt\n" },
    },
    {
      args: ["check", "--quiet", "s.txt"],
      files: { "s.txt": new Uint8Array([0xff]) },
      want: { code: 2, out: "", err: "deltaglue: s.txt: input is not valid UTF-8\n" },
    },
  ]);
  expect(exec(["check", "--quiet", "s.txt"], { "s.txt": "data: {\n\n" }).err).not.toBe("");
});

test("quietIsAnOptionOfCheckOnly", () => {
  checkRows([
    {
      args: ["join", "--quiet", "s.txt"],
      files: { "s.txt": WEATHER },
      want: { code: 2, out: "", err: "deltaglue: unknown option --quiet\n" },
    },
    {
      args: ["text", "--quiet", "s.txt"],
      files: { "s.txt": WEATHER },
      want: { code: 2, out: "", err: "deltaglue: unknown option --quiet\n" },
    },
    {
      args: ["check", "--quiet=1", "s.txt"],
      files: { "s.txt": WEATHER },
      want: { code: 2, out: "", err: "deltaglue: unknown option --quiet=1\n" },
    },
    {
      args: ["check", "--quiet", "--quiet", "s.txt"],
      files: { "s.txt": WEATHER },
      want: { code: 2, out: "", err: "deltaglue: option --quiet given twice\n" },
    },
    {
      args: ["check", "--quiet", "--bogus", "s.txt"],
      files: { "s.txt": WEATHER },
      want: { code: 2, out: "", err: "deltaglue: unknown option --bogus\n" },
    },
    {
      args: ["check", "--quiet"],
      want: { code: 2, out: "", err: "deltaglue: missing FILE\n" },
    },
    {
      args: ["check", "--", "--quiet"],
      want: { code: 2, out: "", err: "deltaglue: cannot read --quiet\n" },
    },
  ]);
});

test("withoutQuietCheckStillPrintsItsSummary", () => {
  expect(exec(["check", "s.txt"], { "s.txt": WEATHER })).toEqual({
    code: 0,
    out: "ok: 10 events, 1 choices, 1 tool calls\n",
    err: "",
  });
});
