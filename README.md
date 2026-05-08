# BoaCode Blocks

BoaCode Blocks is a small classroom coding activity for middle school students.
It uses Google Blockly to let students arrange a short set of beginner-friendly
blocks and then read the matching Python-style code.

The app is intentionally **not** a game engine or Scratch clone. It has no
accounts, saved projects, sounds, sprite editor, animations, community tools, or
advanced blocks.

## Student activity

Students choose one of four characters:

- Robot
- Detective
- Wizard
- Astronaut

When the blocks run, the output from `print()` appears as dialogue from the
selected character. If a program reaches `input()`, the character asks the
question inside the result panel and waits for the student to submit an answer.

## Included coding ideas

The Blockly workspace is limited to simple starter concepts:

- `print()`
- `input()`
- variable assignment
- `.lower()`
- `or`
- `if / else`

The browser simulates the behavior with JavaScript. It also generates
Python-style code so students can read the program they built, but it does not
execute real Python. The app does not use browser prompt or alert boxes; all
interaction stays in the BoaCode result panel.

## File structure

```text
index.html
style.css
script.js
README.md
```

## Run locally

Open `index.html` in a browser, or serve the folder with any simple static file
server.

Example with Python:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## GitHub Pages

This project is ready for GitHub Pages because it is plain static HTML, CSS, and
JavaScript. In your repository settings, enable GitHub Pages for the branch that
contains these files.

## Teacher notes

- The code is commented in `script.js` to explain the main Blockly setup,
  code-generation step, and JavaScript simulation.
- The interface is responsive enough for Chromebooks and small classroom screens.
- Styling uses a warm, simple, mid-1990s Saturday morning cartoon feel without
  distracting game-like effects.
