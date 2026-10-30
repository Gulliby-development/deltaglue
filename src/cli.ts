// src/cli.ts
import { assemble } from "./assemble";
import { checkReport, joinReport, missingChoiceReport, problemsReport, textReport } from "./report";

export const USAGE =
  "usage: deltaglue join FILE\n       deltaglue text [--choice N] FILE\n       deltaglue check FILE\n";
export interface Io {
  readFile(name: string): Uint8Array | null; // null when the file cannot be read
  readStdin(): Uint8Array;
  out(text: string): void;
  err(text: string): void;
}

function fail(io: Io, message: string): number {
  try {
    io.err(`deltaglue: ${message}\n`);
  } catch {
    // A broken output sink cannot be reported to itself.
  }
  return 2;
}

export function run(args: string[], io: Io): number {
  try {
    const command = args[0];
    if (command === undefined) {
      return fail(io, "missing command");
    }
    if (command === "--help") {
      io.out(USAGE);
      return 0;
    }
    if (command === "--version") {
      io.out("deltaglue 0.1.0\n");
      return 0;
    }
    if (command !== "join" && command !== "text" && command !== "check") {
      return fail(io, `unknown command ${command}`);
    }

    let choiceIndex = 0;
    let hasChoice = false;
    let optionsEnded = false;
    const files: string[] = [];
    for (let index = 1; index < args.length; index += 1) {
      const argument = args[index] as string;
      if (!optionsEnded && argument === "--") {
        optionsEnded = true;
        continue;
      }
      if (!optionsEnded && argument.startsWith("-") && argument !== "-") {
        if (command !== "text" || (argument !== "--choice" && !argument.startsWith("--choice="))) {
          return fail(io, `unknown option ${argument}`);
        }
        let value: string;
        if (argument === "--choice") {
          const next = args[index + 1];
          if (next === undefined) {
            return fail(io, "option --choice needs a value");
          }
          if (hasChoice) {
            return fail(io, "option --choice given twice");
          }
          index += 1;
          value = next;
        } else {
          if (hasChoice) {
            return fail(io, "option --choice given twice");
          }
          value = argument.slice("--choice=".length);
        }
        if (!/^[0-9]{1,3}$/.test(value)) {
          return fail(io, `option --choice needs a whole number of 1 to 3 digits, got ${value}`);
        }
        hasChoice = true;
        choiceIndex = Number(value);
        continue;
      }
      files.push(argument);
    }

    if (files.length === 0) {
      return fail(io, "missing FILE");
    }
    if (files.length > 1) {
      return fail(io, "too many arguments");
    }

    const file = files[0] as string;
    const displayFile = file === "-" ? "<stdin>" : file;
    let bytes: Uint8Array | null;
    try {
      bytes = file === "-" ? io.readStdin() : io.readFile(file);
    } catch {
      return fail(io, `cannot read ${displayFile}`);
    }
    if (bytes === null) {
      return fail(io, `cannot read ${displayFile}`);
    }

    let input: string;
    try {
      input = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
    } catch {
      return fail(io, `${displayFile}: input is not valid UTF-8`);
    }

    const result = assemble(input);
    if (result.problems.length > 0) {
      io.err(problemsReport(displayFile, result.problems));
      return 1;
    }
    if (command === "join") {
      io.out(joinReport(result));
      return 0;
    }
    if (command === "check") {
      io.out(checkReport(result));
      return 0;
    }
    const report = textReport(result, choiceIndex);
    if (report === null) {
      io.err(missingChoiceReport(displayFile, choiceIndex));
      return 1;
    }
    io.out(report);
    return 0;
  } catch {
    return 2;
  }
}
