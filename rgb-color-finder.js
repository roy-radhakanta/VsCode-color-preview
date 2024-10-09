'use strict';
const vscode = require('vscode');

/** @type {RegExp} */
const rgbaColorRegex =
    /rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(,\s*(0?\.\d+|1|0))?\)/g;

/**
 * @function RGBColorFinder
 * @param {string} text
 * @param {vscode.TextDocument} openedFile
 * @returns {vscode.DecorationOptions[]}
 * */

function RGBColorFinder(text, openedFile) {
    /** @type {vscode.DecorationOptions[]} */
    const colorDecorations = [];

    /** @type {RegExpExecArray[]} */
    const rgbaMatches = [...text.matchAll(rgbaColorRegex)];

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

    return colorDecorations;
}

module.exports = RGBColorFinder;