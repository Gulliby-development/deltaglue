import { test } from "bun:test";
import { checkRows } from "./harness";

test("problemsFraming", () => {
  checkRows([
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"content":"x"}}]}\n\ndata: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\n',
      },
      want: { code: 1, out: "", err: "deltaglue: s.txt: stream ended without [DONE]\n" },
    },
    {
      args: ["check", "s.txt"],
      files: { "s.txt": "data: {\n\ndata: [DONE]\n\n" },
      want: { code: 1, out: "", err: "deltaglue: s.txt: line 1: data is not valid JSON\n" },
    },
    {
      args: ["check", "s.txt"],
      files: { "s.txt": "data: [1]\n\ndata: [DONE]\n\n" },
      want: { code: 1, out: "", err: "deltaglue: s.txt: line 1: data is not a JSON object\n" },
    },
    {
      args: ["check", "s.txt"],
      files: { "s.txt": "data: null\n\ndata: [DONE]\n\n" },
      want: { code: 1, out: "", err: "deltaglue: s.txt: line 1: data is not a JSON object\n" },
    },
    {
      args: ["check", "s.txt"],
      files: { "s.txt": "data: NaN\n\ndata: [DONE]\n\n" },
      want: { code: 1, out: "", err: "deltaglue: s.txt: line 1: data is not valid JSON\n" },
    },
    {
      args: ["check", "s.txt"],
      files: { "s.txt": "data: [DONE]\n\ndata: [DONE]\n\ndata: {}\n\n" },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: line 3: event after [DONE]\ndeltaglue: s.txt: line 5: event after [DONE]\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: { "s.txt": 'data: [DONE]\n\ndata: {"choices":[]}' },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: line 3: stream ends inside an event\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"content":"x"}}]}\n\ndata: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\ndata: {"x":1}\n',
      },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: line 7: stream ends inside an event\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: { "s.txt": "\ufeff\ufeffdata: [DONE]\n\n" },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: stream ended without [DONE]\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: { "s.txt": "data\n\ndata: [DONE]\n\n" },
      want: { code: 1, out: "", err: "deltaglue: s.txt: line 1: data is not valid JSON\n" },
    },
    {
      args: ["check", "s.txt"],
      files: { "s.txt": "data: {} \n\ndata:[DONE]\n\n" },
      want: { code: 0, out: "ok: 2 events, 0 choices, 0 tool calls\n", err: "" },
    },
    {
      args: ["check", "s.txt"],
      files: { "s.txt": "data: [DONE] \n\n" },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: line 1: data is not valid JSON\ndeltaglue: s.txt: stream ended without [DONE]\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: { "s.txt": "" },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: stream ended without [DONE]\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: { "s.txt": "data: [DONE]" },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: line 1: stream ends inside an event\ndeltaglue: s.txt: stream ended without [DONE]\n",
      },
    },
  ]);
});
