<p align="center"><img src="docs/logo.svg" alt="deltaglue logo" width="96" height="96"></p>

# deltaglue

[![CI](https://github.com/Gulliby-development/deltaglue/actions/workflows/ci.yml/badge.svg)](https://github.com/Gulliby-development/deltaglue/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Assemble captured streamed model answers and diagnose problems: for developers debugging fragmented text and tool calls. TypeScript/Bun for Windows, macOS and Linux. Offline and deterministic at runtime: no network, model, API key or clock.

## Setup

Install [Bun](https://bun.sh/docs/installation), then from the repository root:

```sh
bun install
```

This installs existing development dependencies; no new dependencies or configuration changes are needed. Installation may need network access; runtime does not.

## Usage

Save this UTF-8 capture as `s.txt`. Include a blank line after every event, including [DONE] (two final line terminators):

```text
data: {"choices":[{"index":0,"delta":{"content":"x"}}]}

data: {"choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]

```

```sh
bun src/main.ts join s.txt
```

Output (supplied JoinSmallTests example):

```text
choice 0
  finish "stop"
  content "x"
```

```sh
bun src/main.ts text s.txt
bun src/main.ts text --choice 0 s.txt
bun src/main.ts text --choice=000 s.txt
bun src/main.ts check s.txt
bun src/main.ts join -- s.txt
bun src/main.ts --help
bun src/main.ts --version
```

- join sorts choices and calls by numeric index and quotes strings with JSON.stringify. Arguments retain their original joined text. Optional usage fields follow on one line in prompt_tokens, completion_tokens, total_tokens order.
- text prints raw selected content without adding a newline; empty content prints nothing. Default choice is 0.
- check prints `ok: E events, C choices, T tool calls` and LF. E includes every dispatched event, including [DONE]; T counts calls across all choices. Nouns stay plural.

Exactly one FILE is required: a path or `-` for stdin. Stdin is read only for `-`. POSIX shell example (macOS/Linux):

```sh
cat s.txt | bun src/main.ts join -
```

Windows Command Prompt (cmd.exe):

```bat
bun src/main.ts check - < s.txt
```

Only text accepts `--choice N` or `--choice=N`: 1–3 ASCII digits, leading zeros allowed (`007` selects 7). Options may precede or follow FILE; choice cannot repeat. `--` ends options: `bun src/main.ts join -- -x` reads an existing capture named -x. Exact `-` still means stdin.

Commands are case-sensitive. Help/version work only as the first argument and ignore later arguments; `join --help` is an error.

## Input and errors

Input is strict UTF-8; one leading BOM is removed. LF, CRLF and lone CR delimit lines. Only exact data fields count; comments and other fields are ignored. Data fields join with LF. Blank lines dispatch events; EOF does not dispatch unfinished events.

Data must be a JSON object or exactly [DONE]. Missing completion, unfinished events and events after [DONE] are problems. Choices need finishes; calls need nonempty IDs/names and arguments parsing as a JSON object.

Stream errors leave stdout empty. Stderr uses `deltaglue: FILE: MESSAGE`; stdin is labeled `<stdin>`. Event diagnostics include `line N:`, the one-based first data line; end checks may lack line numbers. Problems are collected in deterministic order; the first ten print, then `deltaglue: FILE: ... and N more problems` if any were omitted.

Missing choices report `deltaglue: FILE: no choice N` with numeric N. Validation checks command, arguments left-to-right, file count, then reading. Input errors include `deltaglue: cannot read FILE` and `deltaglue: FILE: input is not valid UTF-8`. Generated lines end in LF; raw text preserves its characters.

Statuses: **0** success (also help/version); **1** stream problems or missing choice; **2** usage, option or input errors.

## Development

```sh
bun run typecheck
bun run lint
bun test
```

## License

deltaglue is distributed under the MIT License; see [LICENSE](LICENSE).

---

Built with BAKED
