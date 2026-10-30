import { test } from "bun:test";
import { checkRows } from "./harness";

test("problemsToolCallsC", () => {
  checkRows([
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"a","type":"function","function":{"arguments":"{}"}}]}}]}\n\ndata: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: tool call 0 of choice 0 has no name\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"a","type":"function","function":{"name":"","arguments":"{}"}}]}}]}\n\ndata: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: tool call 0 of choice 0 has no name\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"a","type":"function","function":{"name":"f","arguments":"{\\"a\\":"}}]}}]}\n\ndata: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: tool call 0 of choice 0 arguments are not a JSON object\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"a","type":"function","function":{"name":"f"}}]}}]}\n\ndata: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: tool call 0 of choice 0 arguments are not a JSON object\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"a","type":"function","function":{"name":"f","arguments":"[]"}}]}}]}\n\ndata: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: tool call 0 of choice 0 arguments are not a JSON object\n",
      },
    },
  ]);
});
