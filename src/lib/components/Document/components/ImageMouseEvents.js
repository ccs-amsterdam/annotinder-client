import getImagePosition from "../functions/getImagePosition";

// PLACEHOLDER FOR WHEN WE WILL ADD IMAGE ANNOTATION
// NOTE: PROBABLY BEST TO ALSO DIVIDE IMAGES INTO PARTS (DISCRETE RATHER THAN CONTINUOUS SELECTION)

const ImageMouseEvents = ({ triggerCodePopup, editMode }) => {
  const selectionStarted = useRef(false);
  const tapped = useRef(null);
  const touch = useRef(null);
  const imageBox = useRef();
  const istouch = useRef(
    "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0
  ); // hack to notice if device uses touch (because single touch somehow triggers mouseup)

  const storeMouseTokenSelection = useCallback(
    (currentNode) => {
      // select tokens that the mouse/touch is currently pointing at
      setCurrentToken((state) => {
        if (state.i === currentNode.index) return state;
        return { i: currentNode.index };
      });
      setTokenSelection((state) => updateSelection(state, tokens, currentNode.index, true));
      return currentNode.index;
    },
    [setCurrentToken, setTokenSelection, tokens]
  );

  const storeMouseImageSelection = useCallback(
    ({ image, x, y }) => {
      if (image) {
        imageBox.current.style.left = x + "px";
        imageBox.current.style.top = y + "px";
      }
    },
    [imageBox]
  );

  const onTouchDown = useCallback(
    (event) => {
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
      const timepassed = now - touch.current.time;
      if (timepassed > 150) return;
      const token = touch.current.token;

      if (token?.index === null) {
        rmTapped(tokens, tapped.current);
        tapped.current = null;
        setTokenSelection((state) => (state.length === 0 ? state : []));
        return;
      }

      if (editMode) {
        annotationFromSelection(tokens, [token.index, token.index], triggerCodePopup);
        return;
      }

      // first check if there is a tokenselection (after double tab). If so, this completes the selection
      if (tokenSelection.length > 0 && tokenSelection[0] === tapped.current) {
        // if a single token, and an annotation already exists, open create/edit mode
        const currentNode = storeMouseTokenSelection(token);
        setTokenSelection((state) => updateSelection(state, tokens, currentNode, true));

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
        setTokenSelection((state) => (state.length === 0 ? state : []));
      } else {
        rmTapped(tapped.current);
        setTokenSelection((state) => updateSelection(state, tokens, token.index, true));
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
        setTokenSelection((state) => (state.length === 0 ? state : []));
      }
    },
    [setTokenSelection]
  );

  const onMouseMove = useCallback(
    (event) => {
      if (istouch.current) return;
      storeMouseImageSelection(getImagePosition(event));

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
          setTokenSelection((state) => updateSelection(state, tokens, currentNode.index, false));
        } else
          setCurrentToken((state) => {
            if (state.i === currentNode.index || currentNode.index === null) return state;
            return { i: currentNode.index };
          });
      }
    },
    [
      editMode,
      setCurrentToken,
      setTokenSelection,
      storeMouseTokenSelection,
      storeMouseImageSelection,
      tokens,
    ]
  );

  const onMouseUp = useCallback(
    (event) => {
      if (istouch.current) return;
      // When left mouse key is released, create the annotation
      // note that in case of a single click, the token has not been selected (this happens on move)
      // so this way a click can still be used to open
      if (event.which !== 1 && event.which !== 0) return null;

      // can these be disabled? Does this solve the mac issue? (slider getting stuck on click)
      //event.preventDefault();
      //event.stopPropagation();

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
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchstart", onTouchDown);
    window.addEventListener("touchend", onTouchUp);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchstart", onTouchDown);
      window.removeEventListener("touchend", onTouchUp);
    };
  }, [onMouseDown, onMouseMove, onMouseUp, onTouchDown, onTouchUp]);

  return (
    <div
      className="ImageAnnotationBox"
      ref={imageBox}
      style={{
        position: "fixed",
        left: "10px",
        top: "10px",
        width: "10px",
        height: "10px",
        border: "2px solid black",
        background: "#ffffff55",
      }}
    />
  );
};

export default ImageMouseEvents;
