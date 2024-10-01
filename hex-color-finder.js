'use strict'
const vscode = require('vscode');

/** @type {RegExp} */
const hexColorRegex = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;

/**
 * @function HEXColorFinder
 * @param {string} text
 * @param {vscode.TextDocument} openedFile
 * @returns {vscode.DecorationOptions[]}
 * */

function HEXColorFinder(text, openedFile) {
    /** @type {RegExpExecArray[]} */
    const hexMatches = [...text.matchAll(hexColorRegex)];

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

    return colorDecorations;
}

module.exports = HEXColorFinder;