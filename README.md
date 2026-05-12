# BoaCode

BoaCode is a small classroom coding platform for middle school students. It now
includes two learning paths:

1. **BoaCode Blocks** — a block-based coding activity inspired by Python logic.
2. **BoaCode Python Lab** — a simple browser-based Python IDE for beginner code.

The project stays intentionally focused for classrooms. It has no accounts,
saved projects, community tools, or distracting game-like systems.

## Learning paths

### BoaCode Blocks

Students choose one of four characters:

- Robot
- Detective
- Wizard
- Astronaut

When the blocks run, the output from `print()` appears as dialogue from the
selected character. The Blockly workspace covers starter ideas such as:

- `print()`
- `input()`
- variable assignment
- `.lower()`
- `or`
- `if / else`

The browser simulates the block behavior with JavaScript and generates
Python-style code so students can read the program they built.

### BoaCode Python Lab

Students can type and run real beginner Python code in the browser using
Pyodide from a CDN. The lab includes:

- a clean Python editor
- a Run Python button
- a Clear Output button
- a friendly output panel
- starter examples for hello world, input, if / else, a mini quiz, and greetings
- an in-page input answer box for beginner `input()` programs

## File structure

```text
index.html
app.html
python-lab.html
style.css
script.js
python-lab.js
README.md
```

## Run locally

Open `index.html` in a browser to view the landing page, then choose either
“Start with Blocks” or “Open Python Lab.” You can also serve the folder with any
simple static file server.

Example with Python:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## GitHub Pages

This project is ready for GitHub Pages because it is plain static HTML, CSS, and
JavaScript. Python Lab loads Pyodide from jsDelivr, so it can run beginner
Python without a custom backend server.

## Teacher notes

- `script.js` explains the main Blockly setup, code-generation step, and
  JavaScript simulation for BoaCode Blocks.
- `python-lab.js` loads Pyodide, runs student code, captures output, and provides
  a simple input queue for `input()`.
- The interface is responsive enough for Chromebooks and small classroom screens.
- Styling uses the existing BoaCode logo, themes, and warm classroom-friendly
  visual language, with Hacker Mode only when that theme is selected.
