# SWAN L4 Language Support for VS Code

This extension provides syntax highlighting, auto-completions, and editor configuration for the SWAN L4 DSL (`.l4`).

## Features

- **Syntax Highlighting**: Complete token support mapping to standard VS Code scopes matching Monaco's Monarch token styles.
  - **Pragmas**: `TITLE`, `#DEFINE`.
  - **Primitives**: `SAY`, `SAY THINK`, `LISTEN`, `THINK`, `ASK`, `READ`, `WRITE`, `EXIT`, `CLEAR CONTEXT`.
  - **Control Flow**: `IF`, `ELSE`, `LOOP`, `EXIT LOOP`, `CONTINUE LOOP`, `ITERATE`, `EXIT ITERATION`, `CONTINUE ITERATION`.
  - **Debug Mode Syntax**: Highlighting of bracket-wrapped primitives (e.g. `[SAY]`, `[IF]`, `[CALL_CHECK_STOCK]`).
  - **Variables**: Plain (`$var`), braced (`{$var}`), and predefined context (`{Context}`).
  - **Strings**: Multi-line triple backtick codeblocks and double-quoted strings.
  - **URLs & Paths**: Highlighting of URLs and file/directory paths.
- **Smart Formatting**:
  - Auto-closing brackets, quotes, and backticks.
  - Automatic indentation after colons (e.g., when pressing Enter after `LOOP:`, `ITERATE:`, or `IF CONTAINS "exit":`).
- **Autocomplete Snippets**: Direct completions for standard statements and loops like `TITLE`, `#DEFINE`, `SAY`, `LOOP`, `ITERATE`, and `IF`.

## Installation

### Manual Installation
Copy this extension folder to your VS Code extensions directory:
- **Linux / macOS**: `~/.vscode/extensions/swan-l4-vscode-extension`
- **Windows**: `%USERPROFILE%\.vscode\extensions\swan-l4-vscode-extension`

Alternatively, you can package the extension as a `.vsix` using `vsce` and install it:
```bash
npm install -g @vscode/vsce
vsce package
```

## Language Overview & Examples

Here is an example of a SWAN L4 program:

```swan
TITLE Feedback Evaluator
#DEFINE CALL_CHECK_STOCK https://api.warunglele.id/v1/inventory

SAY Please rate our service from 1 to 5:
LISTEN
IF >= 4:
  SAY We are glad you enjoyed it!
ELSE:
  SAY We apologize for the inconvenience and will work to improve.
```
