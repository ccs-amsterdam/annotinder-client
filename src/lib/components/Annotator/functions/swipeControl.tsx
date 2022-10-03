import { SwipeEventData } from "react-swipeable";
import { Question, SetState, SwipeRefs } from "../../../types";

const swipeControl = (
  question: Question,
  refs: SwipeRefs,
  setSwipe: SetState<string>,
  alwaysDoVertical: boolean,
  triggerdist: number = 110
) => {
  if (!question) return {};
  const swipeable = ["annotinder", "confirm"];
  if (!swipeable.includes(question.type)) return {};

  let swipeOptions = question.swipeOptions;
  if (question.type === "confirm") {
    // make confirm questions swipeable in any direction
    const confirmoption = {
      code: question.button || "Continue",
      color: "#2185d0",
    };
    swipeOptions = {
      left: confirmoption,
      up: confirmoption,
      right: confirmoption,
    };
  }

  const transitionTime = 250;
  let scrolloffset = 0;
  // const blockSwipe = useRef()

  const swipeConfig = {
    delta: 10, // min distance(px) before a swipe starts. *See Notes*
    preventDefaultTouchmoveEvent: false, // call e.preventDefault *See Details*
    trackTouch: true, // track touch input
    trackMouse: false, // track mouse input
    rotationAngle: 0, // set a rotation angle
  };

  let container: Element;
  const getDeltas = (d: SwipeEventData) => {
    if (!container) container = refs.text.current.getElementsByClassName("BodyContainer")[0];
    let deltaX = d.deltaX;
    let deltaY = d.deltaY;
    if (Math.abs(deltaX) > Math.abs(deltaY) + 10) deltaY = 0;
    if (Math.abs(deltaX) < Math.abs(deltaY) + 10) deltaX = 0;
    if (!alwaysDoVertical) {
      // the bottom menu always allows vertical upward swipe, but for the
      // text div we only allow swiping up if scrolled all the way to bottom

      if (d.first)
        scrolloffset = container.scrollHeight - container.scrollTop - container.clientHeight;
      deltaY += scrolloffset;
    }
    return [deltaX, Math.min(0, deltaY)];
  };

  return {
    onSwiping: (d: SwipeEventData) => {
      if (!refs?.text?.current) return;
      const [deltaX, deltaY] = getDeltas(d);
      if (deltaX > 0 && !swipeOptions.right) return;
      if (deltaX < 0 && !swipeOptions.left) return;
      if (deltaY < 0 && !swipeOptions.up) return;
      //if (deltaY !== 0 && deltaY > 0) return;

      refs.text.current.style.transition = ``;
      refs.text.current.style.transform = `translateX(${deltaX}px) translateY(${deltaY}px)`;

      let bgc = swipeOptions.up?.color;
      let code = swipeOptions.up?.code;
      let [bottom, talign] = ["0%", "center"];
      if (deltaX > 0) {
        bgc = swipeOptions.right?.color;
        code = swipeOptions.right?.code;
        [bottom, talign] = ["40%", "left"];
      }
      if (deltaX < 0) {
        bgc = swipeOptions.left?.color;
        code = swipeOptions.left?.code;
        [bottom, talign] = ["40%", "right"];
      }

      refs.box.current.style.backgroundColor = bgc;
      refs.code.current.innerText = code;
      refs.code.current.style.bottom = bottom;
      refs.code.current.style.textAlign = talign;
    },
    onSwiped: (d: SwipeEventData) => {
      if (!refs?.text?.current) return;
      const [deltaX, deltaY] = getDeltas(d);
      if (deltaX > 0 && !swipeOptions.right) return;
      if (deltaX < 0 && !swipeOptions.left) return;
      if (deltaY < 0 && !swipeOptions.up) return;
      //if (deltaY !== 0 && deltaY > 0) return;

      refs.text.current.style.transition = `transform ${transitionTime}ms`;

      if (Math.abs(deltaX) < triggerdist && Math.abs(deltaY) < triggerdist) {
        refs.text.current.style.transform = `translateX(0%) translateY(0%)`;
        //refs.box.current.style.backgroundColor = "white";
      } else {
        refs.text.current.style.transform = `translateX(${
          deltaX > 0 ? 100 : deltaX < 0 ? -100 : 0
        }%) translateY(${deltaY > 0 ? 100 : -100}%)`;
        refs.box.current.style.transition = `opacity ${transitionTime}ms`;
        refs.box.current.style.opacity = "0";

        let dir = deltaX > 0 ? "right" : "up";
        dir = deltaX < 0 ? "left" : dir;
        setSwipe(dir);
      }
    },
    ...swipeConfig,
  };
};

export default swipeControl;
