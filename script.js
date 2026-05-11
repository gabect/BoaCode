// BoaCode keeps the activity intentionally small.  The JavaScript below
// creates a few Google Blockly blocks, shows Python-style code, and simulates
// the output instead of running real Python in the browser.

const characterFaces = {
  Robot: "🤖",
  Detective: "🕵️",
  Wizard: "🧙",
  Astronaut: "👩‍🚀",
};

const characterNames = Object.keys(characterFaces);
const UI_VERSION = "boacode-ui-v2";
const uiVersionStorageKey = "boacode-ui-version";
const characterStorageKey = "boacode-character";
const themeStorageKey = "boacode-theme";
const splitStorageKey = "boacode-workspace-width";
const defaultTheme = "cartoon";
const defaultCharacter = "Robot";
const defaultWorkspaceSplit = 75;
const minWorkspaceSplit = 58;
const maxWorkspaceSplit = 82;
const boaCodeLayoutStorageKeys = [
  splitStorageKey,
  "boacode-layout",
  "boacode-layout-width",
  "boacode-header",
  "boacode-header-height",
  "boacode-topbar-height",
  "boacode-panel-layout",
  "boacode-panels",
];
const desktopSplitQuery = "(min-width: 901px)";
const themeNames = ["cartoon", "modern", "hacker"];
let activeBlockPalette = "default";
const blockPalettes = {
  default: {
    text: 46,
    variables: 210,
    io: 16,
    operators: 120,
    conditionals: 285,
  },
  hacker: {
    variables: "#168a72",
    io: "#2f8f46",
    conditionals: "#23643a",
    text: "#6d7f2a",
    operators: "#5f9f34",
  },
};
const blockTypesByPaletteKey = {
  text: ["boa_text", "boa_join_text", "boa_lower"],
  variables: ["boa_get", "boa_set"],
  io: ["boa_print", "boa_input"],
  operators: ["boa_equals", "boa_and", "boa_or"],
  conditionals: ["boa_if_else"],
};
const starterBlocksCategoryColours = {
  default: "#d85f33",
  hacker: "#7ad26f",
};

function blockColour(paletteKey) {
  return blockPalettes[activeBlockPalette][paletteKey];
}
let selectedCharacter = "Robot";

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
    this.setColour(blockColour("text"));
    this.setTooltip("A short piece of text.");
  },
};

Blockly.Blocks.boa_get = {
  init() {
    this.appendDummyInput()
      .appendField("get variable")
      .appendField(new Blockly.FieldVariable(defaultVariableName), "VAR");
    this.setOutput(true);
    this.setColour(blockColour("variables"));
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
    this.setColour(blockColour("variables"));
    this.setTooltip("Save a value in a variable.");
  },
};

Blockly.Blocks.boa_print = {
  init() {
    this.appendValueInput("VALUE").setCheck("String").appendField("print");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(blockColour("io"));
    this.setTooltip("Show dialogue from the selected character.");
  },
};

Blockly.Blocks.boa_input = {
  init() {
    this.appendValueInput("PROMPT").setCheck("String").appendField("input");
    this.setOutput(true, "String");
    this.setColour(blockColour("io"));
    this.setTooltip("Ask the student a question while the blocks run.");
  },
};

Blockly.Blocks.boa_lower = {
  init() {
    this.appendValueInput("VALUE").setCheck("String").appendField("lower");
    this.setOutput(true, "String");
    this.setColour(blockColour("text"));
    this.setTooltip("Make text lowercase.");
  },
};

Blockly.Blocks.boa_join_text = {
  init() {
    this.appendValueInput("A").setCheck("String").appendField("join text");
    this.appendValueInput("B").setCheck("String").appendField("+");
    this.setInputsInline(true);
    this.setOutput(true, "String");
    this.setColour(blockColour("text"));
    this.setTooltip("Join two pieces of text into one longer text value. Nest this block to build sentences.");
  },
};

Blockly.Blocks.boa_equals = {
  init() {
    this.appendValueInput("A").setCheck("String");
    this.appendValueInput("B").setCheck("String").appendField("equals");
    this.setOutput(true, "Boolean");
    this.setColour(blockColour("operators"));
    this.setTooltip("Check whether two values are equal.");
  },
};

Blockly.Blocks.boa_and = {
  init() {
    this.appendValueInput("A").setCheck("Boolean");
    this.appendValueInput("B").setCheck("Boolean").appendField("and");
    this.setOutput(true, "Boolean");
    this.setColour(blockColour("operators"));
    this.setTooltip("Both conditions must be true. Nest this block to check more conditions.");
  },
};

Blockly.Blocks.boa_or = {
  init() {
    this.appendValueInput("A");
    this.appendValueInput("B").appendField("or");
    this.setOutput(true);
    this.setColour(blockColour("operators"));
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
    this.setColour(blockColour("conditionals"));
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
const appShell = document.getElementById("appShell");
const splitDivider = document.getElementById("splitDivider");
const characterButton = document.getElementById("characterButton");
const characterButtonAvatar = document.querySelector(".character-button-avatar");
const characterButtonName = document.getElementById("characterButtonName");
const characterDialog = document.getElementById("characterDialog");
const resetLayoutButton = document.getElementById("resetLayoutButton");
const brandLogo = document.querySelector(".brand-logo");
const toolboxXml = document.getElementById("toolbox");
const starterBlocksCategory = toolboxXml.querySelector('category[name="Starter Blocks"]');
let activeInputResolver = null;
let splitDragFrame = null;

function readSavedSetting(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function saveSetting(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private or restricted browser contexts may block localStorage; defaults still keep the app usable.
  }
}

function removeSavedSetting(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Local storage can be unavailable in restricted contexts. Safe defaults still apply in memory.
  }
}

function removeUnsafeBoaCodeLayoutSettings() {
  boaCodeLayoutStorageKeys.forEach(removeSavedSetting);

  try {
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index);

      if (/^boacode-(layout|header|topbar|panel)/.test(key)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // If iteration is blocked, the explicit key removals above have already handled the known layout keys.
  }
}

function resetStoredUiDefaults() {
  removeUnsafeBoaCodeLayoutSettings();
  saveSetting(splitStorageKey, String(defaultWorkspaceSplit));
  saveSetting(themeStorageKey, defaultTheme);
  saveSetting(characterStorageKey, defaultCharacter);
}

function migrateUiStorageIfNeeded() {
  if (readSavedSetting(uiVersionStorageKey) === UI_VERSION) return;

  resetStoredUiDefaults();
  saveSetting(uiVersionStorageKey, UI_VERSION);
}

migrateUiStorageIfNeeded();

function getSavedTheme() {
  const savedTheme = readSavedSetting(themeStorageKey);

  if (savedTheme === "matrix") {
    saveSetting(themeStorageKey, "hacker");
    return "hacker";
  }

  if (themeNames.includes(savedTheme)) {
    return savedTheme;
  }

  if (savedTheme !== null) {
    saveSetting(themeStorageKey, defaultTheme);
  }

  return defaultTheme;
}

function getSavedCharacter() {
  const savedCharacter = readSavedSetting(characterStorageKey);

  if (characterNames.includes(savedCharacter)) {
    return savedCharacter;
  }

  if (savedCharacter !== null) {
    saveSetting(characterStorageKey, defaultCharacter);
  }

  return defaultCharacter;
}

function applyBlocklyStarterBlocksCategoryColour(theme) {
  const colour = theme === "hacker" ? starterBlocksCategoryColours.hacker : starterBlocksCategoryColours.default;
  starterBlocksCategory.setAttribute("colour", colour);

  if (typeof workspace.updateToolbox === "function") {
    workspace.updateToolbox(toolboxXml);
    workspace.getToolbox()?.refreshSelection?.();
  }
}

function applyBlocklyBlockPalette(theme) {
  activeBlockPalette = theme === "hacker" ? "hacker" : "default";

  Object.entries(blockTypesByPaletteKey).forEach(([paletteKey, blockTypes]) => {
    workspace
      .getAllBlocks(false)
      .filter((block) => blockTypes.includes(block.type))
      .forEach((block) => block.setColour(blockColour(paletteKey)));
  });
}

// Themes are visual only: they swap body classes and block colours while leaving runtime logic unchanged.
function applyTheme(theme) {
  const normalizedTheme = theme === "matrix" ? "hacker" : theme;
  const selectedTheme = themeNames.includes(normalizedTheme) ? normalizedTheme : defaultTheme;

  themeNames.forEach((themeName) => document.body.classList.remove(`theme-${themeName}`));
  document.body.classList.add(`theme-${selectedTheme}`);
  saveSetting(themeStorageKey, selectedTheme);
  applyBlocklyStarterBlocksCategoryColour(selectedTheme);
  applyBlocklyBlockPalette(selectedTheme);

  themeButtons.forEach((button) => {
    const isSelected = button.dataset.theme === selectedTheme;
    button.classList.toggle("active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  requestAnimationFrame(resizeBlocklyWorkspace);
}

function chooseCharacter(character, closeDialog = false) {
  const safeCharacter = characterNames.includes(character) ? character : defaultCharacter;
  selectedCharacter = safeCharacter;
  saveSetting(characterStorageKey, safeCharacter);
  speakerAvatar.textContent = characterFaces[safeCharacter];
  speakerName.textContent = safeCharacter;
  characterButtonAvatar.textContent = characterFaces[safeCharacter];
  characterButtonName.textContent = safeCharacter;

  document.querySelectorAll(".character-card").forEach((card) => {
    const isSelected = card.dataset.character === safeCharacter;
    card.classList.toggle("selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
  });

  if (closeDialog && characterDialog.open) {
    characterDialog.close();
    characterButton.focus();
  }
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

function resizeBlocklyWorkspace() {
  Blockly.svgResize(workspace);
}

function isDesktopSplitLayout() {
  return window.matchMedia(desktopSplitQuery).matches;
}

function getClampedWorkspacePercent(percent) {
  if (!Number.isFinite(percent)) return defaultWorkspaceSplit;

  return Math.min(maxWorkspaceSplit, Math.max(minWorkspaceSplit, percent));
}

function getSafeSavedWorkspacePercent() {
  const savedSplit = readSavedSetting(splitStorageKey);
  const savedPercent = Number(savedSplit);

  if (savedSplit === null || !Number.isFinite(savedPercent)) {
    return { percent: defaultWorkspaceSplit, wasReset: savedSplit !== null };
  }

  if (savedPercent < minWorkspaceSplit || savedPercent > maxWorkspaceSplit) {
    return { percent: defaultWorkspaceSplit, wasReset: true };
  }

  return { percent: getClampedWorkspacePercent(savedPercent), wasReset: false };
}

function setWorkspacePercent(percent, shouldSave = false) {
  const clampedPercent = getClampedWorkspacePercent(Number(percent));
  const safePercent = Number.isFinite(clampedPercent) ? clampedPercent : defaultWorkspaceSplit;
  appShell.style.setProperty("--workspace-width", `${safePercent}%`);
  splitDivider.setAttribute("aria-valuenow", String(Math.round(safePercent)));

  if (shouldSave) {
    saveSetting(splitStorageKey, String(safePercent));
  }

  if (splitDragFrame) {
    cancelAnimationFrame(splitDragFrame);
  }

  splitDragFrame = requestAnimationFrame(() => {
    resizeBlocklyWorkspace();
    splitDragFrame = null;
  });
}

function resetWorkspaceSplit() {
  removeUnsafeBoaCodeLayoutSettings();
  setWorkspacePercent(defaultWorkspaceSplit, true);
  requestAnimationFrame(resizeBlocklyWorkspace);
}

function validateDesktopSplitPlacement() {
  if (!isDesktopSplitLayout()) return;

  const workspaceRect = document.querySelector(".workspace-panel").getBoundingClientRect();
  const outputRect = document.querySelector(".output-panel").getBoundingClientRect();

  if (outputRect.top > workspaceRect.top + 20 || outputRect.left <= workspaceRect.left) {
    resetWorkspaceSplit();
  }
}

function applySavedSplit() {
  if (!isDesktopSplitLayout()) {
    setWorkspacePercent(defaultWorkspaceSplit);
    return;
  }

  const { percent, wasReset } = getSafeSavedWorkspacePercent();
  setWorkspacePercent(percent, wasReset);
  requestAnimationFrame(validateDesktopSplitPlacement);
}

function updateSplitFromPointer(clientX, shouldSave = true) {
  const shellRect = appShell.getBoundingClientRect();
  const rawPercent = ((clientX - shellRect.left) / shellRect.width) * 100;
  setWorkspacePercent(rawPercent, shouldSave);
}

function beginSplitDrag(event) {
  if (!isDesktopSplitLayout()) return;

  splitDivider.classList.add("dragging");
  splitDivider.setPointerCapture(event.pointerId);
  updateSplitFromPointer(event.clientX);
}

function dragSplit(event) {
  if (!splitDivider.classList.contains("dragging")) return;
  updateSplitFromPointer(event.clientX);
}

function endSplitDrag(event) {
  if (!splitDivider.classList.contains("dragging")) return;

  splitDivider.classList.remove("dragging");
  splitDivider.releasePointerCapture(event.pointerId);
  updateSplitFromPointer(event.clientX);
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
  card.addEventListener("click", () => chooseCharacter(card.dataset.character, true));
});

characterButton.addEventListener("click", () => {
  characterDialog.showModal();
  characterDialog.querySelector(".character-card.selected")?.focus();
});

characterDialog.addEventListener("close", () => {
  characterButton.focus();
});

splitDivider.addEventListener("pointerdown", beginSplitDrag);
splitDivider.addEventListener("pointermove", dragSplit);
splitDivider.addEventListener("pointerup", endSplitDrag);
splitDivider.addEventListener("pointercancel", endSplitDrag);
splitDivider.addEventListener("keydown", (event) => {
  const currentPercent = Number(splitDivider.getAttribute("aria-valuenow")) || defaultWorkspaceSplit;

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    setWorkspacePercent(currentPercent - 2, true);
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    setWorkspacePercent(currentPercent + 2, true);
  }
});

resetLayoutButton.addEventListener("click", resetWorkspaceSplit);

window.addEventListener("resize", () => {
  applySavedSplit();
  resizeBlocklyWorkspace();
});

window.addEventListener("load", () => {
  applySavedSplit();
  resizeBlocklyWorkspace();
});

brandLogo.addEventListener("load", resizeBlocklyWorkspace);

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
chooseCharacter(getSavedCharacter());
applySavedSplit();
resizeBlocklyWorkspace();
updateCodePreview();
