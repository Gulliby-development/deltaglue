import { test } from "bun:test";
import { checkRows } from "./harness";

test("problemsOrderAndCapB", () => {
  checkRows([
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
          "deltaglue: s.txt: line 19: data is not valid JSON\n",
      },
    },
    {
      args: ["join", "s.txt"],
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
          "deltaglue: s.txt: ... and 1 more problems\n",
      },
    },
  ]);
});
