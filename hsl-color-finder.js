'use strict'
const vscode = require('vscode');
const { hslToRgb } = require('./utility');

/** @type {RegExp} */
const hslColorRegex = /hsl\((\d{1,3}),\s*(\d{1,3}%)\s*,\s*(\d{1,3}%)\)/g;

/**
 * @function HSLColorFinder
 * @param {string} text
 * @param {vscode.TextDocument} openedFile
 * @returns {vscode.DecorationOptions[]}
 * */

function HSLColorFinder(text, openedFile) {

    /** @type {RegExpExecArray[]} */
    const hslMatches = [...text.matchAll(hslColorRegex)];

    /** @type {vscode.DecorationOptions[]} */
    const colorDecorations = [];


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

    return colorDecorations;
}

module.exports = HSLColorFinder;