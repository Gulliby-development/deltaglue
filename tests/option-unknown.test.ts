import { test } from "bun:test";
import { TWO, WEATHER } from "./fixtures.test";
import { checkRows } from "./harness";

test("optionsUnknown", () => {
  checkRows([
    {
      args: ["join", "--choice", "1", "s.txt"],
      files: { "s.txt": WEATHER },
      want: { code: 2, out: "", err: "deltaglue: unknown option --choice\n" },
    },
    {
      args: ["check", "--choice=1", "s.txt"],
      files: { "s.txt": WEATHER },
      want: { code: 2, out: "", err: "deltaglue: unknown option --choice=1\n" },
    },
    {
      args: ["join", "-x", "s.txt"],
      files: { "s.txt": WEATHER },
      want: { code: 2, out: "", err: "deltaglue: unknown option -x\n" },
    },
    {
      args: ["join", "--bogus"],
      files: { "s.txt": WEATHER },
      want: { code: 2, out: "", err: "deltaglue: unknown option --bogus\n" },
    },
    {
      args: ["join", "s.txt", "--"],
      files: { "s.txt": WEATHER },
      want: {
        code: 0,
        out: 'choice 0\n  role "assistant"\n  finish "tool_calls"\n  content "Let me check."\n  call 0\n    id "call_1"\n    name "get_weather"\n    arguments "{\\"city\\":\\"Paris\\"}"\nusage prompt_tokens 12 completion_tokens 20 total_tokens 32\n',
        err: "",
      },
    },
    {
      args: ["join", "--", "s.txt"],
      files: { "s.txt": WEATHER },
      want: {
        code: 0,
        out: 'choice 0\n  role "assistant"\n  finish "tool_calls"\n  content "Let me check."\n  call 0\n    id "call_1"\n    name "get_weather"\n    arguments "{\\"city\\":\\"Paris\\"}"\nusage prompt_tokens 12 completion_tokens 20 total_tokens 32\n',
        err: "",
      },
    },
    {
      args: ["join", "--", "-x"],
      files: { "-x": TWO },
      want: {
        code: 0,
        out: 'choice 0\n  role "assistant"\n  finish "stop"\n  content "Hello"\nchoice 1\n  role "assistant"\n  finish "stop"\n  content "Bonjour é"\n',
        err: "",
      },
    },
    {
      args: ["text", "--", "--choice"],
      files: { "--choice": TWO },
      want: { code: 0, out: "Hello", err: "" },
    },
    {
      args: ["join", "---", "s.txt"],
      files: { "s.txt": WEATHER },
      want: { code: 2, out: "", err: "deltaglue: unknown option ---\n" },
    },
    {
      args: ["join", "--", "-"],
      stdin: TWO,
      want: {
        code: 0,
        out: 'choice 0\n  role "assistant"\n  finish "stop"\n  content "Hello"\nchoice 1\n  role "assistant"\n  finish "stop"\n  content "Bonjour é"\n',
        err: "",
      },
    },
    {
      args: ["text", "s.txt", "--", "extra"],
      files: { "s.txt": WEATHER },
      want: { code: 2, out: "", err: "deltaglue: too many arguments\n" },
    },
  ]);
});
