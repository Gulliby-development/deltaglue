export interface Frame {
  line: number;
  data: string;
}

export interface Frames {
  events: Frame[];
  open: number | null;
}

export function splitLines(text: string): string[] {
  if (text.length === 0) {
    return [];
  }

  const lines: string[] = [];
  let start = 0;
  let index = 0;

  while (index < text.length) {
    const character = text[index];
    if (character === "\n" || character === "\r") {
      lines.push(text.slice(start, index));
      if (character === "\r" && text[index + 1] === "\n") {
        index += 1;
      }
      start = index + 1;
    }
    index += 1;
  }

  if (start < text.length) {
    lines.push(text.slice(start));
  }

  return lines;
}

export function readFrames(input: string): Frames {
  const text = input.startsWith("\ufeff") ? input.slice(1) : input;
  const lines = splitLines(text);
  const events: Frame[] = [];
  let firstDataLine: number | null = null;
  const data: string[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === "") {
      if (firstDataLine !== null) {
        events.push({ line: firstDataLine, data: data.join("\n") });
        firstDataLine = null;
        data.length = 0;
      }
      continue;
    }

    if (line.startsWith(":")) {
      continue;
    }

    const colon = line.indexOf(":");
    const name = colon === -1 ? line : line.slice(0, colon);
    if (name !== "data") {
      continue;
    }

    let value = colon === -1 ? "" : line.slice(colon + 1);
    if (value.startsWith(" ")) {
      value = value.slice(1);
    }
    if (firstDataLine === null) {
      firstDataLine = index + 1;
    }
    data.push(value);
  }

  return { events, open: firstDataLine };
}
