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
    inputs: "",
  },
  {
    id: "name",
    title: "Ask for a Name",
    description: "Use input() to collect a name, then build a friendly greeting.",
    code: `name = input("What is your name? ")
print("Hi, " + name + "!")
print("Welcome to Python Lab.")`,
    inputs: "Sam",
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
    inputs: "",
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
    inputs: "if",
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
    inputs: "Maya\nboa",
  },
];

const editor = document.getElementById("pythonEditor");
const inputQueue = document.getElementById("inputQueue");
const output = document.getElementById("pythonOutput");
const runButton = document.getElementById("runPythonButton");
const clearButton = document.getElementById("clearOutputButton");
const runtimeStatus = document.getElementById("runtimeStatus");
const statusDot = document.getElementById("statusDot");
const exampleButtons = document.getElementById("exampleButtons");
const exampleDescription = document.getElementById("exampleDescription");
const themeButtons = document.querySelectorAll(".theme-button");
let pyodideReadyPromise;

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

function loadExample(example) {
  editor.value = example.code;
  inputQueue.value = example.inputs;
  exampleDescription.textContent = example.description;

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

def __boa_input(prompt=""):
    global __boa_input_index
    print(str(prompt), end="")
    if __boa_input_index < len(__boa_inputs):
        answer = str(__boa_inputs[__boa_input_index])
        __boa_input_index += 1
        print(answer)
        return answer
    raise EOFError("BoaCode needs another input answer. Add one answer per line in the Input answers box.")

__boa_globals = {"__name__": "__main__"}

with contextlib.redirect_stdout(__boa_output):
    try:
        builtins.input = __boa_input
        exec(__boa_student_code, __boa_globals)
    except Exception:
        traceback.print_exc(limit=4)

__boa_output.getvalue()
`;
}

async function runPython() {
  runButton.disabled = true;
  output.textContent = "Running your Python code…";
  setStatus("Python is running…", "loading");

  try {
    const pyodide = await getPyodide();
    const inputValues = inputQueue.value ? inputQueue.value.split(/\r?\n/) : [];
    const result = await pyodide.runPythonAsync(buildRunnerCode(editor.value, inputValues));
    output.textContent = result.trimEnd() || "Your code ran, but it did not print anything yet.";
    setStatus("Python is ready", "ready");
  } catch (error) {
    output.textContent = `BoaCode could not run this program yet.\n\n${error.message}`;
    setStatus("Python needs attention", "error");
  } finally {
    runButton.disabled = false;
  }
}

function clearOutput() {
  output.textContent = "Output cleared. Press Run Python when you are ready.";
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

applyTheme(getSavedTheme());
renderExamples();
loadExample(examples[0]);
prepareRuntime();
