import { test } from "bun:test";
import { bytes, checkRows } from "./harness";

test("inputBadFiles", () => {
  checkRows([
    {
      args: ["join", "missing.txt"],
      want: {
        code: 2,
        out: "",
        err: "deltaglue: cannot read missing.txt\n",
      },
    },
    {
      args: ["check", "-"],
      stdin: bytes("data: \u00ff\n\n"),
      want: {
        code: 2,
        out: "",
        err: "deltaglue: <stdin>: input is not valid UTF-8\n",
      },
    },
    {
      args: ["join", "s.txt"],
      files: { "s.txt": bytes("data: [DONE]\n\n\u00c3") },
      want: {
        code: 2,
        out: "",
        err: "deltaglue: s.txt: input is not valid UTF-8\n",
      },
    },
    {
      args: ["text", "s.txt"],
      files: { "s.txt": bytes("\u00ed\u00a0\u0080") },
      want: {
        code: 2,
        out: "",
        err: "deltaglue: s.txt: input is not valid UTF-8\n",
      },
    },
    {
      args: ["join", "s.txt"],
      files: { "s.txt": bytes("\u00ef\u00bb\u00bfdata: [DONE]\n\n") },
      want: { code: 0, out: "", err: "" },
    },
  ]);
});

test("inputLineNumbers", () => {
  checkRows([
    {
      args: ["check", "s.txt"],
      files: { "s.txt": "\r\n\r\ndata: {\r\n\r\n\rdata: [DONE]\r\r" },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: line 3: data is not valid JSON\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt": ": a\r: b\ndata: x\r\n\r\ndata: y\n\ndata: [DONE]\n\n",
      },
      want: {
        code: 1,
        out: "",
        err:
          "deltaglue: s.txt: line 3: data is not valid JSON\n" +
          "deltaglue: s.txt: line 5: data is not valid JSON\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt": "data: {\ndata: }\n\ndata: [DONE]\n\n",
      },
      want: { code: 0, out: "ok: 2 events, 0 choices, 0 tool calls\n", err: "" },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt": "data: [1,\ndata:  2]\n\ndata: [DONE]\n\n",
      },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: line 1: data is not a JSON object\n",
      },
    },
  ]);
});
