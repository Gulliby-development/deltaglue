import { test } from "bun:test";
import { checkRows } from "./harness";

test("problemsToolCallsB", () => {
  checkRows([
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":5}]}}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err:
          "deltaglue: s.txt: line 1: choices[0].delta.tool_calls[0].function is not an object\n" +
          "deltaglue: s.txt: choice 0 has no finish_reason\n" +
          "deltaglue: s.txt: tool call 0 of choice 0 has no id\n" +
          "deltaglue: s.txt: tool call 0 of choice 0 has no name\n" +
          "deltaglue: s.txt: tool call 0 of choice 0 arguments are not a JSON object\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"a","type":"function","function":{"name":1,"arguments":2}}]}}]}\n\ndata: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err:
          "deltaglue: s.txt: line 1: choices[0].delta.tool_calls[0].function.name is not a string\n" +
          "deltaglue: s.txt: line 1: choices[0].delta.tool_calls[0].function.arguments is not a string\n" +
          "deltaglue: s.txt: tool call 0 of choice 0 has no name\n" +
          "deltaglue: s.txt: tool call 0 of choice 0 arguments are not a JSON object\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\ndata: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"a","type":"function","function":{"name":"f","arguments":"{}"}}]}}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: line 3: tool call after finish_reason in choice 0\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"{}"}}]}}]}\n\ndata: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err:
          "deltaglue: s.txt: tool call 0 of choice 0 has no id\n" +
          "deltaglue: s.txt: tool call 0 of choice 0 has no name\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"","type":"function","function":{"name":"f","arguments":"{}"}}]}}]}\n\ndata: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: tool call 0 of choice 0 has no id\n",
      },
    },
  ]);
});
