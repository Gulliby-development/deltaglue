import { test } from "bun:test";
import { checkRows } from "./harness";

test("problemsSurrogates", () => {
  checkRows([
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"content":"\\ud800"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: line 1: lone surrogate in choices[0].delta.content\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"content":"a\\udc00b"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: line 1: lone surrogate in choices[0].delta.content\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"content":"\\ud83d"}},{"index":0,"delta":{"content":"\\ude00"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err:
          "deltaglue: s.txt: line 1: lone surrogate in choices[0].delta.content\n" +
          "deltaglue: s.txt: line 1: lone surrogate in choices[1].delta.content\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"role":"\\ude00"},"finish_reason":"\\ud800"}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err:
          "deltaglue: s.txt: line 1: lone surrogate in choices[0].delta.role\n" +
          "deltaglue: s.txt: line 1: lone surrogate in choices[0].finish_reason\n" +
          "deltaglue: s.txt: choice 0 has no finish_reason\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"\\ud800","function":{"name":"\\udc00","arguments":"\\ud800"}}]},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err:
          "deltaglue: s.txt: line 1: lone surrogate in choices[0].delta.tool_calls[0].id\n" +
          "deltaglue: s.txt: line 1: lone surrogate in choices[0].delta.tool_calls[0].function.name\n" +
          "deltaglue: s.txt: line 1: lone surrogate in choices[0].delta.tool_calls[0].function.arguments\n" +
          "deltaglue: s.txt: tool call 0 of choice 0 has no id\n" +
          "deltaglue: s.txt: tool call 0 of choice 0 has no name\n" +
          "deltaglue: s.txt: tool call 0 of choice 0 arguments are not a JSON object\n",
      },
    },
    {
      args: ["text", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"content":"\\ud83d\\ude00"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
      },
      want: { code: 0, out: "\ud83d\ude00", err: "" },
    },
  ]);
});
