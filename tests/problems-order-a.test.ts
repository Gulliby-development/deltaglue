import { test } from "bun:test";
import { checkRows } from "./harness";

test("problemsOrderAndCapA", () => {
  checkRows([
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt": "data: x\n\ndata: [DONE]\n\ndata: y\n\ndata: z",
      },
      want: {
        code: 1,
        out: "",
        err:
          "deltaglue: s.txt: line 1: data is not valid JSON\n" +
          "deltaglue: s.txt: line 5: event after [DONE]\n" +
          "deltaglue: s.txt: line 7: stream ends inside an event\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          'data: {"choices":[{"index":1,"delta":{"content":1}}]}\n' +
          '\ndata: {"choices":[{"index":0,"delta":{"role":1}}]}\n' +
          '\ndata: {"choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"a","type":"function","function":{"arguments":"x"}}]}}]}\n' +
          '\ndata: {"choices":[{"index":1,"delta":{"tool_calls":[{"index":0,"function":{"name":"f"}}]}}]}\n' +
          "\ndata: {",
      },
      want: {
        code: 1,
        out: "",
        err:
          "deltaglue: s.txt: line 1: choices[0].delta.content is not a string\n" +
          "deltaglue: s.txt: line 3: choices[0].delta.role is not a string\n" +
          "deltaglue: s.txt: line 9: stream ends inside an event\n" +
          "deltaglue: s.txt: stream ended without [DONE]\n" +
          "deltaglue: s.txt: choice 0 has no finish_reason\n" +
          "deltaglue: s.txt: choice 1 has no finish_reason\n" +
          "deltaglue: s.txt: tool call 0 of choice 0 has no name\n" +
          "deltaglue: s.txt: tool call 0 of choice 0 arguments are not a JSON object\n" +
          "deltaglue: s.txt: tool call 0 of choice 1 has no id\n" +
          "deltaglue: s.txt: tool call 0 of choice 1 arguments are not a JSON object\n",
      },
    },
    {
      args: ["check", "s.txt"],
      files: {
        "s.txt":
          "data: bad0\n\n" +
          "data: bad1\n\n" +
          "data: bad2\n\n" +
          "data: bad3\n\n" +
          "data: bad4\n\n" +
          "data: bad5\n\n" +
          "data: bad6\n\n" +
          "data: bad7\n\n" +
          "data: bad8\n\n" +
          "data: bad9\n\n" +
          "data: bad10\n\n" +
          "data: bad11\n\n" +
          "data: [DONE]\n\n",
      },
      want: {
        code: 1,
        out: "",
        err:
          "deltaglue: s.txt: line 1: data is not valid JSON\n" +
          "deltaglue: s.txt: line 3: data is not valid JSON\n" +
          "deltaglue: s.txt: line 5: data is not valid JSON\n" +
          "deltaglue: s.txt: line 7: data is not valid JSON\n" +
          "deltaglue: s.txt: line 9: data is not valid JSON\n" +
          "deltaglue: s.txt: line 11: data is not valid JSON\n" +
          "deltaglue: s.txt: line 13: data is not valid JSON\n" +
          "deltaglue: s.txt: line 15: data is not valid JSON\n" +
          "deltaglue: s.txt: line 17: data is not valid JSON\n" +
          "deltaglue: s.txt: line 19: data is not valid JSON\n" +
          "deltaglue: s.txt: ... and 2 more problems\n",
      },
    },
  ]);
});
