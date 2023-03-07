import React, { useState, useRef, RefObject, useCallback, useMemo } from "react";
import QuestionForm from "./QuestionForm";
import Document from "../../Document/Document";
import { useSwipeable } from "react-swipeable";
import swipeControl from "../functions/swipeControl";
import useLocalStorage from "../../../hooks/useLocalStorage";
import styled from "styled-components";
import {
  Annotation,
  CodeBook,
  ConditionReport,
  FullScreenNode,
  SessionData,
  SwipeRefs,
  Swipes,
  Unit,
  Transition,
} from "../../../types";
import Instructions from "./Instructions";
import FeedbackPortal from "./FeedbackPortal";
import useWatchChange from "../../../hooks/useWatchChange";
import unfoldQuestions from "../../../functions/unfoldQuestions";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--background);
`;

const ContentWindow = styled.div`
  flex: 1 1 auto;
  position: relative;

  &::before {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    height: 10px;
    width: 100%;
    background: linear-gradient(var(--background), transparent 70%);
    z-index: 100;
  }

  /* &::after {
    content: "";
    display: block;
    position: absolute;
    bottom: 0;
    height: 10px;
    width: 100%;
    background: linear-gradient(transparent, var(--background) 90%);
    z-index: 100;
  } */
`;

const SwipeableBox = styled.div`
  height: 100%;
  width: 100%;
  overflow: hidden;
  outline: 1px solid black;
  outline-offset: -2px;
  position: absolute;
  will-change: opacity, transform;
  z-index: 20;
`;

const SwipeCode = styled.div`
  padding: 0.6em 0.3em;
  width: 100%;
  font-size: 3em;
  position: absolute;
`;

const Content = styled.div<{ fontSize: number }>`
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  font-size: ${(props) => props.fontSize}em;
  box-shadow: 0px 0px 10px 5px var(--background-inversed-fixed);
  will-change: background, transform;
`;

const QuestionMenu = styled.div<{
  fontSize: number;
}>`
  font-size: ${(props) => props.fontSize}em;
`;
//max-height: 70%;

interface QuestionTaskProps {
  unit: Unit;
  codebook: CodeBook;
  nextUnit: () => void;
  fullScreenNode: FullScreenNode;
  sessionData: SessionData;
  blockEvents?: boolean;
}

const QuestionTask = ({
  unit,
  codebook,
  nextUnit,
  fullScreenNode,
  sessionData,
  blockEvents = false,
}: QuestionTaskProps) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [conditionReport, setConditionReport] = useState<ConditionReport>(null);
  const divref = useRef(null);
  const textref = useRef(null);
  const boxref = useRef(null);
  const coderef = useRef(null);
  const refs = useMemo(() => {
    return { text: textref, box: boxref, code: coderef };
  }, []);

  const [settings] = useLocalStorage("questionTaskSettings", {
    upperTextSize: 1,
    lowerTextSize: 1.2,
  });

  // useEffect(() => {
  //   if (!textref.current) return;
  //   textref.current.addEventListener();
  // }, [textref]);

  const questions = useMemo(() => unfoldQuestions(codebook, unit), [unit, codebook]);
  const question = questions[questionIndex];

  if (useWatchChange([unit])) {
    setQuestionIndex(0);
    setConditionReport(unit.report || { evaluation: {}, damage: {} });
    hideUnit(refs.text, refs.box, refs.code); // hide unit until ready
  }

  const onNewUnit = useCallback(() => {
    // this is called in the onReady callback in Document
    showUnit(refs.text, refs.box, refs.code);
  }, [refs.text, refs.box, refs.code]);

  const startTransition = useCallback(
    (trans: Transition, nextUnit: boolean) => {
      if (nextUnit) {
        nextUnitTransition(refs, trans);
      } else {
        nextQuestionTransition(refs, trans);
        setTimeout(() => {
          showUnit(refs.text, refs.box, refs.code);
        }, 100);
      }
    },
    [refs]
  );

  // swipe controlls need to be up in the QuestionTask component due to working on the div containing the question screen
  // use separate swipe for text (document) and menu rows, because swiping up in the text is only possible if scrolled all the way down
  const [swipe, setSwipe] = useState<Swipes>(null);
  const textSwipe = useSwipeable(swipeControl(question, refs, setSwipe, false));
  const menuSwipe = useSwipeable(swipeControl(question, refs, setSwipe, true));

  if (!unit) return null;

  // two modes for highlighting annotations: if they are included in question.annotations and
  // in question.showAnnotations. Passing an array of annotations to Document highlights the spans
  let annotations: Annotation[] = question?.annotation ? [question.annotation] : [];
  if (question?.showAnnotations && unit.unit.annotations) {
    const addAnnotations = unit.unit.annotations.filter((a) =>
      question.showAnnotations.includes(a.variable)
    );
    annotations = [...annotations, ...addAnnotations];
  }

  return (
    <Container className="QuestionContainer" ref={divref}>
      <FeedbackPortal
        variable={questions?.[questionIndex]?.name}
        conditionReport={conditionReport}
        setConditionReport={setConditionReport}
        fullScreenNode={fullScreenNode}
      />

      <ContentWindow {...textSwipe}>
        <SwipeableBox ref={refs.box}>
          {/* This div moves around behind the div containing the document to show the swipe code  */}
          <SwipeCode ref={refs.code} />
          <Content ref={refs.text} fontSize={settings.upperTextSize}>
            <Document
              unit={unit}
              annotations={annotations}
              showAll={true}
              onReady={onNewUnit}
              fullScreenNode={fullScreenNode}
              focus={question?.fields}
              centered
            />
          </Content>
        </SwipeableBox>
      </ContentWindow>
      <QuestionMenu {...menuSwipe} fontSize={settings.lowerTextSize}>
        <QuestionForm
          unit={unit}
          questions={questions}
          questionIndex={questionIndex}
          setQuestionIndex={setQuestionIndex}
          nextUnit={nextUnit}
          setConditionReport={setConditionReport}
          swipe={swipe}
          setSwipe={setSwipe}
          startTransition={startTransition}
          blockEvents={blockEvents}
        >
          <Instructions
            instruction={question?.instruction || codebook?.settings?.instruction}
            autoInstruction={codebook?.settings?.auto_instruction || false}
            sessionData={sessionData}
          />
        </QuestionForm>
      </QuestionMenu>
    </Container>
  );
};

const nextUnitTransition = (r: SwipeRefs, trans: Transition) => {
  const direction = trans?.direction;
  const color = trans?.color || "var(--background)";
  if (r?.box?.current?.style != null && r?.text?.current != null) {
    r.text.current.style.transition = `transform 2000ms`;
    r.text.current.style.transform = `translateX(${
      direction === "right" ? 100 : direction === "left" ? -100 : 0
    }%) translateY(${direction ? "-100" : "0"}%)`;
    r.box.current.style.transition = `opacity 250ms linear`;
    r.box.current.style.background = color;
    r.box.current.style.opacity = "0";
  }
};

const nextQuestionTransition = (r: SwipeRefs, trans: Transition) => {
  if (!trans?.color) return;
  // if (r?.box?.current?.style != null && r?.text?.current != null) {
  //   r.text.current.style.transition = `background 50ms ease-out`;
  //   r.text.current.style.background = trans.color;
  // }
};

const hideUnit = (
  text: RefObject<HTMLElement>,
  box: RefObject<HTMLElement>,
  code: RefObject<HTMLElement>
): void => {
  if (!text.current) return null;
  code.current.innerText = "";
  text.current.style.transition = ``;
  box.current.style.transition = ``;
  box.current.style.background = "var(--background)";
  box.current.style.opacity = "0";
  text.current.style.transform = "translateX(0%) translateY(0%)";
};

const showUnit = (
  text: RefObject<HTMLElement>,
  box: RefObject<HTMLElement>,
  code: RefObject<HTMLElement>
): void => {
  if (!text.current) return null;
  code.current.innerText = "";
  box.current.style.transition = `opacity 200ms linear`;
  box.current.style.opacity = "1";
  text.current.style.transition = `background 300ms, opacity 200ms`;
  text.current.style.transform = "translateX(0%) translateY(0%)";
  text.current.style.background = "var(--background)";
  text.current.style.opacity = "1";
  text.current.style.filter = "";
};

export default React.memo(QuestionTask);
