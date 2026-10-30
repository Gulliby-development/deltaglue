import { test } from "bun:test";
import { checkRows } from "./harness";

test("problemsChoicesB", () => {
  checkRows([
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"role":5}}]}\n\ndata: {"choices":[{"index":0,"delta":{"role":"a"}}]}\n\ndata: {"choices":[{"index":0,"delta":{"role":"b"}}]}\n\ndata: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err:
          "deltaglue: s.txt: line 1: choices[0].delta.role is not a string\n" +
          "deltaglue: s.txt: line 5: choice 0 changes its role\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"content":5}}]}\n\ndata: {"choices":[{"index":0,"delta":{"content":"ok"}}]}\n\ndata: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\n',
      },
      want: {
        code: 1,
        out: "",
        err:
          "deltaglue: s.txt: line 1: choices[0].delta.content is not a string\n" +
          "deltaglue: s.txt: stream ended without [DONE]\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\ndata: {"choices":[{"index":0,"delta":{"content":"late"}}]}\n\ndata: {"choices":[{"index":0,"delta":{},"finish_reason":"length"}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err:
          "deltaglue: s.txt: line 3: content after finish_reason in choice 0\n" +
          "deltaglue: s.txt: line 5: choice 0 gives finish_reason twice\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt": 'data: {"choices":[{"index":0,"finish_reason":7}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err:
          "deltaglue: s.txt: line 1: choices[0].finish_reason is not a string\n" +
          "deltaglue: s.txt: choice 0 has no finish_reason\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt": 'data: {"choices":[{"index":0}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: choice 0 has no finish_reason\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":3,"delta":{}},{"index":1,"delta":{}},{"index":2,"finish_reason":"x"}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err:
          "deltaglue: s.txt: choice 1 has no finish_reason\n" +
          "deltaglue: s.txt: choice 3 has no finish_reason\n",
      },
    },
  ]);
});
