const vscode = require("vscode");

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
  const isFirstActivation = context.globalState.get('firstActivation', true);

  if (isFirstActivation) {
    vscode.window.showInformationMessage('Color Preview is Activated 🎉');
    context.globalState.update('firstActivation', false);
  }

  const supportedLanguages = ["scss", "sass", "css", "javascript", "typescript", "typescriptreact", "javascriptreact", "html", "json"];
  if (vscode.window.activeTextEditor && supportedLanguages.includes(vscode.window.activeTextEditor.document.languageId)) {
    previewColors(vscode.window.activeTextEditor.document);
  }

  const disposable = vscode.commands.registerCommand(
    "color-preview.colorPreview",
    function () {

      // on open
      context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(function (document) {
          if (supportedLanguages.includes(document.languageId)) {
            previewColors(document);
          }
        })
      );

      // on tab change
      context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor((editor) => {
          if (editor && supportedLanguages.includes(editor.document.languageId)) {
            previewColors(editor.document);
          }
        })
      );

      // on save
      context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument((document) => {
          if (supportedLanguages.includes(document.languageId)) {
            previewColors(document);
          }
        })
      );

      vscode.window.showInformationMessage(
        "Color Preview is now ready to work 🚀"
      );
    }
  );

  context.subscriptions.push(disposable);
}

/** @type {vscode.TextEditorDecorationType} */
let colorDecorationType;

/**
 * Preview Colors in the file
 * @function previewColors
 * @param {vscode.TextDocument} openedFile
 * @returns {void}
 */
function previewColors(openedFile) {
  /** @type {string} */
  const text = openedFile.getText();

  /** @type {vscode.DecorationOptions[]} */
  const colorDecorations = [];

  /** @type {{ regex: RegExp, process: (openedFile: vscode.TextDocument, match: RegExpMatchArray) => vscode.DecorationOptions }[]} */
  const colorPatterns = [
    { regex: /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g, process: createHexDecoration },
    { regex: /rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(,\s*(0?\.\d+|1|0))?\)/g, process: createRgbaDecoration },
    { regex: /hsl\((\d{1,3}),\s*(\d{1,3}%)\s*,\s*(\d{1,3}%)\)/g, process: createHslDecoration },
    { regex: /hsla\((\d{1,3}),\s*(\d{1,3}%)\s*,\s*(\d{1,3}%)\s*,\s*(0?\.\d+|1|0)\)/g, process: createHslaDecoration }
  ];

  colorPatterns.forEach(({ regex, process }) => {
    const matches = [...text.matchAll(regex)]
    matches.forEach((match) => {
      colorDecorations.push(process(openedFile, match));
    })
  });

  applyDecorations(openedFile, colorDecorations);
}

/**
 * Apply decorations to the opened file
 * @function applyDecorations
 * @param {vscode.TextDocument} openedFile
 * @param {vscode.DecorationOptions[]} colorDecorations
 * @returns {void}
 */
function applyDecorations(openedFile, colorDecorations) {
  /** @type {vscode.TextEditor}*/
  const activeEditor = vscode.window.activeTextEditor;

  if (activeEditor && activeEditor.document === openedFile) {
    if (colorDecorationType) {
      activeEditor.setDecorations(colorDecorationType, []);
    }

    /** @type {vscode.TextEditorDecorationType} */
    colorDecorationType = vscode.window.createTextEditorDecorationType({});
    activeEditor.setDecorations(colorDecorationType, colorDecorations);
  }
}

/**
 * Create a decoration object
 * @function createDecoration
 * @param {vscode.TextDocument} openedFile
 * @param {number} startIndex
 * @param {number} length
 * @param {string} backgroundColor
 * @returns {vscode.DecorationOptions}
 */
function createDecoration(openedFile, startIndex, length, backgroundColor) {
  /** @type {vscode.Position} */
  const start = openedFile.positionAt(startIndex);

  /** @type {vscode.Position} */
  const end = openedFile.positionAt(startIndex + length);

  /** @type {vscode.Range} */
  const range = new vscode.Range(start, end);

  return {
    range: range,
    renderOptions: {
      after: {
        contentText: "",
        backgroundColor: backgroundColor,
        border: "1px solid #000",
        width: "16px",
        height: "16px",
        margin: "0 5px",
      },
    },
  };
}

/**
 * Create a hex color decoration
 * @function createHexDecoration
 * @param {vscode.TextDocument} openedFile
 * @param {RegExpMatchArray} match
 * @returns {vscode.DecorationOptions}
 * */
function createHexDecoration(openedFile, match) {
  return createDecoration(openedFile, match.index, match[0].length, match[0]);
}

/**
 * Create a rgba color decoration
 * @function createRgbaDecoration
 * @param {vscode.TextDocument} openedFile
 * @param {RegExpMatchArray} match
 * @returns {vscode.DecorationOptions}
 */
function createRgbaDecoration(openedFile, match) {
  return createDecoration(openedFile, match.index, match[0].length, match[0]);
}

/**
 * Create a hsl color decoration
 * @function createHslDecoration
 * @param {vscode.TextDocument} openedFile
 * @param {RegExpMatchArray} match
 * @returns {vscode.DecorationOptions}
 */
function createHslDecoration(openedFile, match) {
  const [h, s, l] = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  const [r, g, b] = hslToRgb(h, s / 100, l / 100);
  const rgbColor = `rgb(${r}, ${g}, ${b})`;
  return createDecoration(openedFile, match.index, match[0].length, rgbColor);
}

/**
 * Create a hsla color decoration
 * @function createHslaDecoration
 * @param {vscode.TextDocument} openedFile
 * @param {RegExpMatchArray} match
 * @returns {vscode.DecorationOptions}
 */
function createHslaDecoration(openedFile, match) {
  const [h, s, l, a] = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), parseFloat(match[4])];
  const [r, g, b] = hslToRgb(h, s / 100, l / 100);
  const rgbaColor = `rgba(${r}, ${g}, ${b}, ${a})`;
  return createDecoration(openedFile, match.index, match[0].length, rgbaColor);
}

/**
 * Convert HSL to RGB color
 * @function hslToRgb
 * @param {number} h
 * @param {number} s
 * @param {number} l
 * @returns {number[]}
*/
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // Achromatic
  } else {
    /**
     * @param {number} p
     * @param {number} q
     * @param {number} t
     * @returns {number}
    */
    const hueToRgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h / 360 + 1 / 3);
    g = hueToRgb(p, q, h / 360);
    b = hueToRgb(p, q, h / 360 - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function deactivate() {

}

module.exports = {
  activate,
  deactivate,
};