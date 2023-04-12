import { useEffect, useState, useRef, useCallback } from "react";

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
import { Token, TokenSelection, Arrowkeys, AnnotationLibrary, VariableType } from "../../../types";

/**
 * This is a hugely elaborate component for managing navigation (key, mouse and touch events)
 * It doesn't acctually render anything, but its shaped as a component because useEffect is just really convenient here
 * You probably never want to read this. And if you do, don't expect my sympathies. Rather, just blame me
 * if anything in here breaks, or ask nicely if we need more features
 */
export default function useAnnotationEvents(
  tokens: Token[],
  annotationLib: AnnotationLibrary,
  triggerSelectionPopup: any,
  editMode: boolean,
  variableType: VariableType,
  eventsBlocked: boolean
) {
  const [tokenSelection, setTokenSelection] = useState<TokenSelection>(null);
  const [mover, setMover] = useState(null);
  const [holdSpace, setHoldSpace] = useState(false);
  const [holdArrow, setHoldArrow] = useState<Arrowkeys>(null);
  const [alternative, setAlternative] = useState(false);
  const sameFieldOnly = variableType === "span";

  // onEvent functions do not need to update on rerender, so use ref to pass on values
  const tokenSelectionRef = useRef(tokenSelection);
  const holdSpaceRef = useRef(holdSpace);
  const alternativeRef = useRef(alternative);
  tokenSelectionRef.current = tokenSelection;
  holdSpaceRef.current = holdSpace;
  alternativeRef.current = alternative;

  const currentTokenRef = useRef(0);
  const setCurrentToken = useCallback(
    (i: number) => {
      if (i === currentTokenRef.current) return;
      if (tokens?.[i]?.ref?.current) tokens[i].ref.current.focus();
      currentTokenRef.current = i;
    },
    [tokens, currentTokenRef]
  );

  // keeps track of mouse events
  const selectionStarted = useRef(false);

  const touch = useRef(null);
  const istouch = useRef(
    "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
  ); // hack to notice if device uses touch

  // reset selection if events get unblocked
  useEffect(() => {
    if (!eventsBlocked) setTokenSelection([]);
    (document.activeElement as HTMLElement).blur();
  }, [eventsBlocked]);

  // reset selections when data changes
  useEffect(() => {
    setTokenSelection([]);
  }, [annotationLib]);
  useEffect(() => {
    setCurrentToken(null);
    setTokenSelection([]);
  }, [tokens, setCurrentToken]);

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
      sameFieldOnly,
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
    annotationLib,
    setTokenSelection,
    sameFieldOnly,
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
        currentTokenRef.current,
        tokenSelectionRef.current,
        sameFieldOnly,
        setCurrentToken,
        setTokenSelection,
        triggerSelectionPopup,
        touch
      );
    }

    function onMouseMoveEvent(event: MouseEvent) {
      onMouseMove(
        event,
        tokens,
        editMode,
        sameFieldOnly,
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
        sameFieldOnly,
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
      if (event.key === "Control") setAlternative(false);
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
      if (event.key === "Control") setAlternative(true);
      onKeyDown(event, tokens, currentTokenRef.current, setHoldSpace, setHoldArrow, setMover);
    }

    if (eventsBlocked) {
      setHoldSpace(false);
      setHoldArrow(null);
      setMover(false);
      setAlternative(false);
      touch.current = null;
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
    alternativeRef,
    editMode,
    setTokenSelection,
    setCurrentToken,
    setHoldSpace,
    setHoldArrow,
    setMover,
    setAlternative,
    triggerSelectionPopup,
    selectionStarted,
    touch,
    istouch,
    eventsBlocked,
    sameFieldOnly,
  ]);

  return { tokenSelection, alternative };
}
