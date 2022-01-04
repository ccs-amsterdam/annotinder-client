"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prepareDocument = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

var _tokens = require("./tokens");

var _annotations = require("./annotations");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const prepareDocument = function prepareDocument(document) {
  let codes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  const doc = _objectSpread({}, document);

  if (doc.tokens) {
    doc.importedTokens = true;
    doc.tokens = (0, _tokens.importTokens)(document.tokens);
  } else {
    doc.importedTokens = false;
    if (!doc.text_fields && doc.text) doc.text_fields = [{
      name: "text",
      value: doc.text
    }];
    doc.tokens = (0, _tokens.parseTokens)([...doc.text_fields]);
  }

  doc.meta_fields = document.meta_fields || [];

  if (doc.tokens.length > 0) {
    doc.n_paragraphs = doc.tokens[doc.tokens.length - 1].paragraph;
    doc.n_sentences = doc.tokens[doc.tokens.length - 1].sentence;
  } else {
    doc.n_paragraphs = 0;
    doc.n_sentences = 0;
  } // ImportSpanAnnotations transforms the array format annotations to an object format.
  // More importantly, it matches the annotations to token indices (based on the char offset)


  if (doc.annotations) {
    doc.annotations = (0, _annotations.importSpanAnnotations)([...doc.annotations], doc.tokens);
  } else doc.annotations = {};

  const tokenAnnotations = (0, _tokens.importTokenAnnotations)(doc.tokens, codes); // also fills codes

  if (tokenAnnotations.length > 0) doc.annotations = (0, _annotations.importSpanAnnotations)(tokenAnnotations, doc.tokens, doc.annotations);
  return doc;
};

exports.prepareDocument = prepareDocument;