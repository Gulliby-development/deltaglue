import { test } from "bun:test";
import { checkRows } from "./harness";

test("joinSmallStreams", () => {
  checkRows([
    {
      args: ["join", "s.txt"],
      files: { "s.txt": "data: [DONE]\n\n" },
      want: { code: 0, out: "", err: "" },
    },
    {
      args: ["join", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"content":"x"}}]}\n\ndata: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
      },
      want: { code: 0, out: 'choice 0\n  finish "stop"\n  content "x"\n', err: "" },
    },
    {
      args: ["join", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":100.0,"delta":{"content":"z"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
      },
      want: { code: 0, out: 'choice 100\n  finish "stop"\n  content "z"\n', err: "" },
    },
    {
      args: ["join", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0.0,"delta":{"content":"w é😀\\"\\\\\\u0001/"},"finish_reason":"length"}],"usage":{}}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 0,
        out: 'choice 0\n  finish "length"\n  content "w é😀\\"\\\\\\u0001/"\n',
        err: "",
      },
    },
    {
      args: ["join", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"x","type":"function","function":{"name":"f","arguments":"{}"}}]}}]}\n\ndata: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"x","type":"function","function":{"name":"n","arguments":" "}}]}}]}\n\ndata: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 0,
        out: 'choice 0\n  finish "stop"\n  content ""\n  call 0\n    id "x"\n    name "fn"\n    arguments "{} "\n',
        err: "",
      },
    },
    {
      args: ["join", "s.txt"],
      files: {
        "s.txt": 'data: {"usage":{"prompt_tokens":1,"total_tokens":3}}\n\ndata: [DONE]\n\n',
      },
      want: { code: 0, out: "usage prompt_tokens 1 total_tokens 3\n", err: "" },
    },
    {
      args: ["join", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":null,"finish_reason":"stop"}],"usage":null}\n\ndata: [DONE]\n\n',
      },
      want: { code: 0, out: 'choice 0\n  finish "stop"\n  content ""\n', err: "" },
    },
  ]);
});
