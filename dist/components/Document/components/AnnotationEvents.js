"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AnnotationEvents = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.string.includes.js");

require("core-js/modules/es.parse-int.js");

var _react = _interopRequireWildcard(require("react"));

var _scroll = require("../../../functions/scroll");

var _refNavigation = require("../../../functions/refNavigation");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// This component generates no content, but manages navigation for span level annotations
const arrowkeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];
/**
 * This is a hugely elaborate component for managing navigation (key, mouse and touch events)
 * It doesn't acctually render anything, but its shaped as a component because useEffect is just really convenient here
 * You probably never want to read this. And if you do, don't expect my sympathies. Rather, just blame me
 * if anything in here breaks, or ask nicely if we need more features
 */

const AnnotationEvents = _ref => {
  let {
    tokens,
    annotations,
    currentToken,
    setCurrentToken,
    tokenSelection,
    setTokenSelection,
    triggerCodePopup,
    editMode,
    eventsBlocked
  } = _ref;
  // !! Keep in mind that positions are based on token.arrayIndex, not token.index
  // arrayIndex is the actual tokens array, where token.index is the position of the token in the document
  // (these can be different if the text/context does not start at token.index 0)
  const [mover, setMover] = (0, _react.useState)(null);
  const [HoldSpace, setHoldSpace] = (0, _react.useState)(false);
  const [holdArrow, setHoldArrow] = (0, _react.useState)(null);
  (0, _react.useEffect)(() => {
    if (eventsBlocked) {
      setHoldArrow(false);
      setHoldSpace(false);
    } else {//setTokenSelection((state) => (state.length === 0 ? state : []));
    }
  }, [setHoldArrow, setHoldSpace, eventsBlocked, setTokenSelection]); // this adds a function to each token to select and navigate to a token (or span)
  // this can be accessed outside of Document (via returnTokens)

  (0, _react.useEffect)(() => {
    if (!tokens) return;

    for (let token of tokens) token.triggerCodePopup = span => {
      var _token$containerRef, _token$ref;

      if (!span) span = [token.index, token.index];

      if (token !== null && token !== void 0 && (_token$containerRef = token.containerRef) !== null && _token$containerRef !== void 0 && _token$containerRef.current && token !== null && token !== void 0 && (_token$ref = token.ref) !== null && _token$ref !== void 0 && _token$ref.current) {
        token.containerRef.current.style.scrollBehavior = "smooth";
        (0, _scroll.keepInView)(token.containerRef.current, token.ref.current);
      }

      setCurrentToken({
        i: token.index
      });
      setTokenSelection(span);
    };
  }, [tokens, setCurrentToken, setTokenSelection]);
  (0, _react.useEffect)(() => {
    var _tokens$, _tokens$$containerRef;

    // When arrow key is held, walk through tokens with increasing speed
    // this loops itself by updating mover (an object with position information)
    // this is like setIntervall, but allows custom time intervalls,
    if (!mover || !holdArrow || !(tokens !== null && tokens !== void 0 && (_tokens$ = tokens[0]) !== null && _tokens$ !== void 0 && (_tokens$$containerRef = _tokens$.containerRef) !== null && _tokens$$containerRef !== void 0 && _tokens$$containerRef.current)) return;
    let position = movePosition(tokens, annotations, holdArrow, mover, HoldSpace, editMode, setCurrentToken, setTokenSelection);
    let delay;

    if (mover.counter === 1) {
      tokens[0].containerRef.current.style.scrollBehavior = "smooth";
      delay = 150;
    } else {
      tokens[0].containerRef.current.style.scrollBehavior = "auto";
      delay = Math.max(5, 100 / Math.ceil(mover.counter / 5));
    }

    setTimeout(() => {
      setMover({
        position: position,
        startposition: mover.startposition,
        ntokens: mover.ntokens,
        counter: mover.counter + 1
      });
    }, delay);
  }, [tokens, mover, holdArrow, HoldSpace, setCurrentToken, editMode, annotations, setTokenSelection]);
  if (!tokens || tokens.length === 0) return null; // this prevents rendering the components that manage the key and mouse events

  if (eventsBlocked) return null;
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(KeyEvents, {
    tokenSelection: tokenSelection,
    currentToken: currentToken,
    tokens: tokens,
    HoldSpace: HoldSpace,
    setMover: setMover,
    setHoldSpace: setHoldSpace,
    setHoldArrow: setHoldArrow,
    triggerCodePopup: triggerCodePopup,
    editMode: editMode
  }), /*#__PURE__*/_react.default.createElement(MouseEvents, {
    tokenSelection: tokenSelection,
    tokens: tokens,
    setCurrentToken: setCurrentToken,
    setTokenSelection: setTokenSelection,
    triggerCodePopup: triggerCodePopup,
    editMode: editMode
  }));
};

exports.AnnotationEvents = AnnotationEvents;

const KeyEvents = _ref2 => {
  let {
    tokenSelection,
    currentToken,
    tokens,
    HoldSpace,
    setMover,
    setHoldSpace,
    setHoldArrow,
    triggerCodePopup,
    editMode
  } = _ref2;
  // This blocks event listeners when the eventsBlocked state (in redux) is true.
  // This lets us block the key activities in the text (selecting tokens) when
  // the CodeSelector popup is open
  (0, _react.useEffect)(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }); // (see useEffect with 'eventsBlocked' for details on useCallback)

  const onKeyUp = event => {
    // keep track of which buttons are pressed in the state
    if (event.keyCode === 32 && HoldSpace) {
      setHoldSpace(false);

      if (tokenSelection.length > 0) {
        annotationFromSelection(tokens, tokenSelection, triggerCodePopup);
      }

      return;
    }

    if (arrowkeys.includes(event.key)) {
      setHoldArrow(false);
      setMover(null);
    }
  }; // (see useEffect with 'eventsBlocked' for details on useCallback)


  const onKeyDown = event => {
    // key presses, and key holding (see onKeyUp)
    if (event.keyCode === 32) {
      event.preventDefault();
      if (event.repeat) return;
      setHoldSpace(true);
      return;
    }

    if (arrowkeys.includes(event.key)) {
      event.preventDefault();
      if (event.repeat) return;
      setMover({
        position: currentToken.i,
        startposition: currentToken.i,
        ntokens: tokens.length,
        counter: 1
      });
      setHoldArrow(event.key);
    } // if (tokenSelection.length > 0) {
    //   if (tokenSelection[0] === tokenSelection[1]) {
    //     // enter key
    //     if (event.keyCode === 13) {
    //       triggerCodePopup(tokens[tokenSelection[0]].index, null, null);
    //     }
    //   }
    // }

  };

  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null);
};

const MouseEvents = _ref3 => {
  let {
    tokenSelection,
    tokens,
    setCurrentToken,
    setTokenSelection,
    triggerCodePopup,
    editMode
  } = _ref3;
  const selectionStarted = (0, _react.useRef)(false);
  const tapped = (0, _react.useRef)(null);
  const touch = (0, _react.useRef)(null);
  const istouch = (0, _react.useRef)("ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0); // hack to notice if device uses touch (because single touch somehow triggers mouseup)

  (0, _react.useEffect)(() => {
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchstart", onTouchDown);
    window.addEventListener("touchend", onTouchUp);
    window.addEventListener("contextmenu", onContextMenu);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchstart", onTouchDown);
      window.removeEventListener("touchend", onTouchUp);
      window.removeEventListener("contextmenu", onContextMenu);
    };
  });

  const onTouchDown = event => {
    // store token from touch down, but process on touch up, so that we cna set a max
    // time passed (to ignore holding touch when scrolling)
    touch.current = {
      time: new Date(),
      token: getToken(tokens, event)
    };
  };

  const onTouchUp = e => {
    var _touch$current;

    if (!((_touch$current = touch.current) !== null && _touch$current !== void 0 && _touch$current.time)) return;
    const now = new Date();
    const timepassed = now - touch.current.time;
    if (timepassed > 150) return;
    const token = touch.current.token;

    if ((token === null || token === void 0 ? void 0 : token.index) === null) {
      rmTapped(tokens, tapped.current);
      tapped.current = null;
      setTokenSelection(state => state.length === 0 ? state : []);
      return;
    }

    if (editMode) {
      annotationFromSelection(tokens, [token.index, token.index], triggerCodePopup);
      return;
    } // first check if there is a tokenselection (after double tab). If so, this completes the selection


    if (tokenSelection.length > 0 && tokenSelection[0] === tapped.current) {
      // if a single token, and an annotation already exists, open create/edit mode
      const currentNode = storeMouseSelection(token);
      setTokenSelection(state => updateSelection(state, tokens, currentNode, true));

      if (token !== null && token !== void 0 && token.annotated && currentNode === tokenSelection[0]) {
        annotationFromSelection(tokens, [currentNode, currentNode], triggerCodePopup);
      } else {
        annotationFromSelection(tokens, [tokenSelection[0], currentNode], triggerCodePopup);
      }

      rmTapped(tokens, tapped.current);
      tapped.current = null;
      setCurrentToken({
        i: null
      });
      return;
    } // otherwise, handle the double tab (on the same token) for starting the selection


    if (tapped.current !== token.index) {
      rmTapped(tokens, tapped.current);
      addTapped(tokens, token.index);
      tapped.current = token.index;
      setCurrentToken({
        i: token.index
      });
      setTokenSelection(state => state.length === 0 ? state : []);
    } else {
      rmTapped(tapped.current);
      setTokenSelection(state => updateSelection(state, tokens, token.index, true));
    }
  };

  const onMouseDown = event => {
    if (istouch.current) return; // suppress mousedown triggered by quick tap
    // When left button pressed, start new selection

    if (event.which === 1) {
      selectionStarted.current = true;
      setTokenSelection(state => state.length === 0 ? state : []);
    }
  };

  const onMouseMove = event => {
    if (istouch.current) return; // When selection started (mousedown), select tokens hovered over

    if (!editMode && selectionStarted.current) {
      event.preventDefault();
      if (event.which !== 1 && event.which !== 0) return null;
      window.getSelection().empty();
      storeMouseSelection(getToken(tokens, event));
    } else {
      let currentNode = getToken(tokens, event);

      if (currentNode.index !== null) {
        setCurrentToken(state => {
          if (state.i === currentNode.index) return state;
          return {
            i: currentNode.index
          };
        });
        setTokenSelection(state => updateSelection(state, tokens, currentNode.index, false));
      } else setCurrentToken(state => {
        if (state.i === currentNode.index || currentNode.index === null) return state;
        return {
          i: currentNode.index
        };
      });
    }
  };

  const onMouseUp = event => {
    if (istouch.current) return; // When left mouse key is released, create the annotation
    // note that in case of a single click, the token has not been selected (this happens on move)
    // so this way a click can still be used to open

    if (event.which !== 1 && event.which !== 0) return null;
    event.preventDefault();
    event.stopPropagation();
    const currentNode = storeMouseSelection(getToken(tokens, event));
    window.getSelection().empty(); //setHoldMouseLeft(false);

    selectionStarted.current = false; // this worked before, but is not possible due to touchend not registering position
    //if (currentNode === null) return null;
    // storeMouseSelection does save position to tokenSelection state, but this isn't
    // yet updated within this scope. This results in single clicks (without mousemove)
    // not registering. So if there is no current selection, directly use currentNode as position.

    if (tokenSelection.length > 0 && tokenSelection[0] !== null && tokenSelection[1] !== null) {
      annotationFromSelection(tokens, tokenSelection, triggerCodePopup);
    } else {
      if (currentNode !== null) {
        annotationFromSelection(tokens, [currentNode, currentNode], triggerCodePopup);
      }
    }
  };

  const onContextMenu = event => {
    if (event.button === 2) return null;
    event.preventDefault();
    event.stopPropagation();
  };

  const storeMouseSelection = currentNode => {
    // select tokens that the mouse/touch is currently pointing at
    setCurrentToken(state => {
      if (state.i === currentNode.index) return state;
      return {
        i: currentNode.index
      };
    });
    setTokenSelection(state => updateSelection(state, tokens, currentNode.index, true));
    return currentNode.index;
  };

  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null);
};

const annotationFromSelection = (tokens, selection, triggerCodePopup) => {
  let [from, to] = selection;
  if (from > to) [from, to] = [to, from];
  triggerCodePopup(tokens[to].index, [tokens[from].index, tokens[to].index]);
};

const movePosition = (tokens, annotations, key, mover, space, editMode, setCurrentToken, setTokenSelection) => {
  let newPosition;

  if (!editMode) {
    newPosition = moveToken(tokens, key, space, mover);
  } else {
    newPosition = moveAnnotation(tokens, annotations, key, mover);
  }

  if (mover.position !== newPosition) {
    setCurrentToken(state => ({
      i: state === newPosition ? state : newPosition
    }));
    setTokenSelection(state => updateSelection(state, tokens, newPosition, !editMode && space));
    const containerRef = tokens[newPosition].containerRef.current;
    const tokenRef = tokens[newPosition].ref.current;
    (0, _scroll.keepInView)(containerRef, tokenRef); // const down = key === "ArrowRight" || key === "ArrowDown";
    // tokens[newPosition].ref.current.scrollIntoView(false, {
    //   block: down ? "start" : "end",
    // });
  }

  return newPosition;
};

const moveToken = (tokens, key, space, mover) => {
  var _tokens$newPosition;

  let newPosition = mover.position;
  if (key === "ArrowRight") newPosition++;
  if (key === "ArrowLeft") newPosition--;
  if (key === "ArrowUp") newPosition = moveSentence(tokens, mover, "up");
  if (key === "ArrowDown") newPosition = moveSentence(tokens, mover, "down");
  if (newPosition > mover.ntokens) newPosition = mover.ntokens;
  if (newPosition < 0) newPosition = 0;

  if (((_tokens$newPosition = tokens[newPosition]) === null || _tokens$newPosition === void 0 ? void 0 : _tokens$newPosition.ref) == null) {
    if (key === "ArrowLeft" || key === "ArrowUp") {
      const firstUnit = tokens.findIndex(token => token.codingUnit);
      if (firstUnit < 0) return mover.position;
      newPosition = firstUnit;
    }

    if (key === "ArrowRight" || key === "ArrowDown") {
      const cu = tokens.map(token => token.codingUnit);
      const firstAfterUnit = cu.lastIndexOf(true);
      if (firstAfterUnit < 0) return mover.position;
      newPosition = firstAfterUnit - 1;
    }
  }

  if (space) {
    // limit selection to current field
    if (tokens[mover.position].field !== tokens[newPosition].field) {
      if (newPosition > mover.position) {
        for (let i = newPosition; i >= mover.position; i--) if (tokens[i].field === tokens[mover.position].field) {
          newPosition = i;
          break;
        }
      } else {
        for (let i = newPosition; i <= mover.position; i++) {
          if (tokens[i].field === tokens[mover.position].field) {
            newPosition = i;
            break;
          }
        }
      }
    }
  }

  return newPosition;
};

const moveAnnotation = (tokens, annotations, key, mover) => {
  let newPosition = mover.position;

  if (key === "ArrowRight" || key === "ArrowDown") {
    const nextAnnotation = tokens.findIndex((token, i) => {
      var _token$ref2, _token$ref3, _token$ref4;

      return i > newPosition && (token === null || token === void 0 ? void 0 : (_token$ref2 = token.ref) === null || _token$ref2 === void 0 ? void 0 : _token$ref2.current.classList.contains("annotated")) && ((token === null || token === void 0 ? void 0 : (_token$ref3 = token.ref) === null || _token$ref3 === void 0 ? void 0 : _token$ref3.current.classList.contains("allLeft")) || (token === null || token === void 0 ? void 0 : (_token$ref4 = token.ref) === null || _token$ref4 === void 0 ? void 0 : _token$ref4.current.classList.contains("anyLeft")));
    });
    if (nextAnnotation < 0) return mover.position;
    newPosition = nextAnnotation;
  }

  if (key === "ArrowLeft" || key === "ArrowUp") {
    let prevAnnotation = -1; // look for

    for (let i = newPosition - 1; i >= -1; i--) {
      var _tokens$i, _tokens$i$ref, _tokens$i2, _tokens$i2$ref, _tokens$i3, _tokens$i3$ref;

      const annotated = (_tokens$i = tokens[i]) === null || _tokens$i === void 0 ? void 0 : (_tokens$i$ref = _tokens$i.ref) === null || _tokens$i$ref === void 0 ? void 0 : _tokens$i$ref.current.classList.contains("annotated");
      if (!annotated) continue;
      const allLeft = (_tokens$i2 = tokens[i]) === null || _tokens$i2 === void 0 ? void 0 : (_tokens$i2$ref = _tokens$i2.ref) === null || _tokens$i2$ref === void 0 ? void 0 : _tokens$i2$ref.current.classList.contains("allLeft");
      const anyLeft = (_tokens$i3 = tokens[i]) === null || _tokens$i3 === void 0 ? void 0 : (_tokens$i3$ref = _tokens$i3.ref) === null || _tokens$i3$ref === void 0 ? void 0 : _tokens$i3$ref.current.classList.contains("anyLeft");
      if (!allLeft && !anyLeft) continue;
      prevAnnotation = i;
      break;
    }

    if (prevAnnotation < 0) return mover.position;
    newPosition = prevAnnotation;
  }

  return newPosition;
};

const moveSentence = function moveSentence(tokens, mover) {
  var _tokens$mover$positio, _tokens$mover$startpo;

  let direction = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "up";

  // moving sentences is a bit tricky, but we can do it via the refs to the
  // token spans, that provide information about the x and y values
  if (((_tokens$mover$positio = tokens[mover.position]) === null || _tokens$mover$positio === void 0 ? void 0 : _tokens$mover$positio.ref) == null || ((_tokens$mover$startpo = tokens[mover.startposition]) === null || _tokens$mover$startpo === void 0 ? void 0 : _tokens$mover$startpo.ref) == null) {
    const firstUnit = tokens.findIndex(token => token.codingUnit);
    return firstUnit < 0 ? 0 : firstUnit;
  }

  if (direction === "up") {
    return (0, _refNavigation.moveUp)(tokens, mover.position, mover.startposition);
  }

  if (direction === "down") {
    return (0, _refNavigation.moveDown)(tokens, mover.position, mover.startposition);
  }
};

const getToken = (tokens, e) => {
  const [n, annotated] = getNode(tokens, e);
  if (n === null) return {
    index: null,
    annotated: false
  };
  return {
    index: getTokenAttributes(tokens, n),
    annotated
  };
};

const addTapped = (tokens, i) => {
  var _tokens$i4;

  const ref = tokens === null || tokens === void 0 ? void 0 : (_tokens$i4 = tokens[i]) === null || _tokens$i4 === void 0 ? void 0 : _tokens$i4.ref;
  if (ref !== null && ref !== void 0 && ref.current) ref.current.classList.add("tapped");
};

const rmTapped = (tokens, i) => {
  var _tokens$i5;

  const ref = tokens === null || tokens === void 0 ? void 0 : (_tokens$i5 = tokens[i]) === null || _tokens$i5 === void 0 ? void 0 : _tokens$i5.ref;
  if (ref !== null && ref !== void 0 && ref.current) ref.current.classList.remove("tapped");
};

const getNode = (tokens, e) => {
  try {
    var _n, _n$parentNode;

    // sometimes e is Restricted, and I have no clue why,
    // nor how to check this in a condition. hence the try clause
    let n;
    if (e.type === "mousemove" || e.type === "mouseup") n = e.originalTarget || e.path[0];

    if (e.type === "touchmove" || e.type === "touchstart") {
      // stupid hack since someone decided touchmove target is always the starting target (weirdly inconsistent with mousemove)
      // also, this still doesn't work for touchend, which is just arrrggg
      let position = e.touches[0];
      n = document.elementFromPoint(position.clientX, position.clientY);
    }

    if (((_n = n) === null || _n === void 0 ? void 0 : (_n$parentNode = _n.parentNode) === null || _n$parentNode === void 0 ? void 0 : _n$parentNode.className) === "item") {
      return [null, false];
    }

    if (n) {
      if (n.className.includes("token")) {
        return [n, false];
      }

      if (n.parentNode) {
        if (n.parentNode.className.includes("token")) return [n.parentNode, true];
      }
    }

    return [null, false];
  } catch (e) {
    return [null, false];
  }
};

const getTokenAttributes = (tokens, tokenNode) => {
  return parseInt(tokenNode.getAttribute("tokenindex"));
};

const returnSelectionIfChanged = (selection, newSelection) => {
  // if it hasn't changed, return old to prevent updating the state
  if (newSelection.length > 0 && selection[0] === newSelection[0] && selection[1] === newSelection[1]) {
    return selection;
  }

  return newSelection;
};

const updateSelection = (selection, tokens, index, add) => {
  if (index === null) return selection;
  let newSelection = [...selection];
  if (!add || newSelection.length === 0) return returnSelectionIfChanged(selection, [index, index]);
  if (index === null) return returnSelectionIfChanged(selection, [newSelection[0], null]);

  if (tokens[newSelection[0]].field === tokens[index].field) {
    newSelection = [newSelection[0], index];
  } else {
    if (index > newSelection[0]) {
      for (let i = index; i >= newSelection[0]; i--) {
        if (tokens[newSelection[0]].field === tokens[i].field) newSelection = [newSelection[0], i];
      }
    } else {
      for (let i = index; i <= newSelection[0]; i++) {
        if (tokens[newSelection[0]].field === tokens[i].field) newSelection = [newSelection[0], i];
      }
    }
  }

  return returnSelectionIfChanged(selection, newSelection);
};