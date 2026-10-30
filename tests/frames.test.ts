import { expect, test } from "bun:test";
import { readFrames } from "../src/frames";

test("framesReadFrames", () => {
  const rows = [
    { input: "", want: { events: [], open: null } },
    { input: "data: a\n\n", want: { events: [{ line: 1, data: "a" }], open: null } },
    { input: "data: a\n", want: { events: [], open: 1 } },
    {
      input: "data: a\n\ndata: b\n\n",
      want: {
        events: [
          { line: 1, data: "a" },
          { line: 3, data: "b" },
        ],
        open: null,
      },
    },
    {
      input: "data:a\ndata: b\ndata:  c\n\n",
      want: { events: [{ line: 1, data: "a\nb\n c" }], open: null },
    },
    { input: "data\n\n", want: { events: [{ line: 1, data: "" }], open: null } },
    { input: "data:\n\n", want: { events: [{ line: 1, data: "" }], open: null } },
    { input: ": x\ndata: y\n: z\n\n", want: { events: [{ line: 2, data: "y" }], open: null } },
    {
      input: "event: e\nid: 1\nretry: 5\ndata: d\n\n",
      want: { events: [{ line: 4, data: "d" }], open: null },
    },
    { input: "Data: x\n data: y\ndata : z\n\n", want: { events: [], open: null } },
    { input: "\ufeffdata: a\n\n", want: { events: [{ line: 1, data: "a" }], open: null } },
    { input: "\ufeff\ufeffdata: a\n\n", want: { events: [], open: null } },
    {
      input: "data: a\r\n\r\ndata: b\r\rdata: c\n\r\n",
      want: {
        events: [
          { line: 1, data: "a" },
          { line: 3, data: "b" },
          { line: 5, data: "c" },
        ],
        open: null,
      },
    },
    {
      input: "\n\n\ndata: a\n\n\n\ndata: b\n\n",
      want: {
        events: [
          { line: 4, data: "a" },
          { line: 8, data: "b" },
        ],
        open: null,
      },
    },
    {
      input: "x\ndata: a\r\n\ndata: b\ndata: c",
      want: { events: [{ line: 2, data: "a" }], open: 4 },
    },
    {
      input: "data: caf\u00e9 \ud83d\ude00\n\n",
      want: { events: [{ line: 1, data: "caf\u00e9 \ud83d\ude00" }], open: null },
    },
    {
      input: "data: a\n \n\ndata: b\n\n",
      want: {
        events: [
          { line: 1, data: "a" },
          { line: 4, data: "b" },
        ],
        open: null,
      },
    },
    {
      input: "data: a\n\n\r\ndata: b\n\n",
      want: {
        events: [
          { line: 1, data: "a" },
          { line: 4, data: "b" },
        ],
        open: null,
      },
    },
  ];

  for (const { input, want } of rows) {
    expect(readFrames(input)).toEqual(want);
  }
});
