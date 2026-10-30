import { test } from "bun:test";
import { MESSY, PARALLEL, TWO, WEATHER } from "./fixtures.test";
import { checkRows } from "./harness";

test("checkOk", () => {
  checkRows([
    {
      args: ["check", "s.txt"],
      files: { "s.txt": WEATHER },
      want: { code: 0, out: "ok: 10 events, 1 choices, 1 tool calls\n", err: "" },
    },
    {
      args: ["check", "s.txt"],
      files: { "s.txt": TWO },
      want: { code: 0, out: "ok: 9 events, 2 choices, 0 tool calls\n", err: "" },
    },
    {
      args: ["check", "s.txt"],
      files: { "s.txt": PARALLEL },
      want: { code: 0, out: "ok: 7 events, 1 choices, 2 tool calls\n", err: "" },
    },
    {
      args: ["check", "-"],
      stdin: MESSY,
      want: { code: 0, out: "ok: 3 events, 1 choices, 0 tool calls\n", err: "" },
    },
    {
      args: ["check", "s.txt"],
      files: { "s.txt": "data: [DONE]\n\n" },
      want: { code: 0, out: "ok: 1 events, 0 choices, 0 tool calls\n", err: "" },
    },
  ]);
});
