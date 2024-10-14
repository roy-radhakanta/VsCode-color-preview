const vscode = require("vscode");

/**
 * @function mergeTwoDecorationArray
 * @param {vscode.DecorationOptions[][]} arrays
 * @returns {vscode.DecorationOptions[]}
 * */
function mergeDecorationArrays(arrays) {
    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const merged = new Array(totalLength);
    let index = 0;

    for (const array of arrays) {
        for (let i = 0; i < array.length; i++) {
            merged[index++] = array[i];
        }
    }

    return merged;
}


/**
 * Convert HSL to RGB color
 * @function hslToRgb
 * @param {number} h
 * @param {number} s
 * @param {number} l
 * @param {number} a
 * @returns {number[]}
*/
function hslToRgb(h, s, l, a = 1) {
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
      a = Math.min(1, Math.max(0, a));
    }
  
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a];
  }

module.exports = {
    mergeDecorationArrays,
    hslToRgb
}