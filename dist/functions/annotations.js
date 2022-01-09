"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toggleSpanAnnotation = exports.importSpanAnnotations = exports.exportSpanAnnotations = void 0;

require("core-js/modules/es.array.reduce.js");

require("core-js/modules/web.dom-collections.iterator.js");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const createId = annotation => {
  return annotation.variable + "|" + annotation.value;
};

const exportSpanAnnotations = function exportSpanAnnotations(annotations, tokens) {
  let SpanAndText = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  // export annotations from the object format (for fast use in the annotator) to array format
  if (Object.keys(annotations).length === 0) return [];
  const uniqueAnnotations = Object.keys(annotations).reduce((un_ann, index) => {
    const ann = annotations[index];

    for (let id of Object.keys(ann)) {
      //const endIndex = if (index === 'unit' ? index : )
      if (index !== "unit") if (ann[id].index !== ann[id].span[0]) continue;
      const ann_obj = {
        variable: ann[id].variable,
        value: ann[id].value,
        field: ann[id].field,
        offset: ann[id].offset,
        length: ann[id].length
      };

      if (SpanAndText) {
        const span = ann[id].span;
        const text = tokens.slice(span[0], span[1] + 1).map((t, i) => {
          let string = t.text;
          if (i > 0) string = t.pre + string;
          if (i < span[1] - span[0]) string = string + t.post;
          return string;
        }).join("");
        ann_obj["text"] = text;
        ann_obj["token_span"] = span;
      }

      un_ann.push(ann_obj);
    }

    return un_ann;
  }, []);
  return uniqueAnnotations;
};

exports.exportSpanAnnotations = exportSpanAnnotations;

const importSpanAnnotations = function importSpanAnnotations(annotationsArray, tokens) {
  let currentAnnotations = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  if (annotationsArray.length === 0) return _objectSpread({}, currentAnnotations); // import span annotations. Uses the offset to match annotations to tokens

  const importedAnnotations = prepareSpanAnnotations(annotationsArray);
  let trackAnnotations = {};
  let matchedAnnotations = [];

  for (let token of tokens) {
    findMatches(token, importedAnnotations, trackAnnotations, matchedAnnotations);
  }

  const codeCounter = {};
  const annArray = [];

  for (let matchedAnnotation of matchedAnnotations) {
    if (!codeCounter[matchedAnnotation.id]) codeCounter[matchedAnnotation.id] = 0;
    codeCounter[matchedAnnotation.id]++;
    annArray.push(matchedAnnotation);
  }

  let addAnnotations = [];

  for (let ann of annArray) {
    for (let i = ann.span[0]; i <= ann.span[1]; i++) {
      let newAnnotation = _objectSpread({}, ann);

      newAnnotation.index = i;
      addAnnotations.push(newAnnotation);
    }
  }

  for (let ann of annArray) {
    currentAnnotations = toggleSpanAnnotation(currentAnnotations, ann, false, false);
  }

  return currentAnnotations;
};

exports.importSpanAnnotations = importSpanAnnotations;

const toggleSpanAnnotation = (annotations, newAnnotation, rm, keep_empty) => {
  // Add span annotations in a way that prevents double assignments of the same group to a token
  const id = createId(newAnnotation);

  for (let index = newAnnotation.span[0]; index <= newAnnotation.span[1]; index++) {
    // Check if there exists an annotation with the same variable+value at this position and if so delete it
    if (annotations[index]) {
      if (annotations[index][id]) {
        // if an annotation with the same id exists, iterating over it's span to remove entirely
        const old = annotations[index][id];
        const span = old.span;

        for (let i = span[0]; i <= span[1]; i++) {
          // since we go from the span, we are actually certain the annotation exists at these indices
          // but we just double check for stability
          if (annotations[i]) {
            if (annotations[i][id]) {
              if (keep_empty && Object.values(annotations[i]).filter(a => a.variable === old.variable).length === 1) {
                annotations[i][createId(_objectSpread(_objectSpread({}, old), {}, {
                  value: "EMPTY"
                }))] = _objectSpread(_objectSpread({}, annotations[i][id]), {}, {
                  value: "EMPTY"
                });
              }

              delete annotations[i][id];

              if (Object.keys(annotations[i]).length === 0) {
                // if there are no annotations for this position left, delete the entry
                delete annotations[i];
              }
            }
          }
        }
      }
    }

    if (!rm) {
      // add the annotation
      if (!annotations[index]) annotations[index] = {};
      delete annotations[index][createId(_objectSpread(_objectSpread({}, newAnnotation), {}, {
        value: "EMPTY"
      }))];
      annotations[index][id] = {
        index: index,
        variable: newAnnotation.variable,
        span: [newAnnotation.span[0], newAnnotation.span[1]],
        length: newAnnotation.length,
        value: newAnnotation.value,
        field: newAnnotation.field,
        offset: newAnnotation.offset
      };
    }
  }

  return annotations;
};

exports.toggleSpanAnnotation = toggleSpanAnnotation;

const prepareSpanAnnotations = annotations => {
  if (!annotations || annotations === "") return {}; // create an object where the key is a field+offset, and the
  // value is an array that tells which ids (variable|value) start and end there
  // used in Tokens for matching to token indices

  return annotations.reduce((obj, ann) => {
    if (!obj[ann.field]) obj[ann.field] = {};
    if (!obj[ann.field][ann.offset]) obj[ann.field][ann.offset] = {
      start: [],
      end: []
    };
    if (!obj[ann.field][ann.offset + ann.length - 1]) obj[ann.field][ann.offset + ann.length - 1] = {
      start: [],
      end: []
    };
    obj[ann.field][ann.offset].start.push(ann); // for the starting point the full annotation is given, so that we have all the information

    obj[ann.field][ann.offset + ann.length - 1].end.push(createId(ann)); // for the ending point we just need to know the id

    return obj;
  }, {});
};

const findMatches = (token, importedAnnotations, trackAnnotations, matchedAnnotations) => {
  const start = token.offset;
  const end = token.offset + token.length - 1;
  if (!importedAnnotations[token.field]) return;
  const fieldAnnotations = importedAnnotations[token.field];

  for (let i = start; i <= end; i++) {
    if (fieldAnnotations[i]) {
      for (let annotation of fieldAnnotations[i].start) {
        const id = createId(annotation);
        trackAnnotations[id] = _objectSpread(_objectSpread({}, token), {}, {
          id,
          variable: annotation.variable,
          value: annotation.value,
          offset: annotation.offset,
          length: null,
          span: [token.index]
        });
      }

      for (let id of fieldAnnotations[i].end) {
        if (!trackAnnotations[id]) continue;
        trackAnnotations[id].span.push(token.index);
        trackAnnotations[id].length = token.offset + token.length - trackAnnotations[id].offset;
        matchedAnnotations.push(trackAnnotations[id]);
        delete trackAnnotations[id];
      }
    }
  }
};