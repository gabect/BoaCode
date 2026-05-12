const themeStorageKey = "boacode-theme";
const defaultTheme = "cartoon";
const themeNames = ["cartoon", "modern", "hacker"];

const examples = [
  {
    id: "hello",
    title: "Hello World",
    description: "Start with print() and make the lab say hello.",
    code: `print("Hello, BoaCode!")
print("I am learning Python.")`,
  },
  {
    id: "name",
    title: "Ask for a Name",
    description: "Use input() to collect a name, then build a friendly greeting.",
    code: `name = input("What is your name? ")
print("Hi, " + name + "!")
print("Welcome to Python Lab.")`,
  },
  {
    id: "ifelse",
    title: "Simple If / Else",
    description: "Practice choosing one path based on a number.",
    code: `score = 8

if score >= 7:
    print("Great job!")
else:
    print("Keep practicing — you can do it!")`,
  },
  {
    id: "quiz",
    title: "Mini Quiz",
    description: "Ask a question, check the answer, and print feedback.",
    code: `answer = input("What keyword starts a Python decision? ")

if answer.lower() == "if":
    print("Correct! if starts a decision.")
else:
    print("Good try. The answer is if.")`,
  },
  {
    id: "greeting",
    title: "Greeting Builder",
    description: "Combine strings and inputs to make a custom sentence.",
    code: `name = input("Name: ")
favorite = input("Favorite animal: ")

message = "Hello, " + name + "!"
message = message + " A " + favorite + " would make a fun coding buddy."
print(message)`,
  },
];

const editor = document.getElementById("pythonEditor");
const output = document.getElementById("pythonOutput");
const runButton = document.getElementById("runPythonButton");
const clearButton = document.getElementById("clearOutputButton");
const runtimeStatus = document.getElementById("runtimeStatus");
const statusDot = document.getElementById("statusDot");
const exampleButtons = document.getElementById("exampleButtons");
const exampleDescription = document.getElementById("exampleDescription");
const consoleInputForm = document.getElementById("consoleInputForm");
const consoleInputLabel = document.getElementById("consoleInputLabel");
const consoleInput = document.getElementById("consoleInput");
const themeButtons = document.querySelectorAll(".theme-button");
let pyodideReadyPromise;
let activeRunCode = "";
let activeInputValues = [];
let waitingForInput = false;
let isRunning = false;

function getSavedTheme() {
  const savedTheme = localStorage.getItem(themeStorageKey);
  return themeNames.includes(savedTheme) ? savedTheme : defaultTheme;
}

function applyTheme(theme) {
  const safeTheme = themeNames.includes(theme) ? theme : defaultTheme;
  document.body.classList.remove(...themeNames.map((name) => `theme-${name}`));
  document.body.classList.add(`theme-${safeTheme}`);
  localStorage.setItem(themeStorageKey, safeTheme);

  themeButtons.forEach((button) => {
    const isActive = button.dataset.theme === safeTheme;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function setStatus(message, state = "loading") {
  runtimeStatus.textContent = message;
  statusDot.dataset.state = state;
}

function hideConsoleInput() {
  waitingForInput = false;
  consoleInputForm.classList.add("hidden");
  consoleInput.value = "";
}

function showConsoleInput(promptText) {
  waitingForInput = true;
  consoleInputLabel.textContent = promptText || "Python is waiting for your answer:";
  consoleInput.placeholder = "Type your answer, then press Enter";
  consoleInputForm.classList.remove("hidden");
  consoleInput.focus();
}

function updateConsole(text, extraMessage = "") {
  const trimmedText = text.trimEnd();
  output.textContent = [trimmedText, extraMessage].filter(Boolean).join("\n");
}

function loadExample(example) {
  editor.value = example.code;
  exampleDescription.textContent = example.description;
  hideConsoleInput();
  updateConsole(`Loaded “${example.title}.” Press Run Python to try it.`);

  document.querySelectorAll(".example-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.exampleId === example.id);
  });
}

function renderExamples() {
  examples.forEach((example) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "example-button";
    button.dataset.exampleId = example.id;
    button.innerHTML = `<span>${example.title}</span><small>${example.description}</small>`;
    button.addEventListener("click", () => loadExample(example));
    exampleButtons.append(button);
  });
}

async function getPyodide() {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.4/full/" });
  }

  return pyodideReadyPromise;
}

function buildRunnerCode(studentCode, inputValues) {
  return `
import builtins
import contextlib
import io
import json
import traceback

__boa_student_code = ${JSON.stringify(studentCode)}
__boa_inputs = json.loads(${JSON.stringify(JSON.stringify(inputValues))})
__boa_input_index = 0
__boa_output = io.StringIO()

class BoaCodeInputNeeded(Exception):
    def __init__(self, prompt):
        self.prompt = prompt


def __boa_input(prompt=""):
    global __boa_input_index
    prompt = str(prompt)
    if __boa_input_index < len(__boa_inputs):
        answer = str(__boa_inputs[__boa_input_index])
        __boa_input_index += 1
        print(prompt, end="")
        print(answer)
        return answer
    raise BoaCodeInputNeeded(prompt)

__boa_globals = {"__name__": "__main__"}
__boa_result = {"status": "complete", "output": "", "prompt": "", "error": ""}
__boa_original_input = builtins.input

with contextlib.redirect_stdout(__boa_output):
    try:
        builtins.input = __boa_input
        exec(__boa_student_code, __boa_globals)
    except BoaCodeInputNeeded as needed:
        __boa_result["status"] = "input"
        __boa_result["prompt"] = needed.prompt or "Python is waiting for your answer:"
    except Exception:
        __boa_result["status"] = "error"
        __boa_result["error"] = traceback.format_exc(limit=4)
    finally:
        builtins.input = __boa_original_input

__boa_result["output"] = __boa_output.getvalue()
json.dumps(__boa_result)
`;
}

async function continueProgram() {
  if (isRunning) return;

  isRunning = true;
  runButton.disabled = true;
  hideConsoleInput();
  setStatus("Python is running…", "loading");

  try {
    const pyodide = await getPyodide();
    const rawResult = await pyodide.runPythonAsync(buildRunnerCode(activeRunCode, activeInputValues));
    const result = JSON.parse(rawResult);

    if (result.status === "input") {
      updateConsole(result.output, result.prompt);
      showConsoleInput(result.prompt);
      setStatus("Python is waiting for your answer", "loading");
      return;
    }

    if (result.status === "error") {
      updateConsole(result.output, `BoaCode found something to fix:\n${result.error}`);
      setStatus("Python needs attention", "error");
      return;
    }

    updateConsole(result.output || "Your code ran, but it did not print anything yet.", "Program finished.");
    setStatus("Python is ready", "ready");
  } catch (error) {
    updateConsole(`BoaCode could not run this program yet.\n\n${error.message}`);
    setStatus("Python needs attention", "error");
  } finally {
    isRunning = false;
    runButton.disabled = false;
  }
}

async function runPython() {
  activeRunCode = editor.value;
  activeInputValues = [];
  hideConsoleInput();
  updateConsole("Running your Python code…");
  await continueProgram();
}

async function submitConsoleInput(event) {
  event.preventDefault();

  if (!waitingForInput || isRunning) return;

  activeInputValues.push(consoleInput.value);
  hideConsoleInput();
  await continueProgram();
}

function clearOutput() {
  activeInputValues = [];
  waitingForInput = false;
  hideConsoleInput();
  output.textContent = "Console cleared. Press Run Python when you are ready.";
  setStatus("Python is ready", "ready");
}

async function prepareRuntime() {
  runButton.disabled = true;
  setStatus("Python is getting ready…", "loading");

  try {
    await getPyodide();
    setStatus("Python is ready", "ready");
  } catch (error) {
    setStatus("Python could not load. Check your internet connection.", "error");
    output.textContent = `Pyodide did not load. This lab needs the Pyodide files from jsDelivr.\n\n${error.message}`;
  } finally {
    runButton.disabled = false;
  }
}

themeButtons.forEach((button) => {
  button.addEventListener("click", () => applyTheme(button.dataset.theme));
});

runButton.addEventListener("click", runPython);
clearButton.addEventListener("click", clearOutput);
consoleInputForm.addEventListener("submit", submitConsoleInput);

applyTheme(getSavedTheme());
renderExamples();
loadExample(examples[0]);
prepareRuntime();
