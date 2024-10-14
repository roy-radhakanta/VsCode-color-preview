

const vscode = require("vscode");

const RGBColorFinder = require('./rgb-color-finder');
const HEXColorFinder = require('./hex-color-finder');
const HSLColorFinder = require('./hsl-color-finder');
const HSLAColorFinder = require('./hsla-color-finder');
const NamedColorFinder = require('./named-color-finder');
const {Log}  = require('./utility/log');

const { mergeDecorationArrays } = require('./utility');

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
  const isFirstActivation = context.globalState.get('firstActivation', true);

  if (isFirstActivation) {
    vscode.window.showInformationMessage('Color Preview is Activated 🎉');
    context.globalState.update('firstActivation', false);
    previewColors(vscode.window.activeTextEditor.document);
  }

  const disposable = vscode.commands.registerCommand(
    "color-preview.colorPreview",
    function () {
      const languageSupport = ["scss", "sass", "css", "javascript", "typescript", "typescriptreact", "javascriptreact", "html", "json", "plaintext"];

      // on open
      context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(function (document) {
          Log.DEBUG(document.languageId);
          if (languageSupport.includes(document.languageId)) {
            previewColors(document);
          }
        })
      );

      // on tab change
      context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            // Log.DEBUG(`On change --> ${editor.document.languageId}`);
          if (editor && languageSupport.includes(editor.document.languageId)) {
            previewColors(editor.document);
          }
        })
      );

      // on save
      context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument((document) => {
          // Log.DEBUG(document.languageId);
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

  /** @type {vscode.DecorationOptions[]} */
  let colorDecorations = [];

  const rgbDecorations = RGBColorFinder(text, openedFile);
  const hexDecorations = HEXColorFinder(text, openedFile);
  const hslDecorations = HSLColorFinder(text, openedFile);
  const hslaDecorations = HSLAColorFinder(text, openedFile);
  const namedDecorations = NamedColorFinder(text, openedFile);

  colorDecorations = mergeDecorationArrays([rgbDecorations, hexDecorations, hslDecorations, hslaDecorations, namedDecorations]);

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