import { test } from "bun:test";
import { checkRows } from "./harness";

test("problemsUsage", () => {
  checkRows([
    {
      args: ["check", "s.txt"],
      files: { "s.txt": 'data: {"usage":5}\n\ndata: [DONE]\n\n' },
      want: { code: 1, out: "", err: "deltaglue: s.txt: line 1: usage is not an object\n" },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"usage":{"prompt_tokens":3.5,"total_tokens":-1,"completion_tokens":"2"}}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err:
          "deltaglue: s.txt: line 1: usage.prompt_tokens is not a whole number from 0 to 2147483647\n" +
          "deltaglue: s.txt: line 1: usage.completion_tokens is not a whole number from 0 to 2147483647\n" +
          "deltaglue: s.txt: line 1: usage.total_tokens is not a whole number from 0 to 2147483647\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"usage":{"total_tokens":1}}\n\ndata: {"usage":{"total_tokens":2}}\n\ndata: [DONE]\n\n',
      },
      want: { code: 1, out: "", err: "deltaglue: s.txt: line 3: usage given twice\n" },
    },
    {
      args: ["join", "s.txt"],
      files: {
        "s.txt":
          'data: {"usage":{"total_tokens":true}}\n\ndata: {"usage":{"total_tokens":2}}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: line 1: usage.total_tokens is not a whole number from 0 to 2147483647\n",
      },
    },
    {
      args: ["join", "s.txt"],
      files: {
        "s.txt":
          'data: {"usage":{"prompt_tokens":2147483647,"completion_tokens":0.0,"total_tokens":100.0}}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 0,
        out: "usage prompt_tokens 2147483647 completion_tokens 0 total_tokens 100\n",
        err: "",
      },
    },
    {
      args: ["check", "s.txt"],
      files: { "s.txt": 'data: {"usage":{}}\n\ndata: {"usage":{}}\n\ndata: [DONE]\n\n' },
      want: { code: 1, out: "", err: "deltaglue: s.txt: line 3: usage given twice\n" },
    },
  ]);
});

// Duplicate tail from an interrupted edit was removed.
