import { type Choice, type ChunkState, isObject, processChunk, type Usage } from "./chunks";
import { readFrames } from "./frames";

export interface AssemblyResult {
  events: number;
  choices: Map<number, Choice>;
  usage: Usage | null;
  problems: string[];
}

export type { Choice, ToolCall, Usage } from "./chunks";

function sortedEntries<T>(entries: Map<number, T>): [number, T][] {
  return [...entries.entries()].sort(([left], [right]) => left - right);
}

function hasObjectArguments(text: string): boolean {
  try {
    return isObject(JSON.parse(text) as unknown);
  } catch {
    return false;
  }
}

export function assemble(input: string): AssemblyResult {
  const frames = readFrames(input);
  const state: ChunkState = {
    choices: new Map<number, Choice>(),
    usage: null,
    problems: [],
  };
  let events = 0;
  let done = false;

  for (const frame of frames.events) {
    events += 1;
    if (done) {
      state.problems.push(`line ${frame.line}: event after [DONE]`);
      continue;
    }
    if (frame.data === "[DONE]") {
      done = true;
      continue;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(frame.data) as unknown;
    } catch {
      state.problems.push(`line ${frame.line}: data is not valid JSON`);
      continue;
    }

    if (!isObject(parsed)) {
      state.problems.push(`line ${frame.line}: data is not a JSON object`);
      continue;
    }

    processChunk(parsed, frame.line, state);
  }

  if (frames.open !== null) {
    state.problems.push(`line ${frames.open}: stream ends inside an event`);
  }
  if (!done) {
    state.problems.push("stream ended without [DONE]");
  }

  const choices = sortedEntries(state.choices);
  for (const [choiceIndex, choice] of choices) {
    if (choice.finishReason === undefined) {
      state.problems.push(`choice ${choiceIndex} has no finish_reason`);
    }
  }

  for (const [choiceIndex, choice] of choices) {
    for (const [callIndex, call] of sortedEntries(choice.calls)) {
      if (call.id === undefined || call.id === "") {
        state.problems.push(`tool call ${callIndex} of choice ${choiceIndex} has no id`);
      }
      if (call.name === "") {
        state.problems.push(`tool call ${callIndex} of choice ${choiceIndex} has no name`);
      }
      if (!hasObjectArguments(call.arguments)) {
        state.problems.push(
          `tool call ${callIndex} of choice ${choiceIndex} arguments are not a JSON object`,
        );
      }
    }
  }

  return {
    events,
    choices: state.choices,
    usage: state.usage,
    problems: state.problems,
  };
}
