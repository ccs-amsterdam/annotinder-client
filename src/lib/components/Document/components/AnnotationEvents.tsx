import React, { useEffect, useState, useRef, useCallback } from "react";
import { keepInView } from "../../../functions/scroll";
import { moveUp, moveDown } from "../../../functions/refNavigation";
import getToken from "../functions/getToken";
import {
  SetState,
  SpanAnnotations,
  Token,
  TokenSelection,
  TriggerCodePopup,
  Span,
} from "../../../types";

// This component generates no content, but manages navigation for span level annotations
// The main reason for using components is that it's just convenient for updating the event listener functions
// and disabling key/mouse events by unmounting. It works sufficiently fast and stable, but at some point
// look into perhaps more proper ways of doing this.

const arrowkeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];
type Arrowkeys = "ArrowRight" | "ArrowLeft" | "ArrowUp" | "ArrowDown";

/** used to manage keyboard navigation */
interface Mover {
  position: number;
  startposition: number;
  ntokens: number;
  counter: number;
}

interface AnnotationEventsProps {
  tokens: Token[];
  annotations: SpanAnnotations;
  currentToken: { i: number };
  setCurrentToken: SetState<{ i: number }>;
  tokenSelection: TokenSelection;
  setTokenSelection: SetState<TokenSelection>;
  triggerCodePopup: any;
  editMode: boolean;
  eventsBlocked: boolean;
}

/**
 * This is a hugely elaborate component for managing navigation (key, mouse and touch events)
 * It doesn't acctually render anything, but its shaped as a component because useEffect is just really convenient here
 * You probably never want to read this. And if you do, don't expect my sympathies. Rather, just blame me
 * if anything in here breaks, or ask nicely if we need more features
 */
export const AnnotationEvents = ({
  tokens,
  annotations,
  currentToken,
  setCurrentToken,
  tokenSelection,
  setTokenSelection,
  triggerCodePopup,
  editMode,
  eventsBlocked,
}: AnnotationEventsProps) => {
  // !! Keep in mind that positions are based on token.arrayIndex, not token.index
  // arrayIndex is the actual tokens array, where token.index is the position of the token in the document
  // (these can be different if the text/context does not start at token.index 0)

  const [mover, setMover] = useState(null);
  const [holdSpace, setHoldSpace] = useState(false);
  const [holdArrow, setHoldArrow] = useState<Arrowkeys>(null);
  useEffect(() => {
    if (eventsBlocked) {
      setHoldArrow(null);
      setHoldSpace(false);
    } else {
      //setTokenSelection((state) => (state.length === 0 ? state : []));
    }
  }, [setHoldArrow, setHoldSpace, eventsBlocked, setTokenSelection]);

  // this adds a function to each token to select and navigate to it
  // that can also be accessed outside of Document (via returnTokens)
  useEffect(() => {
    if (!tokens) return;
    for (let token of tokens)
      token.select = (span: Span = undefined) => {
        if (!span) span = [token.index, token.index];
        if (token?.containerRef?.current && token?.ref?.current) {
          token.containerRef.current.style.scrollBehavior = "smooth";
          keepInView(token.containerRef.current, token.ref.current);
        }
        setCurrentToken({ i: token.index });
        setTokenSelection(span);
      };
  }, [tokens, setCurrentToken, setTokenSelection]);

  useEffect(() => {
    // for when manual edit mode releases
    setHoldArrow(null);
    if (!editMode) setMover(null);
  }, [editMode, setMover, setHoldArrow]);

  useEffect(() => {
    // When arrow key is held, walk through tokens with increasing speed
    // this loops itself by updating mover (an object with position information)
    // this is like setIntervall, but allows custom time intervalls,
    if (!mover || !holdArrow || !tokens?.[0]?.containerRef?.current) return;

    let position = movePosition(
      tokens,
      holdArrow,
      mover,
      holdSpace,
      editMode,
      setCurrentToken,
      setTokenSelection
    );

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
        counter: mover.counter + 1,
      });
    }, delay);
  }, [
    tokens,
    mover,
    holdArrow,
    holdSpace,
    setCurrentToken,
    editMode,
    annotations,
    setTokenSelection,
  ]);

  // this prevents rendering the components that manage the key and mouse events
  if (eventsBlocked) return null;

  return (
    <>
      <KeyEvents
        tokenSelection={tokenSelection}
        currentToken={currentToken}
        tokens={tokens}
        holdSpace={holdSpace}
        setMover={setMover}
        setHoldSpace={setHoldSpace}
        setHoldArrow={setHoldArrow}
        triggerCodePopup={triggerCodePopup}
      />
      <TokenMouseEvents
        tokenSelection={tokenSelection}
        tokens={tokens}
        setCurrentToken={setCurrentToken}
        setTokenSelection={setTokenSelection}
        triggerCodePopup={triggerCodePopup}
        editMode={editMode}
      />
    </>
  );
};

interface KeyEventsProps {
  tokenSelection: TokenSelection;
  currentToken: { i: number };
  tokens: Token[];
  holdSpace: boolean;
  setMover: SetState<Mover>;
  setHoldSpace: SetState<boolean>;
  setHoldArrow: SetState<Arrowkeys>;
  triggerCodePopup: TriggerCodePopup;
}

const KeyEvents = ({
  tokenSelection,
  currentToken,
  tokens,
  holdSpace,
  setMover,
  setHoldSpace,
  setHoldArrow,
  triggerCodePopup,
}: KeyEventsProps) => {
  // This blocks event listeners when the eventsBlocked state (in redux) is true.
  // This lets us block the key activities in the text (selecting tokens) when
  // the CodeSelector popup is open
  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  });

  // (see useEffect with 'eventsBlocked' for details on useCallback)
  const onKeyUp = (event: KeyboardEvent) => {
    // keep track of which buttons are pressed in the state
    if (event.keyCode === 32 && holdSpace) {
      setHoldSpace(false);
      if (tokenSelection.length > 0) {
        annotationFromSelection(tokens, tokenSelection, triggerCodePopup);
      }
      return;
    }
    if (arrowkeys.includes(event.key)) {
      setHoldArrow(null);
      setMover(null);
    }
  };

  // (see useEffect with 'eventsBlocked' for details on useCallback)
  const onKeyDown = (event: KeyboardEvent) => {
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
  };

  return <></>;
};

interface TokenMouseEventsProps {
  tokenSelection: TokenSelection;
  tokens: Token[];
  setCurrentToken: SetState<{ i: number }>;
  setTokenSelection: SetState<TokenSelection>;
  triggerCodePopup: TriggerCodePopup;
  editMode: boolean;
}

const TokenMouseEvents = ({
  tokenSelection,
  tokens,
  setCurrentToken,
  setTokenSelection,
  triggerCodePopup,
  editMode,
}: TokenMouseEventsProps) => {
  const selectionStarted = useRef(false);
  const tapped = useRef(null);
  const touch = useRef(null);
  const istouch = useRef(
    "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
  ); // hack to notice if device uses touch (because single touch somehow triggers mouseup)

  const storeMouseTokenSelection = useCallback(
    (currentNode) => {
      // select tokens that the mouse/touch is currently pointing at
      setCurrentToken((state) => {
        if (state.i === currentNode.index) return state;
        return { i: currentNode.index };
      });
      setTokenSelection((state: TokenSelection) =>
        updateSelection(state, tokens, currentNode.index, true)
      );
      return currentNode.index;
    },
    [setCurrentToken, setTokenSelection, tokens]
  );

  const onTouchDown = useCallback(
    (event) => {
      istouch.current = true;
      // store token from touch down, but process on touch up, so that we cna set a max
      // time passed (to ignore holding touch when scrolling)
      touch.current = { time: new Date(), token: getToken(tokens, event) };
    },
    [tokens]
  );

  const onTouchUp = useCallback(
    (e) => {
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
      e.preventDefault();

      if (editMode) {
        annotationFromSelection(tokens, [token.index, token.index], triggerCodePopup);
        return;
      }

      // first check if there is a tokenselection (after double tab). If so, this completes the selection
      if (tokenSelection.length > 0 && tokenSelection[0] === tapped.current) {
        // if a single token, and an annotation already exists, open create/edit mode
        const currentNode = storeMouseTokenSelection(token);
        setTokenSelection((state: TokenSelection) =>
          updateSelection(state, tokens, currentNode, true)
        );

        if (token?.annotated && currentNode === tokenSelection[0]) {
          annotationFromSelection(tokens, [currentNode, currentNode], triggerCodePopup);
        } else {
          annotationFromSelection(tokens, [tokenSelection[0], currentNode], triggerCodePopup);
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
        setTokenSelection((state: TokenSelection) =>
          updateSelection(state, tokens, token.index, true)
        );
      }
    },
    [
      editMode,
      setCurrentToken,
      setTokenSelection,
      storeMouseTokenSelection,
      tokenSelection,
      tokens,
      triggerCodePopup,
    ]
  );

  const onMouseDown = useCallback(
    (event) => {
      if (istouch.current) return; // suppress mousedown triggered by quick tap
      // When left button pressed, start new selection
      if (event.which === 1) {
        selectionStarted.current = true;
        setTokenSelection((state: TokenSelection) => (state.length === 0 ? state : []));
      }
    },
    [setTokenSelection]
  );

  const onMouseMove = useCallback(
    (event) => {
      // If mousemove only happens if mouse is used (which you can't be sure of, because chaos),
      // this would work to prevent odd cases where a touchscreen could disable mouse
      //if (istouch.current) return;
      istouch.current = false;

      // When selection started (mousedown), select tokens hovered over
      if (!editMode && selectionStarted.current) {
        //event.preventDefault();
        if (event.which !== 1 && event.which !== 0) return null;
        window.getSelection().empty();
        storeMouseTokenSelection(getToken(tokens, event));
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
    },
    [editMode, setCurrentToken, setTokenSelection, storeMouseTokenSelection, tokens]
  );

  const onMouseUp = useCallback(
    (event) => {
      if (istouch.current) return;
      // When left mouse key is released, create the annotation
      // note that in case of a single click, the token has not been selected (this happens on move)
      // so this way a click can still be used to open
      if (event.which !== 1 && event.which !== 0) return null;

      // can these be disabled? Does this solve the mac issue? (slider getting stuck on click)
      console.log("release");
      event.preventDefault();
      event.stopPropagation();

      const currentNode = storeMouseTokenSelection(getToken(tokens, event));
      window.getSelection().empty();
      //setHoldMouseLeft(false);
      selectionStarted.current = false;

      // this worked before, but is not possible due to touchend not registering position
      //if (currentNode === null) return null;

      // storeMouseTokenSelection does save position to tokenSelection state, but this isn't
      // yet updated within this scope. This results in single clicks (without mousemove)
      // not registering. So if there is no current selection, directly use currentNode as position.
      if (tokenSelection.length > 0 && tokenSelection[0] !== null && tokenSelection[1] !== null) {
        annotationFromSelection(tokens, tokenSelection, triggerCodePopup);
      } else {
        if (currentNode !== null) {
          annotationFromSelection(tokens, [currentNode, currentNode], triggerCodePopup);
        }
      }
    },
    [storeMouseTokenSelection, tokenSelection, tokens, triggerCodePopup]
  );

  useEffect(() => {
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchstart", onTouchDown);
    document.addEventListener("touchend", onTouchUp);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchstart", onTouchDown);
      document.removeEventListener("touchend", onTouchUp);
    };
  }, [onMouseDown, onMouseMove, onMouseUp, onTouchDown, onTouchUp]);

  return <></>;
};

const annotationFromSelection = (
  tokens: Token[],
  selection: TokenSelection,
  triggerCodePopup: TriggerCodePopup
) => {
  let [from, to] = selection;
  if (from > to) [from, to] = [to, from];
  triggerCodePopup(tokens[to].index, [tokens[from].index, tokens[to].index]);
};

const movePosition = (
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
