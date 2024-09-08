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

  const disposable = vscode.commands.registerCommand(
    "color-preview.colorPreview",
    function () {
      const languageSupport = ["scss", "sass", "css", "javascript", "typescript", "typescriptreact", "javascriptreact", "html", "json"];

      // on open
      context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(function (document) {
          if (languageSupport.includes(document.languageId)) {
            previewColors(document);
          }
        })
      );

      // on tab change
      context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor((editor) => {
          //   console.log(editor.document.languageId);
          if (editor && languageSupport.includes(editor.document.languageId)) {
            previewColors(editor.document);
          }
        })
      );

      // on save
      context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument((document) => {
          if (languageSupport.includes(document.languageId)) {
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

  /** @type {RegExp} */
  const hexColorRegex = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;

  /** @type {RegExp} */
  const rgbaColorRegex =
    /rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(,\s*(0?\.\d+|1|0))?\)/g;

  /** @type {RegExp} */
  const hslColorRegex = /hsl\((\d{1,3}),\s*(\d{1,3}%)\s*,\s*(\d{1,3}%)\)/g;

  /** @type {RegExpExecArray[]} */
  const hexMatches = [...text.matchAll(hexColorRegex)];

  /** @type {RegExpExecArray[]} */
  const rgbaMatches = [...text.matchAll(rgbaColorRegex)];

  /** @type {RegExpExecArray[]} */
  const hslMatches = [...text.matchAll(hslColorRegex)];

  /** @type {vscode.DecorationOptions[]} */
  const colorDecorations = [];

  hexMatches.forEach((match) => {
    /** @type {vscode.Position} */
    const start = openedFile.positionAt(match.index);

    /** @type {vscode.Position} */
    const end = openedFile.positionAt(match.index + match[0].length);

    /** @type {vscode.Range} */
    const range = new vscode.Range(start, end);

    colorDecorations.push({
      range: range,
      renderOptions: {
        after: {
          contentText: "",
          backgroundColor: match[0],
          border: "1px solid blue",
          width: "16px",
          height: "16px",
          margin: "0 5px",
        },
      },
    });
  });

  rgbaMatches.forEach((match) => {
    /** @type {vscode.Position} */
    const start = openedFile.positionAt(match.index);

    /** @type {vscode.Position} */
    const end = openedFile.positionAt(match.index + match[0].length);

    /** @type {vscode.Range} */
    const range = new vscode.Range(start, end);

    colorDecorations.push({
      range: range,
      renderOptions: {
        after: {
          contentText: "",
          backgroundColor: match[0],
          border: "1px solid #000",
          width: "16px",
          height: "16px",
          margin: "0 5px",
        },
      },
    });
  });

  hslMatches.forEach((match) => {
    /** @type {vscode.Position} */
    const start = openedFile.positionAt(match.index);

    /** @type {vscode.Position} */
    const end = openedFile.positionAt(match.index + match[0].length);

    /** @type {vscode.Range} */
    const range = new vscode.Range(start, end);

    const [h, s, l] = [
      parseInt(match[1]),
      parseInt(match[2]),
      parseInt(match[3]),
    ];

    const [r, g, b] = hslToRgb(h, s / 100, l / 100);
    const rgbColor = `rgb(${r}, ${g}, ${b})`;

    colorDecorations.push({
      range: range,
      renderOptions: {
        after: {
          contentText: "",
          backgroundColor: rgbColor,
          border: "1px solid #000",
          width: "16px",
          height: "16px",
          margin: "0 5px",
        },
      },
    });
  });

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