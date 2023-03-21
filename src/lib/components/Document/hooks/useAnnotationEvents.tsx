import { useEffect, useState, useRef } from "react";
import { scrollToMiddle } from "../../../functions/scroll";

import {
  onKeyDown,
  onKeyUp,
  onTouchDown,
  onTouchUp,
  onMouseMove,
  onMouseDown,
  onMouseUp,
  //onContextMenu,
  movePosition,
} from "../functions/eventFunctions";
import {
  SpanAnnotations,
  Token,
  TokenSelection,
  Arrowkeys,
  Span,
  RelationAnnotations,
} from "../../../types";

/**
 * This is a hugely elaborate component for managing navigation (key, mouse and touch events)
 * It doesn't acctually render anything, but its shaped as a component because useEffect is just really convenient here
 * You probably never want to read this. And if you do, don't expect my sympathies. Rather, just blame me
 * if anything in here breaks, or ask nicely if we need more features
 */
export default function useAnnotationEvents(
  tokens: Token[],
  spanAnnotations: SpanAnnotations,
  relationAnnotations: RelationAnnotations,
  triggerSelectionPopup: any,
  editMode: boolean,
  eventsBlocked: boolean
) {
  const [currentToken, setCurrentToken] = useState({ i: 0 });
  const [tokenSelection, setTokenSelection] = useState<TokenSelection>(null);
  const [mover, setMover] = useState(null);
  const [holdSpace, setHoldSpace] = useState(false);
  const [holdArrow, setHoldArrow] = useState<Arrowkeys>(null);

  // onEvent functions do not need to update on rerender, so use ref to pass on values
  const currentTokenRef = useRef(currentToken);
  const tokenSelectionRef = useRef(tokenSelection);
  const holdSpaceRef = useRef(holdSpace);
  currentTokenRef.current = currentToken;
  tokenSelectionRef.current = tokenSelection;
  holdSpaceRef.current = holdSpace;

  // keeps track of mouse events
  const selectionStarted = useRef(false);
  const tapped = useRef(null);
  const touch = useRef(null);
  const istouch = useRef(
    "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
  ); // hack to notice if device uses touch

  // reset selections when data changes
  useEffect(() => {
    setTokenSelection([]);
  }, [spanAnnotations, relationAnnotations]);
  useEffect(() => {
    setCurrentToken({ i: null });
    setTokenSelection([]);
  }, [tokens]);

  // Add 'methods' to tokens for performing navigation and annotation events
  useEffect(() => {
    if (!tokens) return;
    for (let token of tokens)
      token.select = (span: Span = undefined) => {
        if (!span) span = [token.index, token.index];

        if (token?.containerRef?.current && token?.ref?.current) {
          token.containerRef.current.style.scrollBehavior = "smooth";
          scrollToMiddle(token.containerRef.current, token.ref.current, 1 / 2);
          //keepInView(token.containerRef.current, token.ref.current);
        }
        setCurrentToken({ i: token.index });
        setTokenSelection(span);
        triggerSelectionPopup(token.index, span);
      };
  }, [tokens, triggerSelectionPopup, setCurrentToken, setTokenSelection]);

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
    const timeout = setTimeout(() => {
      setMover({
        position: position,
        startposition: mover.startposition,
        ntokens: mover.ntokens,
        counter: mover.counter + 1,
      });
    }, delay);
    return () => clearTimeout(timeout);
  }, [
    tokens,
    mover,
    holdArrow,
    holdSpace,
    setCurrentToken,
    editMode,
    spanAnnotations,
    relationAnnotations,
    setTokenSelection,
  ]);

  useEffect(() => {
    function onTouchDownEvent(event: TouchEvent) {
      onTouchDown(event, tokens, istouch, touch);
    }

    function onTouchUpEvent(event: TouchEvent) {
      onTouchUp(
        event,
        tokens,
        editMode,
        tokenSelectionRef.current,
        setCurrentToken,
        setTokenSelection,
        triggerSelectionPopup,
        touch,
        tapped
      );
    }

    function onMouseMoveEvent(event: MouseEvent) {
      onMouseMove(
        event,
        tokens,
        editMode,
        setCurrentToken,
        setTokenSelection,
        istouch,
        selectionStarted
      );
    }

    function onMouseDownEvent(event: MouseEvent) {
      onMouseDown(event, setTokenSelection, istouch, selectionStarted);
    }

    function onMouseUpEvent(event: MouseEvent) {
      onMouseUp(
        event,
        tokens,
        tokenSelectionRef.current,
        setCurrentToken,
        setTokenSelection,
        triggerSelectionPopup,
        istouch,
        selectionStarted
      );
    }

    // function onContextMenuEvent(event: MouseEvent) {
    //   onContextMenu(event, tokens);
    // }

    function onKeyUpEvent(event: KeyboardEvent) {
      onKeyUp(
        event,
        tokens,
        holdSpaceRef.current,
        setHoldSpace,
        setHoldArrow,
        tokenSelectionRef.current,
        setMover,
        triggerSelectionPopup
      );
    }
    function onKeyDownEvent(event: KeyboardEvent) {
      onKeyDown(event, tokens, currentTokenRef.current, setHoldSpace, setHoldArrow, setMover);
    }

    if (eventsBlocked) {
      setHoldSpace(false);
      setHoldArrow(null);
      setMover(false);
      touch.current = null;
      tapped.current = null;
      selectionStarted.current = false;
      return;
    }

    window.addEventListener("keydown", onKeyDownEvent);
    window.addEventListener("keyup", onKeyUpEvent);
    //document.addEventListener("contextmenu", onContextMenuEvent);
    document.addEventListener("mousedown", onMouseDownEvent);
    document.addEventListener("mousemove", onMouseMoveEvent);
    document.addEventListener("mouseup", onMouseUpEvent);
    document.addEventListener("touchstart", onTouchDownEvent);
    document.addEventListener("touchend", onTouchUpEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDownEvent);
      window.removeEventListener("keyup", onKeyUpEvent);
      //document.removeEventListener("contextmenu", onContextMenuEvent);
      document.removeEventListener("mousedown", onMouseDownEvent);
      document.removeEventListener("mousemove", onMouseMoveEvent);
      document.removeEventListener("mouseup", onMouseUpEvent);
      document.removeEventListener("touchstart", onTouchDownEvent);
      document.removeEventListener("touchend", onTouchUpEvent);
    };
  }, [
    tokens,
    holdSpaceRef,
    tokenSelectionRef,
    currentTokenRef,
    editMode,
    setTokenSelection,
    setCurrentToken,
    setHoldSpace,
    setHoldArrow,
    setMover,
    triggerSelectionPopup,
    selectionStarted,
    touch,
    istouch,
    tapped,
    eventsBlocked,
  ]);

  return { currentToken, tokenSelection };
}
