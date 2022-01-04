"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getColorGradient = exports.getColor = void 0;

require("core-js/modules/es.array.reduce.js");

/**
 * Get the color from the codeMap for a given annotation value/code.
 *
 * @param {*} annotationCode  annotation value/code
 * @param {*} codeMap         object with annotation values as keys, where values are objects with (at least) a color field
 * @returns
 */
const getColor = (annotationCode, codeMap) => {
  if (codeMap[annotationCode]) {
    const foldTo = codeMap[annotationCode].foldToParent;
    if (foldTo && codeMap[foldTo]) return codeMap[foldTo].color + "50";
    return codeMap[annotationCode].color + "50";
  } else {
    if (annotationCode === "EMPTY") return "lightgrey";
    return "#ffffff50";
  }
};
/**
 * Create a gradient for a given array of colors
 *
 * @param {*} colors ...you know, colors
 * @returns
 */


exports.getColor = getColor;

const getColorGradient = colors => {
  if (colors.length === 0) return "white";
  if (colors.length === 1) return colors[0];
  const pct = Math.floor(100 / colors.length);
  const gradColors = colors.reduce((a, color, i) => {
    if (i === 0) a.push(color + " ".concat(pct, "%"));
    if (i === colors.length - 1) a.push(color + " ".concat(100 - pct, "%"));

    if (i > 0 && i < colors.length - 1) {
      a.push(color + " ".concat(pct * i, "%"));
      a.push(color + " ".concat(pct * (i + 1), "%"));
    }

    return a;
  }, []);
  return "linear-gradient(to bottom, ".concat(gradColors.join(", "), ")");
};

exports.getColorGradient = getColorGradient;