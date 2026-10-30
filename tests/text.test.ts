import { test } from "bun:test";
import { MESSY, TWO, WEATHER } from "./fixtures.test";
import { checkRows } from "./harness";

test("textChoices", () => {
  checkRows([
    {
      args: ["text", "s.txt"],
      files: { "s.txt": WEATHER },
      want: { code: 0, out: "Let me check.", err: "" },
    },
    {
      args: ["text", "--choice", "1", "s.txt"],
      files: { "s.txt": TWO },
      want: { code: 0, out: "Bonjour é", err: "" },
    },
    {
      args: ["text", "--choice=0", "s.txt"],
      files: { "s.txt": TWO },
      want: { code: 0, out: "Hello", err: "" },
    },
    {
      args: ["text", "s.txt", "--choice", "1"],
      files: { "s.txt": TWO },
      want: { code: 0, out: "Bonjour é", err: "" },
    },
    {
      args: ["text", "--choice", "007", "s.txt"],
      files: { "s.txt": TWO },
      want: { code: 1, out: "", err: "deltaglue: s.txt: no choice 7\n" },
    },
  ]);
});

test("textAbsentChoice", () => {
  checkRows([
    {
      args: ["text", "--choice", "2", "s.txt"],
      files: { "s.txt": TWO },
      want: { code: 1, out: "", err: "deltaglue: s.txt: no choice 2\n" },
    },
    {
      args: ["text", "s.txt"],
      files: { "s.txt": "data: [DONE]\n\n" },
      want: { code: 1, out: "", err: "deltaglue: s.txt: no choice 0\n" },
    },
  ]);
});

test("textRawBytes", () => {
  checkRows([
    {
      args: ["text", "-"],
      stdin:
        'data: {"choices":[{"index":0,"delta":{"content":"a\\nb"}}]}\n\ndata: {"choices":[{"index":0,"delta":{"content":"\\t\\"\\\\"}}]}\n\ndata: {"choices":[{"index":0,"delta":{"content":"é😀"}}]}\n\ndata: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
      want: { code: 0, out: 'a\nb\t"\\é😀', err: "" },
    },
    {
      args: ["text", "s.txt"],
      files: { "s.txt": MESSY },
      want: { code: 0, out: "a\nb", err: "" },
    },
  ]);
});
