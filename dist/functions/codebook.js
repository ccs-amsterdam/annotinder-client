"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.standardizeCodes = exports.getCodeTreeArray = exports.codeBookEdgesToMap = void 0;

require("core-js/modules/es.array.reduce.js");

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.array.reverse.js");

var _randomcolor = _interopRequireDefault(require("randomcolor"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const standardizeCodes = codes => {
  return codes.map((code, i) => {
    if (typeof code !== "object") code = {
      code
    };
    if (code.active == null) code.active = true;
    if (code.tree == null) code.tree = [];
    if (code.parent == null) code.parent = "";
    if (code.makes_irrelevant == null) code.makes_irrelevant = [];
    if (typeof code.makes_irrelevant !== "object") code.makes_irrelevant = [code.makes_irrelevant];
    if (code.required_for == null) code.required_for = [];
    if (typeof code.required_for !== "object") code.required_for = [code.required_for];
    if (code.color == null) code.color = (0, _randomcolor.default)({
      seed: code.code,
      luminosity: "light"
    });
    return code;
  });
};

exports.standardizeCodes = standardizeCodes;

const codeBookEdgesToMap = codes => {
  const standardizedCodes = standardizeCodes(codes); // the payload is an array of objects, but for efficients operations
  // in the annotator we convert it to an object with the codes as keys

  const codeMap = standardizedCodes.reduce((result, code) => {
    result[code.code] = _objectSpread(_objectSpread({}, code), {}, {
      children: [],
      totalChildren: 0,
      totalActiveChildren: 0
    });
    return result;
  }, {}); // If there are codes of which the parent doesn't exist, add the parent

  const originalKeys = Object.keys(codeMap);

  for (const key of originalKeys) {
    if (codeMap[key].parent !== "" && !codeMap[codeMap[key].parent]) {
      codeMap[codeMap[key].parent] = {
        code: codeMap[key].parent,
        parent: "",
        children: [],
        active: false,
        totalChildren: 0,
        totalActiveChildren: 0
      };
    }
  }

  for (const code of Object.keys(codeMap)) {
    [codeMap[code].tree, codeMap[code].activeParent, codeMap[code].foldToParent] = parentData(codeMap, code);
    if (codeMap[code].parent) codeMap[codeMap[code].parent].children.push(code);

    for (const parent of codeMap[code].tree) {
      codeMap[parent].totalChildren++;

      if (codeMap[code].active && codeMap[code].activeParent) {
        codeMap[parent].totalActiveChildren++;
      }
    }
  }

  return codeMap;
};

exports.codeBookEdgesToMap = codeBookEdgesToMap;

const getCodeTreeArray = (codeMap, showColors) => {
  let parents = Object.keys(codeMap).filter(code => !codeMap[code].parent || codeMap[code].parent === "");
  const codeTreeArray = [];
  fillCodeTreeArray(codeMap, parents, codeTreeArray, [], showColors);
  return codeTreeArray.map((object, i) => _objectSpread(_objectSpread({}, object), {}, {
    i: i
  }));
};

exports.getCodeTreeArray = getCodeTreeArray;

const fillCodeTreeArray = (codeMap, parents, codeTreeArray, codeTrail, showColors) => {
  for (const code of parents) {
    let newcodeTrail = [...codeTrail];
    newcodeTrail.push(code);
    codeTreeArray.push(_objectSpread(_objectSpread({}, codeMap[code]), {}, {
      code: code,
      codeTrail: codeTrail,
      level: codeTrail.length,
      color: codeMap[code].color ? codeMap[code].color : (0, _randomcolor.default)({
        seed: code,
        luminosity: "light"
      })
    }));

    if (codeMap[code].children) {
      fillCodeTreeArray(codeMap, codeMap[code].children, codeTreeArray, newcodeTrail, showColors);
    }
  }
};

const parentData = (codeMap, code) => {
  // get array of parents from highest to lowers (tree)
  // look at parents to see if one is not active (activeParent).
  //    (this only matters if the same parent is folded, otherwise only the parent code itself is inactive)
  // look if there are folded parents, and if so pick the highest (foldToParent)
  const parents = [];
  let activeParent = true;
  let foldToParent = "";
  let parent = codeMap[code].parent;

  while (parent) {
    parents.push(parent);

    if (codeMap[parent].folded != null && codeMap[parent].folded) {
      foldToParent = parent; // this ends up being the highest level folded parent
      // code is inactive if only one of the folded parents is inactive

      if (codeMap[parent].active != null && !codeMap[parent].active) activeParent = false;
    }

    parent = codeMap[parent].parent;
  }

  return [parents.reverse(), activeParent, foldToParent];
};