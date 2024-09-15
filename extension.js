
const vscode = require("vscode");

const RGBColorFinder = require('./rgb-color-finder');
const HEXColorFinder = require('./hex-color-finder');
const HSLColorFinder = require('./hsl-color-finder');
const NamedColorFinder = require('./named-color-finder');

const { mergeDecorationArrays } = require('./utility');

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
        "Color Preview is ow ready to work 🚀"
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
  let colorDecorations = [];

  const rgbDecorations = RGBColorFinder(text, openedFile);
  const hexDecorations = HEXColorFinder(text, openedFile);
  const hslDecorations = HSLColorFinder(text, openedFile);
  const namedDecorations = NamedColorFinder(text, openedFile);

  colorDecorations = mergeDecorationArrays([rgbDecorations, hexDecorations, hslDecorations, namedDecorations]);

  hslaMatches.forEach((match) => {
    /** @type {vscode.Position} */
    const start = openedFile.positionAt(match.index);

    /** @type {vscode.Position} */
    const end = openedFile.positionAt(match.index + match[0].length);

    /** @type {vscode.Range} */
    const range = new vscode.Range(start, end);

    const [h, s, l, a] = [
      parseInt(match[1]),
      parseInt(match[2]),
      parseInt(match[3]),
      parseFloat(match[4]),
    ];

    const [r, g, b] = hslToRgb(h, s / 100, l / 100);
    const rgbColor = `rgba(${r}, ${g}, ${b}, ${a})`;

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


function deactivate() {

}

module.exports = {
  activate,
  deactivate,
};