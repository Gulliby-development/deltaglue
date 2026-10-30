import { test } from "bun:test";
import { checkRows } from "./harness";

test("problemsToolCallsA", () => {
  checkRows([
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt": 'data: {"choices":[{"index":0,"delta":{"tool_calls":{}}}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err:
          "deltaglue: s.txt: line 1: choices[0].delta.tool_calls is not an array\n" +
          "deltaglue: s.txt: choice 0 has no finish_reason\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"tool_calls":[1,null,"x"]}}]}\n\ndata: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err:
          "deltaglue: s.txt: line 1: choices[0].delta.tool_calls[0] is not an object\n" +
          "deltaglue: s.txt: line 1: choices[0].delta.tool_calls[1] is not an object\n" +
          "deltaglue: s.txt: line 1: choices[0].delta.tool_calls[2] is not an object\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"tool_calls":[{"id":"a"},{"index":1.5}]}}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err:
          "deltaglue: s.txt: line 1: choices[0].delta.tool_calls[0].index is not a whole number from 0 to 2147483647\n" +
          "deltaglue: s.txt: line 1: choices[0].delta.tool_calls[1].index is not a whole number from 0 to 2147483647\n" +
          "deltaglue: s.txt: choice 0 has no finish_reason\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":7,"type":"function"}]}}]}\n\ndata: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err:
          "deltaglue: s.txt: line 1: choices[0].delta.tool_calls[0].id is not a string\n" +
          "deltaglue: s.txt: tool call 0 of choice 0 has no id\n" +
          "deltaglue: s.txt: tool call 0 of choice 0 has no name\n" +
          "deltaglue: s.txt: tool call 0 of choice 0 arguments are not a JSON object\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"a","type":"function","function":{"name":"f","arguments":"{}"}}]}}]}\n\ndata: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"b","type":"function"}]}}]}\n\ndata: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
      },
      want: {
        code: 1,
        out: "",
        err: "deltaglue: s.txt: line 3: tool call 0 of choice 0 changes its id\n",
      },
    },
  ]);
});
