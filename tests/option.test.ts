import { test } from "bun:test";
import { checkRows } from "./harness";

test("optionsHelpAndVersion", () => {
  checkRows([
    {
      args: [],
      want: { code: 2, out: "", err: "deltaglue: missing command\n" },
    },
    {
      args: ["--help"],
      want: {
        code: 0,
        out: "usage: deltaglue join FILE\n       deltaglue text [--choice N] FILE\n       deltaglue check FILE\n",
        err: "",
      },
    },
    {
      args: ["--version"],
      want: { code: 0, out: "deltaglue 0.1.0\n", err: "" },
    },
    {
      args: ["--help", "x", "y"],
      want: {
        code: 0,
        out: "usage: deltaglue join FILE\n       deltaglue text [--choice N] FILE\n       deltaglue check FILE\n",
        err: "",
      },
    },
    {
      args: ["--version", "--bogus"],
      want: { code: 0, out: "deltaglue 0.1.0\n", err: "" },
    },
    {
      args: ["join", "--help"],
      want: { code: 2, out: "", err: "deltaglue: unknown option --help\n" },
    },
    {
      args: ["-h"],
      want: { code: 2, out: "", err: "deltaglue: unknown command -h\n" },
    },
  ]);
});

test("optionsCommands", () => {
  checkRows([
    {
      args: ["bogus"],
      want: { code: 2, out: "", err: "deltaglue: unknown command bogus\n" },
    },
    {
      args: ["", "s.txt"],
      want: { code: 2, out: "", err: "deltaglue: unknown command \n" },
    },
    {
      args: ["JOIN", "s.txt"],
      want: { code: 2, out: "", err: "deltaglue: unknown command JOIN\n" },
    },
    {
      args: ["s.txt"],
      want: { code: 2, out: "", err: "deltaglue: unknown command s.txt\n" },
    },
    {
      args: ["join"],
      want: { code: 2, out: "", err: "deltaglue: missing FILE\n" },
    },
    {
      args: ["join", "a", "b"],
      want: { code: 2, out: "", err: "deltaglue: too many arguments\n" },
    },
    {
      args: ["check", "--", "--", "x"],
      want: { code: 2, out: "", err: "deltaglue: too many arguments\n" },
    },
  ]);
});
