export interface Choice {
  role?: string;
  finishReason?: string;
  content: string;
  calls: Map<number, ToolCall>;
}

export interface ToolCall {
  id?: string;
  name: string;
  arguments: string;
}

export interface Usage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

export interface ChunkState {
  choices: Map<number, Choice>;
  usage: Usage | null;
  problems: string[];
}

const MAX_INDEX = 2147483647;

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isBoundedInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= MAX_INDEX;
}

export function isWellFormedString(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        return false;
      }
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      return false;
    }
  }
  return true;
}

function eventProblem(state: ChunkState, line: number, message: string): void {
  state.problems.push(`line ${line}: ${message}`);
}

function optionalValue(object: Record<string, unknown>, key: string): unknown {
  const value = object[key];
  return value === null ? undefined : value;
}

function readString(
  value: unknown,
  path: string,
  state: ChunkState,
  line: number,
): string | undefined {
  if (typeof value !== "string") {
    eventProblem(state, line, `${path} is not a string`);
    return undefined;
  }
  if (!isWellFormedString(value)) {
    eventProblem(state, line, `lone surrogate in ${path}`);
    return undefined;
  }
  return value;
}

function getChoice(state: ChunkState, index: number): Choice {
  let choice = state.choices.get(index);
  if (choice === undefined) {
    choice = { content: "", calls: new Map<number, ToolCall>() };
    state.choices.set(index, choice);
  }
  return choice;
}

function getCall(choice: Choice, index: number): ToolCall {
  let call = choice.calls.get(index);
  if (call === undefined) {
    call = { name: "", arguments: "" };
    choice.calls.set(index, call);
  }
  return call;
}

function processCall(
  value: unknown,
  choicePosition: number,
  callPosition: number,
  choiceIndex: number,
  choice: Choice,
  state: ChunkState,
  line: number,
): void {
  const path = `choices[${choicePosition}].delta.tool_calls[${callPosition}]`;
  if (!isObject(value)) {
    eventProblem(state, line, `${path} is not an object`);
    return;
  }

  const indexValue = optionalValue(value, "index");
  if (!isBoundedInteger(indexValue)) {
    eventProblem(state, line, `${path}.index is not a whole number from 0 to 2147483647`);
    return;
  }
  const callIndex = indexValue;
  if (choice.finishReason !== undefined) {
    eventProblem(state, line, `tool call after finish_reason in choice ${choiceIndex}`);
    return;
  }

  const call = getCall(choice, callIndex);
  const idValue = optionalValue(value, "id");
  if (idValue !== undefined) {
    const id = readString(idValue, `${path}.id`, state, line);
    if (id !== undefined) {
      if (call.id === undefined) {
        call.id = id;
      } else if (call.id !== id) {
        eventProblem(state, line, `tool call ${callIndex} of choice ${choiceIndex} changes its id`);
      }
    }
  }

  const functionValue = optionalValue(value, "function");
  if (functionValue === undefined) {
    return;
  }
  if (!isObject(functionValue)) {
    eventProblem(state, line, `${path}.function is not an object`);
    return;
  }

  const nameValue = optionalValue(functionValue, "name");
  if (nameValue !== undefined) {
    const name = readString(nameValue, `${path}.function.name`, state, line);
    if (name !== undefined) {
      call.name += name;
    }
  }

  const argumentsValue = optionalValue(functionValue, "arguments");
  if (argumentsValue !== undefined) {
    const argumentsText = readString(argumentsValue, `${path}.function.arguments`, state, line);
    if (argumentsText !== undefined) {
      call.arguments += argumentsText;
    }
  }
}

function processChoice(value: unknown, position: number, state: ChunkState, line: number): void {
  const path = `choices[${position}]`;
  if (!isObject(value)) {
    eventProblem(state, line, `${path} is not an object`);
    return;
  }

  const indexValue = optionalValue(value, "index");
  if (!isBoundedInteger(indexValue)) {
    eventProblem(state, line, `${path}.index is not a whole number from 0 to 2147483647`);
    return;
  }
  const choiceIndex = indexValue;
  const choice = getChoice(state, choiceIndex);

  const deltaValue = optionalValue(value, "delta");
  if (deltaValue !== undefined) {
    if (!isObject(deltaValue)) {
      eventProblem(state, line, `${path}.delta is not an object`);
    } else {
      const roleValue = optionalValue(deltaValue, "role");
      if (roleValue !== undefined) {
        const role = readString(roleValue, `${path}.delta.role`, state, line);
        if (role !== undefined) {
          if (choice.role === undefined) {
            choice.role = role;
          } else if (choice.role !== role) {
            eventProblem(state, line, `choice ${choiceIndex} changes its role`);
          }
        }
      }

      const contentValue = optionalValue(deltaValue, "content");
      if (contentValue !== undefined) {
        const content = readString(contentValue, `${path}.delta.content`, state, line);
        if (content !== undefined) {
          if (choice.finishReason !== undefined) {
            eventProblem(state, line, `content after finish_reason in choice ${choiceIndex}`);
          } else {
            choice.content += content;
          }
        }
      }

      const callsValue = optionalValue(deltaValue, "tool_calls");
      if (callsValue !== undefined) {
        if (!Array.isArray(callsValue)) {
          eventProblem(state, line, `${path}.delta.tool_calls is not an array`);
        } else {
          for (let callPosition = 0; callPosition < callsValue.length; callPosition += 1) {
            processCall(
              callsValue[callPosition],
              position,
              callPosition,
              choiceIndex,
              choice,
              state,
              line,
            );
          }
        }
      }
    }
  }

  const finishValue = optionalValue(value, "finish_reason");
  if (finishValue !== undefined) {
    const finishReason = readString(finishValue, `${path}.finish_reason`, state, line);
    if (finishReason !== undefined) {
      if (choice.finishReason === undefined) {
        choice.finishReason = finishReason;
      } else {
        eventProblem(state, line, `choice ${choiceIndex} gives finish_reason twice`);
      }
    }
  }
}

function processUsage(value: unknown, state: ChunkState, line: number): void {
  if (!isObject(value)) {
    eventProblem(state, line, "usage is not an object");
    return;
  }
  if (state.usage !== null) {
    eventProblem(state, line, "usage given twice");
    return;
  }

  const usage: Usage = {};
  let valid = true;
  for (const key of ["prompt_tokens", "completion_tokens", "total_tokens"] as const) {
    const tokenValue = optionalValue(value, key);
    if (tokenValue === undefined) {
      continue;
    }
    if (!isBoundedInteger(tokenValue)) {
      eventProblem(state, line, `usage.${key} is not a whole number from 0 to 2147483647`);
      valid = false;
    } else {
      usage[key] = tokenValue;
    }
  }
  if (valid) {
    state.usage = usage;
  }
}

export function processChunk(
  chunk: Record<string, unknown>,
  line: number,
  state: ChunkState,
): void {
  const choicesValue = optionalValue(chunk, "choices");
  if (choicesValue !== undefined) {
    if (!Array.isArray(choicesValue)) {
      eventProblem(state, line, "choices is not an array");
    } else {
      for (let position = 0; position < choicesValue.length; position += 1) {
        processChoice(choicesValue[position], position, state, line);
      }
    }
  }

  const usageValue = optionalValue(chunk, "usage");
  if (usageValue !== undefined) {
    processUsage(usageValue, state, line);
  }
}
