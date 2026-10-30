import { test } from "bun:test";
import { MESSY, PARALLEL, TWO, WEATHER } from "./fixtures.test";
import { checkRows } from "./harness";

test("joinToolCallInFragments", () => {
  checkRows([
    {
      args: ["join", "s.txt"],
      files: { "s.txt": WEATHER },
      want: {
        code: 0,
        out: 'choice 0\n  role "assistant"\n  finish "tool_calls"\n  content "Let me check."\n  call 0\n    id "call_1"\n    name "get_weather"\n    arguments "{\\"city\\":\\"Paris\\"}"\nusage prompt_tokens 12 completion_tokens 20 total_tokens 32\n',
        err: "",
      },
    },
  ]);
});

test("joinTwoChoices", () => {
  checkRows([
    {
      args: ["join", "s.txt"],
      files: { "s.txt": TWO },
      want: {
        code: 0,
        out: 'choice 0\n  role "assistant"\n  finish "stop"\n  content "Hello"\nchoice 1\n  role "assistant"\n  finish "stop"\n  content "Bonjour \u00e9"\n',
        err: "",
      },
    },
  ]);
});

test("joinParallelToolCalls", () => {
  checkRows([
    {
      args: ["join", "s.txt"],
      files: { "s.txt": PARALLEL },
      want: {
        code: 0,
        out: 'choice 0\n  role "assistant"\n  finish "tool_calls"\n  content ""\n  call 0\n    id "a"\n    name "search"\n    arguments "{\\"q\\":\\"x\\"}"\n  call 1\n    id "b"\n    name "read"\n    arguments "{}"\nusage total_tokens 7\n',
        err: "",
      },
    },
  ]);
});

test("joinFramingQuirks", () => {
  checkRows([
    {
      args: ["join", "s.txt"],
      files: { "s.txt": MESSY },
      want: {
        code: 0,
        out: 'choice 0\n  finish "stop"\n  content "a\\nb"\n',
        err: "",
      },
    },
    {
      args: ["join", "-"],
      stdin: MESSY,
      want: {
        code: 0,
        out: 'choice 0\n  finish "stop"\n  content "a\\nb"\n',
        err: "",
      },
    },
  ]);
});
