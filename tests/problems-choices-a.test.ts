import { test } from "bun:test";
import { checkRows } from "./harness";

test("problemsChoicesA", () => {
  checkRows([
    {
      args: ["check", "s.txt"],
      files: { "s.txt": 'data: {"choices":{}}\n\ndata: [DONE]\n\n' },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: line 1: choices is not an array\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: { "s.txt": 'data: {"choices":[5]}\n\ndata: [DONE]\n\n' },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: line 1: choices[0] is not an object\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: { "s.txt": 'data: {"choices":[{"delta":{}}]}\n\ndata: [DONE]\n\n' },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: line 1: choices[0].index is not a whole number from 0 to 2147483647\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: { "s.txt": 'data: {"choices":[{"index":1.5}]}\n\ndata: [DONE]\n\n' },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: line 1: choices[0].index is not a whole number from 0 to 2147483647\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":-1},{"index":"0"},{"index":2147483648}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err:
          "deltaglue: s.txt: line 1: choices[0].index is not a whole number from 0 to 2147483647\n" +
          "deltaglue: s.txt: line 1: choices[1].index is not a whole number from 0 to 2147483647\n" +
          "deltaglue: s.txt: line 1: choices[2].index is not a whole number from 0 to 2147483647\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt": 'data: {"choices":[{"index":true,"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: line 1: choices[0].index is not a whole number from 0 to 2147483647\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt": 'data: {"choices":[{"index":0,"delta":[]}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err:
          "deltaglue: s.txt: line 1: choices[0].delta is not an object\n" +
          "deltaglue: s.txt: choice 0 has no finish_reason\n",
      },
    },
  ]);
});
