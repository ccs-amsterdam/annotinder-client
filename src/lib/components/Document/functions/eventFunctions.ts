import {
  SetState,
  Token,
  TokenSelection,
  Mover,
  TriggerSelectionPopup,
  Arrowkeys,
} from "../../../types";
import { moveUp, moveDown } from "../../../functions/refNavigation";
import { keepInView } from "../../../functions/scroll";
import getToken from "./getToken";

const arrowkeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];

export function onKeyUp(
  event: KeyboardEvent,
  tokens: Token[],
  holdSpace: boolean,
  setHoldSpace: SetState<boolean>,
  setHoldArrow: SetState<Arrowkeys>,
  tokenSelection: TokenSelection,
  setMover: SetState<Mover>,
  triggerSelectionPopup: TriggerSelectionPopup
) {
  // keep track of which buttons are pressed in the state
  if (event.keyCode === 32 && holdSpace) {
    setHoldSpace(false);
    if (tokenSelection.length > 0) {
      annotationFromSelection(tokens, tokenSelection, triggerSelectionPopup);
    }
    return;
  }
  if (arrowkeys.includes(event.key)) {
    setHoldArrow(null);
    setMover(null);
  }
}
export function onKeyDown(
  event: KeyboardEvent,
  tokens: Token[],
  currentToken: { i: number },
  setHoldSpace: SetState<boolean>,
  setHoldArrow: SetState<Arrowkeys>,
  setMover: SetState<Mover>
) {
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
      counter: 1,
    });
    setHoldArrow(event.key as Arrowkeys);
  }
}

export function storeMouseTokenSelection(
  currentNode: any,
  tokens: Token[],
  setCurrentToken: SetState<{ i: number }>,
  setTokenSelection: SetState<TokenSelection>
) {
  // select tokens that the mouse/touch is currently pointing at
  setCurrentToken((state) => {
    if (state.i === currentNode.index) return state;
    return { i: currentNode.index };
  });
  setTokenSelection((state: TokenSelection) =>
    updateSelection(state, tokens, currentNode.index, true)
  );
  return currentNode.index;
}

export function onTouchDown(event: TouchEvent, tokens: Token[], isTouch: any, touch: any) {
  isTouch.current = true;
  // store token from touch down, but process on touch up, so that we cna set a max
  // time passed (to ignore holding touch when scrolling)
  touch.current = { time: new Date(), token: getToken(tokens, event) };
}

export function onTouchUp(
  event: TouchEvent,
  tokens: Token[],
  editMode: boolean,
  tokenSelection: TokenSelection,
  setCurrentToken: SetState<{ i: number }>,
  setTokenSelection: SetState<TokenSelection>,
  triggerSelectionPopup: TriggerSelectionPopup,
  touch: any,
  tapped: any
) {
  if (!touch.current?.time) return;
  const now = new Date();
  const timepassed = now.getTime() - touch.current.time.getTime();
  if (timepassed > 150) return;
  const token = touch.current.token;

  if (token?.index === null) {
    rmTapped(tokens, tapped.current);
    tapped.current = null;
    setTokenSelection((state: TokenSelection) => (state.length === 0 ? state : []));
    return;
  }

  // should only prevent default after confirming a token is selected, otherwise
  // any other touch events are disabled
  event.preventDefault();

  if (editMode) {
    annotationFromSelection(tokens, [token.index, token.index], triggerSelectionPopup);
    return;
  }

  // first check if there is a tokenselection (after double tab). If so, this completes the selection
  if (tokenSelection.length > 0 && tokenSelection[0] === tapped.current) {
    // if a single token, and an annotation already exists, open create/edit mode
    const currentNode: number = storeMouseTokenSelection(
      token,
      tokens,
      setCurrentToken,
      setTokenSelection
    );
    setTokenSelection((state: TokenSelection) => updateSelection(state, tokens, currentNode, true));

    if (token?.annotated && currentNode === tokenSelection[0]) {
      annotationFromSelection(tokens, [currentNode, currentNode], triggerSelectionPopup);
    } else {
      annotationFromSelection(tokens, [tokenSelection[0], currentNode], triggerSelectionPopup);
    }
    rmTapped(tokens, tapped.current);
    tapped.current = null;
    setCurrentToken({ i: null });
    return;
  }

  // otherwise, handle the double tab (on the same token) for starting the selection
  if (tapped.current !== token.index) {
    rmTapped(tokens, tapped.current);
    addTapped(tokens, token.index);
    tapped.current = token.index;
    setCurrentToken({ i: token.index });
    setTokenSelection((state: TokenSelection) => (state.length === 0 ? state : []));
  } else {
    rmTapped(tokens, tapped.current);
    setTokenSelection([token.index, token.index]);
  }
}

export function onMouseMove(
  event: MouseEvent,
  tokens: Token[],
  editMode: boolean,
  setCurrentToken: SetState<{ i: number }>,
  setTokenSelection: SetState<TokenSelection>,
  istouch: any,
  selectionStarted: any
) {
  // If mousemove only happens if mouse is used (which you can't be sure of, because chaos),
  // this would work to prevent odd cases where a touchscreen could disable mouse
  //if (istouch.current) return;
  istouch.current = false;

  // When selection started (mousedown), select tokens hovered over
  if (!editMode && selectionStarted.current) {
    const button = event.which || event.button;
    if (button !== 1 && button !== 0) return null;
    window.getSelection().empty();
    storeMouseTokenSelection(getToken(tokens, event), tokens, setCurrentToken, setTokenSelection);
  } else {
    let currentNode = getToken(tokens, event);
    if (currentNode.index !== null) {
      setCurrentToken((state) => {
        if (state.i === currentNode.index) return state;
        return { i: currentNode.index };
      });
      setTokenSelection((state: TokenSelection) =>
        updateSelection(state, tokens, currentNode.index, false)
      );
    } else
      setCurrentToken((state) => {
        if (state.i === currentNode.index || currentNode.index === null) return state;
        return { i: currentNode.index };
      });
  }
}

export function onMouseDown(
  event: MouseEvent,
  setTokenSelection: SetState<TokenSelection>,
  istouch: any,
  selectionStarted: any
) {
  if (istouch.current) return; // suppress mousedown triggered by quick tap
  // When left button pressed, start new selection
  const button = event.which || event.button;
  if (button === 1) {
    selectionStarted.current = true;
    setTokenSelection((state: TokenSelection) => (state?.[0] ? [state[0], state[0]] : state));
  }
}

export function onMouseUp(
  event: MouseEvent,
  tokens: Token[],
  tokenSelection: TokenSelection,
  setCurrentToken: SetState<{ i: number }>,
  setTokenSelection: SetState<TokenSelection>,
  triggerSelectionPopup: TriggerSelectionPopup,
  istouch: any,
  selectionStarted: any
) {
  if (istouch.current) return;
  // When left mouse key is released, create the annotation
  // note that in case of a single click, the token has not been selected (this happens on move)
  // so this way a click can still be used to open
  const button = event.which || event.button;
  if (button !== 1 && button !== 0) return null;

  // can these be disabled? Does this solve the mac issue? (slider getting stuck on click)
  event.preventDefault();
  event.stopPropagation();

  const currentNode = storeMouseTokenSelection(
    getToken(tokens, event),
    tokens,
    setCurrentToken,
    setTokenSelection
  );
  window.getSelection().empty();
  //setHoldMouseLeft(false);
  selectionStarted.current = false;

  // storeMouseTokenSelection does save position to tokenSelection state, but this isn't
  // yet updated within this scope. This results in single clicks (without mousemove)
  // not registering. So if there is no current selection, directly use currentNode as position.
  if (tokenSelection.length > 0 && tokenSelection[0] !== null && tokenSelection[1] !== null) {
    if (!currentNode && tokenSelection[0] === tokenSelection[1]) return;
    annotationFromSelection(tokens, tokenSelection, triggerSelectionPopup);
  } else {
    if (currentNode === null) return;
    annotationFromSelection(tokens, [currentNode, currentNode], triggerSelectionPopup);
  }
}

export function onContextMenu(event: MouseEvent, tokens: Token[]) {
  const token = getToken(tokens, event);
  if (token?.index) {
    event.stopPropagation();
    event.preventDefault();
  }
  //console.log(token);
}

export const movePosition = (
  tokens: Token[],
  key: Arrowkeys,
  mover: Mover,
  space: boolean,
  editMode: boolean,
  setCurrentToken: SetState<{ i: number }>,
  setTokenSelection: SetState<TokenSelection>
) => {
  let newPosition: number;
  if (!editMode) {
    newPosition = moveToken(tokens, key, space, mover);
  } else {
    newPosition = moveAnnotation(tokens, key, mover);
  }

  if (mover.position !== newPosition) {
    setCurrentToken((state) => {
      if (state.i === newPosition) return state;
      return { i: newPosition };
    });
    setTokenSelection((state: TokenSelection) =>
      updateSelection(state, tokens, newPosition, !editMode && space)
    );

    const containerRef = tokens[newPosition].containerRef.current;
    const tokenRef = tokens[newPosition].ref.current;
    keepInView(containerRef, tokenRef);

    // const down = key === "ArrowRight" || key === "ArrowDown";
    // tokens[newPosition].ref.current.scrollIntoView(false, {
    //   block: down ? "start" : "end",
    // });
  }
  return newPosition;
};

const annotationFromSelection = (
  tokens: Token[],
  selection: TokenSelection,
  triggerSelectionPopup: TriggerSelectionPopup
) => {
  let [from, to] = selection;
  if (to === null) to = from;
  triggerSelectionPopup(tokens[to].index, [tokens[from].index, tokens[to].index]);
};

const moveToken = (tokens: Token[], key: Arrowkeys, space: boolean, mover: Mover) => {
  let newPosition = mover.position;

  if (key === "ArrowRight") newPosition++;
  if (key === "ArrowLeft") newPosition--;
  if (key === "ArrowUp") newPosition = moveSentence(tokens, mover, "up");
  if (key === "ArrowDown") newPosition = moveSentence(tokens, mover, "down");

  if (newPosition > mover.ntokens) newPosition = mover.ntokens;
  if (newPosition < 0) newPosition = 0;

  if (tokens[newPosition]?.ref == null) {
    if (key === "ArrowLeft" || key === "ArrowUp") {
      const firstUnit = tokens.findIndex((token) => token.codingUnit);
      if (firstUnit < 0) return mover.position;
      newPosition = firstUnit;
    }
    if (key === "ArrowRight" || key === "ArrowDown") {
      const cu = tokens.map((token) => token.codingUnit);
      const firstAfterUnit = cu.lastIndexOf(true);
      if (firstAfterUnit < 0) return mover.position;
      newPosition = firstAfterUnit - 1;
    }
  }

  if (space) {
    // limit selection to current field
    if (tokens[mover.position].field !== tokens[newPosition].field) {
      if (newPosition > mover.position) {
        for (let i = newPosition; i >= mover.position; i--)
          if (tokens[i].field === tokens[mover.position].field) {
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

const moveAnnotation = (tokens: Token[], key: Arrowkeys, mover: Mover) => {
  let newPosition = mover.position;

  if (key === "ArrowRight" || key === "ArrowDown") {
    const nextAnnotation = tokens.findIndex(
      (token, i) =>
        i > newPosition &&
        token?.ref?.current.classList.contains("annotated") &&
        (token?.ref?.current.classList.contains("allLeft") ||
          token?.ref?.current.classList.contains("anyLeft"))
    );
    if (nextAnnotation < 0) return mover.position;
    newPosition = nextAnnotation;
  }
  if (key === "ArrowLeft" || key === "ArrowUp") {
    let prevAnnotation = -1;
    // look for
    for (let i = newPosition - 1; i >= -1; i--) {
      const annotated = tokens[i]?.ref?.current.classList.contains("annotated");
      if (!annotated) continue;
      const allLeft = tokens[i]?.ref?.current.classList.contains("allLeft");
      const anyLeft = tokens[i]?.ref?.current.classList.contains("anyLeft");
      if (!allLeft && !anyLeft) continue;
      prevAnnotation = i;
      break;
    }
    if (prevAnnotation < 0) return mover.position;
    newPosition = prevAnnotation;
  }
  return newPosition;
};

const moveSentence = (tokens: Token[], mover: Mover, direction = "up") => {
  // moving sentences is a bit tricky, but we can do it via the refs to the
  // token spans, that provide information about the x and y values

  if (tokens[mover.position]?.ref == null || tokens[mover.startposition]?.ref == null) {
    const firstUnit = tokens.findIndex((token) => token.codingUnit);
    return firstUnit < 0 ? 0 : firstUnit;
  }

  if (direction === "up") {
    return moveUp(tokens, mover.position, mover.startposition);
  }
  if (direction === "down") {
    return moveDown(tokens, mover.position, mover.startposition);
  }
};

const addTapped = (tokens: Token[], i: number) => {
  const ref = tokens?.[i]?.ref;
  if (ref?.current) ref.current.classList.add("tapped");
};

const rmTapped = (tokens: Token[], i: number) => {
  const ref = tokens?.[i]?.ref;
  if (ref?.current) ref.current.classList.remove("tapped");
};

const returnSelectionIfChanged = (selection: TokenSelection, newSelection: TokenSelection) => {
  // if it hasn't changed, return old to prevent updating the state
  if (
    newSelection.length > 0 &&
    selection[0] === newSelection[0] &&
    selection[1] === newSelection[1]
  ) {
    return selection;
  }
  return newSelection;
};

const updateSelection = (
  selection: TokenSelection,
  tokens: Token[],
  index: number,
  add: boolean
) => {
  if (index === null) return selection;
  let newSelection: TokenSelection = [...selection];

  if (!add || newSelection.length === 0) return returnSelectionIfChanged(selection, [index, null]);
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
