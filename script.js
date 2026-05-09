// BoaCode keeps the activity intentionally small.  The JavaScript below
// creates a few Google Blockly blocks, shows Python-style code, and simulates
// the output instead of running real Python in the browser.

const characterFaces = {
  Robot: "🤖",
  Detective: "🕵️",
  Wizard: "🧙",
  Astronaut: "👩‍🚀",
};

let selectedCharacter = "Robot";

const themeStorageKey = "boacode-theme";
const themeNames = ["cartoon", "modern", "matrix"];

// Blockly's variable field gives students one simple variable menu, plus the
// toolbox button below lets them create their own beginner-friendly names.
const defaultVariableName = "answer";

// A tiny expression block for words. It supports print("Hello!") and
// input("What is your name?") without adding a large text toolbox.
Blockly.Blocks.boa_text = {
  init() {
    this.appendDummyInput()
      .appendField('"')
      .appendField(new Blockly.FieldTextInput("Hello!"), "TEXT")
      .appendField('"');
    this.setOutput(true, "String");
    this.setColour(46);
    this.setTooltip("A short piece of text.");
  },
};

Blockly.Blocks.boa_get = {
  init() {
    this.appendDummyInput()
      .appendField("get variable")
      .appendField(new Blockly.FieldVariable(defaultVariableName), "VAR");
    this.setOutput(true);
    this.setColour(210);
    this.setTooltip("Use a saved variable.");
  },
};

Blockly.Blocks.boa_set = {
  init() {
    this.appendValueInput("VALUE")
      .appendField("set variable")
      .appendField(new Blockly.FieldVariable(defaultVariableName), "VAR")
      .appendField("=");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(210);
    this.setTooltip("Save a value in a variable.");
  },
};

Blockly.Blocks.boa_print = {
  init() {
    this.appendValueInput("VALUE").setCheck("String").appendField("print");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(16);
    this.setTooltip("Show dialogue from the selected character.");
  },
};

Blockly.Blocks.boa_input = {
  init() {
    this.appendValueInput("PROMPT").setCheck("String").appendField("input");
    this.setOutput(true, "String");
    this.setColour(16);
    this.setTooltip("Ask the student a question while the blocks run.");
  },
};

Blockly.Blocks.boa_lower = {
  init() {
    this.appendValueInput("VALUE").setCheck("String").appendField("lower");
    this.setOutput(true, "String");
    this.setColour(120);
    this.setTooltip("Make text lowercase.");
  },
};

Blockly.Blocks.boa_join_text = {
  init() {
    this.appendValueInput("A").setCheck("String").appendField("join text");
    this.appendValueInput("B").setCheck("String").appendField("+");
    this.setInputsInline(true);
    this.setOutput(true, "String");
    this.setColour(46);
    this.setTooltip("Join two pieces of text into one longer text value. Nest this block to build sentences.");
  },
};

Blockly.Blocks.boa_equals = {
  init() {
    this.appendValueInput("A").setCheck("String");
    this.appendValueInput("B").setCheck("String").appendField("equals");
    this.setOutput(true, "Boolean");
    this.setColour(120);
    this.setTooltip("Check whether two values are equal.");
  },
};

Blockly.Blocks.boa_and = {
  init() {
    this.appendValueInput("A").setCheck("Boolean");
    this.appendValueInput("B").setCheck("Boolean").appendField("and");
    this.setOutput(true, "Boolean");
    this.setColour(120);
    this.setTooltip("Both conditions must be true. Nest this block to check more conditions.");
  },
};

Blockly.Blocks.boa_or = {
  init() {
    this.appendValueInput("A");
    this.appendValueInput("B").appendField("or");
    this.setOutput(true);
    this.setColour(120);
    this.setTooltip("Use the first value if it is not empty; otherwise use the second value.");
  },
};

Blockly.Blocks.boa_if_else = {
  init() {
    this.appendValueInput("TEST").appendField("if");
    this.appendStatementInput("DO").appendField("then");
    this.appendStatementInput("ELSE").appendField("else");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(285);
    this.setTooltip("Choose one path. Empty text counts as false; any other text counts as true.");
  },
};

const workspace = Blockly.inject("blocklyDiv", {
  toolbox: document.getElementById("toolbox"),
  trashcan: true,
  scrollbars: true,
  renderer: "zelos",
});

workspace.createVariable(defaultVariableName);

workspace.registerButtonCallback("CREATE_VARIABLE", () => {
  Blockly.Variables.createVariableButtonHandler(workspace, undefined, undefined);
});

// Give students a short starter program so the page is useful immediately.
Blockly.Xml.domToWorkspace(
  Blockly.utils.xml.textToDom(`
    <xml>
      <block type="boa_set" x="30" y="30">
        <field name="VAR">answer</field>
        <value name="VALUE">
          <block type="boa_input">
            <value name="PROMPT">
              <block type="boa_text">
                <field name="TEXT">Say something for the character.</field>
              </block>
            </value>
          </block>
        </value>
        <next>
          <block type="boa_if_else">
            <value name="TEST">
              <block type="boa_lower">
                <value name="VALUE">
                  <block type="boa_get">
                    <field name="VAR">answer</field>
                  </block>
                </value>
              </block>
            </value>
            <statement name="DO">
              <block type="boa_print">
                <value name="VALUE">
                  <block type="boa_or">
                    <value name="A">
                      <block type="boa_get">
                        <field name="VAR">answer</field>
                      </block>
                    </value>
                    <value name="B">
                      <block type="boa_text">
                        <field name="TEXT">Hello, class!</field>
                      </block>
                    </value>
                  </block>
                </value>
              </block>
            </statement>
            <statement name="ELSE">
              <block type="boa_print">
                <value name="VALUE">
                  <block type="boa_text">
                    <field name="TEXT">Try typing a word next time.</field>
                  </block>
                </value>
              </block>
            </statement>
          </block>
        </next>
      </block>
    </xml>
  `),
  workspace
);

const codeOutput = document.getElementById("codeOutput");
const dialogueOutput = document.getElementById("dialogueOutput");
const speakerAvatar = document.getElementById("speakerAvatar");
const speakerName = document.getElementById("speakerName");
const dialogueInputForm = document.getElementById("dialogueInputForm");
const dialogueInputLabel = document.getElementById("dialogueInputLabel");
const dialogueInput = document.getElementById("dialogueInput");
const runButton = document.getElementById("runButton");
const themeButtons = document.querySelectorAll(".theme-button");
let activeInputResolver = null;

function getSavedTheme() {
  const savedTheme = localStorage.getItem(themeStorageKey);
  return themeNames.includes(savedTheme) ? savedTheme : "cartoon";
}

// Themes are cosmetic only: they swap body classes and leave Blockly/runtime logic unchanged.
function applyTheme(theme) {
  const selectedTheme = themeNames.includes(theme) ? theme : "cartoon";

  themeNames.forEach((themeName) => document.body.classList.remove(`theme-${themeName}`));
  document.body.classList.add(`theme-${selectedTheme}`);
  localStorage.setItem(themeStorageKey, selectedTheme);

  themeButtons.forEach((button) => {
    const isSelected = button.dataset.theme === selectedTheme;
    button.classList.toggle("active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function chooseCharacter(character) {
  selectedCharacter = character;
  speakerAvatar.textContent = characterFaces[character];
  speakerName.textContent = character;

  document.querySelectorAll(".character-card").forEach((card) => {
    const isSelected = card.dataset.character === character;
    card.classList.toggle("selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
  });
}

function escapePythonString(text) {
  return String(text).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function getVariableName(block) {
  const variableId = block.getFieldValue("VAR");
  return workspace.getVariableById(variableId)?.name || variableId || defaultVariableName;
}

function toPythonVariableName(name) {
  const safeName = String(name)
    .trim()
    .replace(/[^A-Za-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^([0-9])/, "_$1");

  return safeName || defaultVariableName;
}

function getValueBlock(block, inputName) {
  return block.getInputTargetBlock(inputName);
}

// Convert each block into readable Python-style code.  The generated code is
// for learning only; runProgram below performs the browser simulation.
function generateExpression(block) {
  if (!block) return '""';

  if (block.type === "boa_text") {
    return `"${escapePythonString(block.getFieldValue("TEXT"))}"`;
  }

  if (block.type === "boa_get") {
    return toPythonVariableName(getVariableName(block));
  }

  if (block.type === "boa_input") {
    return `input(${generateExpression(getValueBlock(block, "PROMPT"))})`;
  }

  if (block.type === "boa_lower") {
    return `${generateExpression(getValueBlock(block, "VALUE"))}.lower()`;
  }

  if (block.type === "boa_join_text") {
    return `(${generateExpression(getValueBlock(block, "A"))} + ${generateExpression(getValueBlock(block, "B"))})`;
  }

  if (block.type === "boa_equals") {
    return `(${generateExpression(getValueBlock(block, "A"))} == ${generateExpression(getValueBlock(block, "B"))})`;
  }

  if (block.type === "boa_and") {
    return `(${generateExpression(getValueBlock(block, "A"))} and ${generateExpression(getValueBlock(block, "B"))})`;
  }

  if (block.type === "boa_or") {
    return `(${generateExpression(getValueBlock(block, "A"))} or ${generateExpression(getValueBlock(block, "B"))})`;
  }

  return '""';
}

function generateStatements(block, indent = "") {
  const lines = [];
  let current = block;

  while (current) {
    if (current.type === "boa_set") {
      lines.push(`${indent}${toPythonVariableName(getVariableName(current))} = ${generateExpression(getValueBlock(current, "VALUE"))}`);
    }

    if (current.type === "boa_print") {
      lines.push(`${indent}print(${generateExpression(getValueBlock(current, "VALUE"))})`);
    }

    if (current.type === "boa_if_else") {
      lines.push(`${indent}if ${generateExpression(getValueBlock(current, "TEST"))}:`);
      const doLines = generateStatements(current.getInputTargetBlock("DO"), `${indent}    `);
      lines.push(...(doLines.length ? doLines : [`${indent}    pass`]));
      lines.push(`${indent}else:`);
      const elseLines = generateStatements(current.getInputTargetBlock("ELSE"), `${indent}    `);
      lines.push(...(elseLines.length ? elseLines : [`${indent}    pass`]));
    }

    current = current.getNextBlock();
  }

  return lines;
}

function updateCodePreview() {
  const topBlocks = workspace.getTopBlocks(true).filter((block) => !block.outputConnection);
  const lines = topBlocks.flatMap((block) => generateStatements(block));
  codeOutput.textContent = lines.length ? lines.join("\n") : "# Add blocks to see code here.";
}

function appendDialogue(text, className = "speech-bubble") {
  const bubble = document.createElement("div");
  bubble.className = className;
  bubble.textContent = text;
  dialogueOutput.appendChild(bubble);
  bubble.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function showInputPrompt(promptText) {
  appendDialogue(promptText, "question-bubble");
  dialogueInputLabel.textContent = `${selectedCharacter} is asking:`;
  dialogueInput.placeholder = "Type your reply here";
  dialogueInput.value = "";
  dialogueInputForm.classList.remove("hidden");
  dialogueInput.focus();

  return new Promise((resolve) => {
    activeInputResolver = resolve;
  });
}

function hideInputPrompt() {
  dialogueInputForm.classList.add("hidden");
  activeInputResolver = null;
}

async function evaluateExpression(block, variables) {
  if (!block) return "";

  if (block.type === "boa_text") {
    return block.getFieldValue("TEXT");
  }

  if (block.type === "boa_get") {
    return variables[block.getFieldValue("VAR")] || "";
  }

  if (block.type === "boa_input") {
    const promptText = (await evaluateExpression(getValueBlock(block, "PROMPT"), variables)) || "Type an answer:";
    return showInputPrompt(promptText);
  }

  if (block.type === "boa_lower") {
    return (await evaluateExpression(getValueBlock(block, "VALUE"), variables)).toLowerCase();
  }

  if (block.type === "boa_join_text") {
    const firstValue = await evaluateExpression(getValueBlock(block, "A"), variables);
    const secondValue = await evaluateExpression(getValueBlock(block, "B"), variables);
    return `${firstValue}${secondValue}`;
  }

  if (block.type === "boa_equals") {
    const firstValue = await evaluateExpression(getValueBlock(block, "A"), variables);
    const secondValue = await evaluateExpression(getValueBlock(block, "B"), variables);
    return firstValue === secondValue;
  }

  if (block.type === "boa_and") {
    const firstValue = await evaluateExpression(getValueBlock(block, "A"), variables);

    if (!firstValue) return false;

    return Boolean(await evaluateExpression(getValueBlock(block, "B"), variables));
  }

  if (block.type === "boa_or") {
    const firstValue = await evaluateExpression(getValueBlock(block, "A"), variables);
    return firstValue || evaluateExpression(getValueBlock(block, "B"), variables);
  }

  return "";
}

async function runStatements(block, variables, messages) {
  let current = block;

  while (current) {
    if (current.type === "boa_set") {
      variables[current.getFieldValue("VAR")] = await evaluateExpression(getValueBlock(current, "VALUE"), variables);
    }

    if (current.type === "boa_print") {
      const message = await evaluateExpression(getValueBlock(current, "VALUE"), variables);
      messages.push(message);
      appendDialogue(message || "…", "speech-bubble");
    }

    if (current.type === "boa_if_else") {
      const testValue = await evaluateExpression(getValueBlock(current, "TEST"), variables);
      const branchName = testValue ? "DO" : "ELSE";
      await runStatements(current.getInputTargetBlock(branchName), variables, messages);
    }

    current = current.getNextBlock();
  }
}

async function runProgram() {
  updateCodePreview();
  hideInputPrompt();
  runButton.disabled = true;
  dialogueOutput.innerHTML = "";

  const variables = {};
  const messages = [];
  const topBlocks = workspace.getTopBlocks(true).filter((block) => !block.outputConnection);

  for (const block of topBlocks) {
    await runStatements(block, variables, messages);
  }

  if (!messages.length) {
    appendDialogue("No print blocks ran. Add print() to make the character speak.", "speech-bubble narrator-bubble");
  }

  runButton.disabled = false;
}

document.querySelectorAll(".character-card").forEach((card) => {
  card.addEventListener("click", () => chooseCharacter(card.dataset.character));
});

themeButtons.forEach((button) => {
  button.addEventListener("click", () => applyTheme(button.dataset.theme));
});

dialogueInputForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!activeInputResolver) return;

  const reply = dialogueInput.value;
  const resolveInput = activeInputResolver;
  appendDialogue(reply || "(no reply)", "reply-bubble");
  hideInputPrompt();
  resolveInput(reply);
});

runButton.addEventListener("click", runProgram);
workspace.addChangeListener(updateCodePreview);
applyTheme(getSavedTheme());
updateCodePreview();
