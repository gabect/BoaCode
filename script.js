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

// These friendly variable names avoid a full variable manager while still
// letting students practice assignment and reuse values.
const variableOptions = [
  ["answer", "answer"],
  ["name", "name"],
  ["mood", "mood"],
];

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
      .appendField("variable")
      .appendField(new Blockly.FieldDropdown(variableOptions), "VAR");
    this.setOutput(true);
    this.setColour(210);
    this.setTooltip("Use a saved variable.");
  },
};

Blockly.Blocks.boa_set = {
  init() {
    this.appendValueInput("VALUE")
      .appendField("set")
      .appendField(new Blockly.FieldDropdown(variableOptions), "VAR")
      .appendField("=");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(210);
    this.setTooltip("Save a value in a variable.");
  },
};

Blockly.Blocks.boa_print = {
  init() {
    this.appendValueInput("VALUE").appendField("print");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(16);
    this.setTooltip("Show dialogue from the selected character.");
  },
};

Blockly.Blocks.boa_input = {
  init() {
    this.appendValueInput("PROMPT").appendField("input");
    this.setOutput(true);
    this.setColour(16);
    this.setTooltip("Ask the student a question while the blocks run.");
  },
};

Blockly.Blocks.boa_lower = {
  init() {
    this.appendValueInput("VALUE").appendField("lower");
    this.setOutput(true);
    this.setColour(120);
    this.setTooltip("Make text lowercase.");
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
const speakerBadge = document.getElementById("speakerBadge");

function chooseCharacter(character) {
  selectedCharacter = character;
  speakerBadge.textContent = `${characterFaces[character]} ${character}`;

  document.querySelectorAll(".character-card").forEach((card) => {
    const isSelected = card.dataset.character === character;
    card.classList.toggle("selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
  });
}

function escapePythonString(text) {
  return String(text).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
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
    return block.getFieldValue("VAR");
  }

  if (block.type === "boa_input") {
    return `input(${generateExpression(getValueBlock(block, "PROMPT"))})`;
  }

  if (block.type === "boa_lower") {
    return `${generateExpression(getValueBlock(block, "VALUE"))}.lower()`;
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
      lines.push(`${indent}${current.getFieldValue("VAR")} = ${generateExpression(getValueBlock(current, "VALUE"))}`);
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

function evaluateExpression(block, variables) {
  if (!block) return "";

  if (block.type === "boa_text") {
    return block.getFieldValue("TEXT");
  }

  if (block.type === "boa_get") {
    return variables[block.getFieldValue("VAR")] || "";
  }

  if (block.type === "boa_input") {
    const promptText = evaluateExpression(getValueBlock(block, "PROMPT"), variables) || "Type an answer:";
    return window.prompt(promptText, "") || "";
  }

  if (block.type === "boa_lower") {
    return evaluateExpression(getValueBlock(block, "VALUE"), variables).toLowerCase();
  }

  if (block.type === "boa_or") {
    const firstValue = evaluateExpression(getValueBlock(block, "A"), variables);
    return firstValue || evaluateExpression(getValueBlock(block, "B"), variables);
  }

  return "";
}

function runStatements(block, variables, messages) {
  let current = block;

  while (current) {
    if (current.type === "boa_set") {
      variables[current.getFieldValue("VAR")] = evaluateExpression(getValueBlock(current, "VALUE"), variables);
    }

    if (current.type === "boa_print") {
      messages.push(evaluateExpression(getValueBlock(current, "VALUE"), variables));
    }

    if (current.type === "boa_if_else") {
      const testValue = evaluateExpression(getValueBlock(current, "TEST"), variables);
      const branchName = testValue ? "DO" : "ELSE";
      runStatements(current.getInputTargetBlock(branchName), variables, messages);
    }

    current = current.getNextBlock();
  }
}

function runProgram() {
  updateCodePreview();
  const variables = {};
  const messages = [];
  const topBlocks = workspace.getTopBlocks(true).filter((block) => !block.outputConnection);

  topBlocks.forEach((block) => runStatements(block, variables, messages));

  dialogueOutput.textContent = messages.length
    ? messages.join("\n")
    : "No print blocks ran. Add print() to make the character speak.";
}

document.querySelectorAll(".character-card").forEach((card) => {
  card.addEventListener("click", () => chooseCharacter(card.dataset.character));
});

document.getElementById("runButton").addEventListener("click", runProgram);
workspace.addChangeListener(updateCodePreview);
updateCodePreview();
