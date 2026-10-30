import { test } from "bun:test";
import { TWO, WEATHER } from "./fixtures.test";
import { checkRows } from "./harness";

test("optionsChoice", () => {
  checkRows([
    {
      args: ["text", "--choice", "s.txt"],
      files: { "s.txt": WEATHER },
      want: {
        code: 2,
        out: "",
        err: "deltaglue: option --choice needs a whole number of 1 to 3 digits, got s.txt\n",
      },
    },
    {
      args: ["text", "--choice"],
      files: { "s.txt": WEATHER },
      want: { code: 2, out: "", err: "deltaglue: option --choice needs a value\n" },
    },
    {
      args: ["text", "--choice", "x", "s.txt"],
      files: { "s.txt": WEATHER },
      want: {
        code: 2,
        out: "",
        err: "deltaglue: option --choice needs a whole number of 1 to 3 digits, got x\n",
      },
    },
    {
      args: ["text", "--choice", "1000", "s.txt"],
      files: { "s.txt": WEATHER },
      want: {
        code: 2,
        out: "",
        err: "deltaglue: option --choice needs a whole number of 1 to 3 digits, got 1000\n",
      },
    },
    {
      args: ["text", "--choice=", "s.txt"],
      files: { "s.txt": WEATHER },
      want: {
        code: 2,
        out: "",
        err: "deltaglue: option --choice needs a whole number of 1 to 3 digits, got \n",
      },
    },
    {
      args: ["text", "--choice", "1", "--choice", "2", "s.txt"],
      files: { "s.txt": WEATHER },
      want: { code: 2, out: "", err: "deltaglue: option --choice given twice\n" },
    },
    {
      args: ["text", "--choice", "1", "--choice", "x", "s.txt"],
      files: { "s.txt": WEATHER },
      want: { code: 2, out: "", err: "deltaglue: option --choice given twice\n" },
    },
    {
      args: ["text", "--choice=-1", "s.txt"],
      files: { "s.txt": WEATHER },
      want: {
        code: 2,
        out: "",
        err: "deltaglue: option --choice needs a whole number of 1 to 3 digits, got -1\n",
      },
    },
    {
      args: ["text", "--choice", "1.5", "s.txt"],
      files: { "s.txt": WEATHER },
      want: {
        code: 2,
        out: "",
        err: "deltaglue: option --choice needs a whole number of 1 to 3 digits, got 1.5\n",
      },
    },
    {
      args: ["text", "--choice", "000", "s.txt"],
      files: { "s.txt": TWO },
      want: { code: 0, out: "Hello", err: "" },
    },
    {
      args: ["text", "--choice", "999", "s.txt"],
      files: { "s.txt": TWO },
      want: { code: 1, out: "", err: "deltaglue: s.txt: no choice 999\n" },
    },
    {
      args: ["text", "--choice", "٣", "s.txt"],
      files: { "s.txt": WEATHER },
      want: {
        code: 2,
        out: "",
        err: "deltaglue: option --choice needs a whole number of 1 to 3 digits, got ٣\n",
      },
    },
  ]);
});
