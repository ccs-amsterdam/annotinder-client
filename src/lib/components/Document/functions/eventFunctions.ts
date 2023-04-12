import { SetState, Token, TokenSelection, Mover, TriggerSelector, Arrowkeys } from "../../../types";
import { moveUp, moveDown } from "../../../functions/refNavigation";
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
  triggerSelector: TriggerSelector
) {
  if (event.key === " " && holdSpace) {
    setHoldSpace(false);
    if (tokenSelection.length > 0) {
      annotationFromSelection(tokens, tokenSelection, triggerSelector);
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
  currentToken: number,
  setHoldSpace: SetState<boolean>,
  setHoldArrow: SetState<Arrowkeys>,
  setMover: SetState<Mover>
) {
  if (event.key === " ") {
    event.preventDefault();
    if (event.repeat) return;
    setHoldSpace(true);
    return;
  }
  if (arrowkeys.includes(event.key)) {
    event.preventDefault();
    if (event.repeat) return;
    setMover({
      position: currentToken,
      startposition: currentToken,
      ntokens: tokens.length,
      counter: 1,
    });
    setHoldArrow(event.key as Arrowkeys);
  }
}

export function storeMouseTokenSelection(
  currentNode: any,
  tokens: Token[],
  sameFieldOnly: boolean,
  setCurrentToken: (i: number) => void,
  setTokenSelection: SetState<TokenSelection>
) {
  // select tokens that the mouse/touch is currently pointing at
  setCurrentToken(currentNode.index);
  setTokenSelection((state: TokenSelection) =>
    updateSelection(state, tokens, currentNode.index, true, sameFieldOnly)
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
  currentToken: number,
  tokenSelection: TokenSelection,
  sameFieldOnly: boolean,
  setCurrentToken: (i: number) => void,
  setTokenSelection: SetState<TokenSelection>,
  triggerSelector: TriggerSelector,
  touch: any
) {
  if (!touch.current?.time) return;
  const now = new Date();
  const timepassed = now.getTime() - touch.current.time.getTime();
  if (timepassed > 150) return;
  const token = touch.current.token;

  if (token?.index === null) {
    setTokenSelection((state: TokenSelection) => (state.length === 0 ? state : []));
    return;
  }

  // should only prevent default after confirming a token is selected, otherwise
  // any other touch events are disabled
  event.preventDefault();

  if (editMode) {
    annotationFromSelection(tokens, [token.index, token.index], triggerSelector);
    return;
  }

  // first check if there is a tokenselection. If so, this completes the selection
  if (tokenSelection.length > 0 && tokenSelection[0] === currentToken) {
    // if a single token, and an annotation already exists, open create/edit mode
    const currentNode: number = storeMouseTokenSelection(
      token,
      tokens,
      sameFieldOnly,
      setCurrentToken,
      setTokenSelection
    );

    const newTokenSelection = updateSelection(
      tokenSelection,
      tokens,
      currentNode,
      true,
      sameFieldOnly
    );

    if (newTokenSelection[0] !== currentNode && newTokenSelection[1] !== currentNode) {
      setTokenSelection([currentNode, null]);
      return;
    }

    setTokenSelection(newTokenSelection);
    annotationFromSelection(tokens, newTokenSelection, triggerSelector);

    setCurrentToken(null);
    return;
  }

  setTokenSelection([token.index, token.index]);
  setCurrentToken(token.index);
}

export function onMouseMove(
  event: MouseEvent,
  tokens: Token[],
  editMode: boolean,
  sameFieldOnly: boolean,
  setCurrentToken: (i: number) => void,
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
    storeMouseTokenSelection(
      getToken(tokens, event),
      tokens,
      sameFieldOnly,
      setCurrentToken,
      setTokenSelection
    );
  } else {
    let currentNode = getToken(tokens, event);
    if (currentNode.index !== null) {
      setCurrentToken(currentNode.index);
      setTokenSelection((state: TokenSelection) =>
        updateSelection(state, tokens, currentNode.index, false, sameFieldOnly)
      );
    } else if (!currentNode.index === null) setCurrentToken(currentNode.index);
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
    event.preventDefault();
    selectionStarted.current = true;
    setTokenSelection((state: TokenSelection) => (state?.[0] ? [state[0], state[0]] : state));
  }
}

export function onMouseUp(
  event: MouseEvent,
  tokens: Token[],
  tokenSelection: TokenSelection,
  sameFieldOnly: boolean,
  setCurrentToken: (i: number) => void,
  setTokenSelection: SetState<TokenSelection>,
  triggerSelector: TriggerSelector,
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
    sameFieldOnly,
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
    annotationFromSelection(tokens, tokenSelection, triggerSelector);
  } else {
    if (currentNode === null) return;
    annotationFromSelection(tokens, [currentNode, currentNode], triggerSelector);
  }
}

export function onContextMenu(event: MouseEvent, tokens: Token[]) {
  const token = getToken(tokens, event);
  if (token?.index) {
    event.stopPropagation();
    event.preventDefault();
  }
}

export const movePosition = (
  tokens: Token[],
  key: Arrowkeys,
  mover: Mover,
  space: boolean,
  editMode: boolean,
  sameFieldOnly: boolean,
  setCurrentToken: (i: number) => void,
  setTokenSelection: SetState<TokenSelection>
) => {
  let newPosition: number;
  if (!editMode) {
    newPosition = moveToken(tokens, key, space, mover, sameFieldOnly);
  } else {
    newPosition = moveAnnotation(tokens, key, mover);
  }

  if (mover.position !== newPosition) {
    setCurrentToken(newPosition);
    setTokenSelection((state: TokenSelection) => {
      return updateSelection(state, tokens, newPosition, !editMode && space, sameFieldOnly);
    });
  }
  return newPosition;
};

const annotationFromSelection = (
  tokens: Token[],
  selection: TokenSelection,
  triggerSelector: TriggerSelector
) => {
  let [from, to] = selection;
  if (to === null) to = from;
  triggerSelector({
    index: tokens[to].index,
    from: tokens[from].index,
    to: tokens[to].index,
  });
};

const moveToken = (
  tokens: Token[],
  key: Arrowkeys,
  space: boolean,
  mover: Mover,
  sameFieldOnly: boolean
) => {
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
    if (sameFieldOnly && tokens[mover.position].field !== tokens[newPosition].field) {
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
  add: boolean,
  sameFieldOnly: boolean
) => {
  if (index === null) return selection;
  let newSelection: TokenSelection = [...selection];

  if (!add || newSelection.length === 0) return returnSelectionIfChanged(selection, [index, null]);
  if (index === null) return returnSelectionIfChanged(selection, [newSelection[0], null]);

  if (!sameFieldOnly || tokens[newSelection[0]].field === tokens[index].field) {
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
