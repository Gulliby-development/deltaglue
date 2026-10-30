import type { AssemblyResult } from "./assemble";

const USAGE_FIELDS = ["prompt_tokens", "completion_tokens", "total_tokens"] as const;

function quoted(value: string): string {
  return JSON.stringify(value);
}

export function joinReport(result: AssemblyResult): string {
  const lines: string[] = [];
  const choices = [...result.choices.entries()].sort(([left], [right]) => left - right);

  for (const [index, choice] of choices) {
    lines.push(`choice ${index}`);
    if (choice.role !== undefined) {
      lines.push(`  role ${quoted(choice.role)}`);
    }
    if (choice.finishReason !== undefined) {
      lines.push(`  finish ${quoted(choice.finishReason)}`);
    }
    lines.push(`  content ${quoted(choice.content)}`);

    const calls = [...choice.calls.entries()].sort(([left], [right]) => left - right);
    for (const [callIndex, call] of calls) {
      lines.push(`  call ${callIndex}`);
      if (call.id !== undefined) {
        lines.push(`    id ${quoted(call.id)}`);
      }
      lines.push(`    name ${quoted(call.name)}`);
      lines.push(`    arguments ${quoted(call.arguments)}`);
    }
  }

  if (result.usage !== null) {
    const fields: string[] = [];
    for (const field of USAGE_FIELDS) {
      const value = result.usage[field];
      if (value !== undefined) {
        fields.push(`${field} ${value}`);
      }
    }
    if (fields.length > 0) {
      lines.push(`usage ${fields.join(" ")}`);
    }
  }

  return lines.length === 0 ? "" : `${lines.join("\n")}\n`;
}

export function textReport(result: AssemblyResult, choiceIndex: number): string | null {
  return result.choices.get(choiceIndex)?.content ?? null;
}

export function checkReport(result: AssemblyResult): string {
  let calls = 0;
  for (const choice of result.choices.values()) {
    calls += choice.calls.size;
  }
  return `ok: ${result.events} events, ${result.choices.size} choices, ${calls} tool calls\n`;
}

export function problemsReport(file: string, problems: string[]): string {
  const shown = problems.slice(0, 10).map((problem) => `deltaglue: ${file}: ${problem}\n`);
  if (problems.length > 10) {
    shown.push(`deltaglue: ${file}: ... and ${problems.length - 10} more problems\n`);
  }
  return shown.join("");
}

export function missingChoiceReport(file: string, choiceIndex: number): string {
  return `deltaglue: ${file}: no choice ${choiceIndex}\n`;
}
