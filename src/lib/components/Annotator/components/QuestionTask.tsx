import React, { useState, useRef, RefObject, useCallback, useMemo } from "react";
import QuestionForm from "./QuestionForm";
import Document from "../../Document/Document";
import { useSwipeable } from "react-swipeable";
import { Button, Form, Input, Portal, Segment } from "semantic-ui-react";
import swipeControl from "../functions/swipeControl";
import useLocalStorage from "../../../hooks/useLocalStorage";
import styled from "styled-components";
import {
  CodeBook,
  ConditionReport,
  FullScreenNode,
  SessionData,
  SetState,
  SwipeRefs,
  Swipes,
  Unit,
  Transition,
} from "../../../types";
import Instructions from "./Instructions";
import FeedbackPortal from "./FeedbackPortal";
import useWatchChange from "../../../hooks/useWatchChange";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ContentWindow = styled.div`
  flex: 1 1 auto;
  position: relative;
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
  background-color: white;
  font-size: ${(props) => props.fontSize}em;
  box-shadow: 5px 5px 20px 5px;
  will-change: background, transform;
  border-top: 1px solid #dddddd;
`;

const QuestionMenu = styled.div<{
  minifiedAnswerForm: boolean;
  formHeight: string;
  fontSize: number;
}>`
  height: ${(props) => (props.minifiedAnswerForm ? null : props.formHeight)};
  min-height: ${(props) => (props.minifiedAnswerForm ? null : "200px")};
  font-size: ${(props) => props.fontSize}em;
  transition: max-height 1s;
`;

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
  const textref = useRef();
  const boxref = useRef();
  const coderef = useRef();
  const refs = useMemo(() => {
    return { text: textref, box: boxref, code: coderef };
  }, []);
  const [settings, setSettings] = useLocalStorage("questionTaskSettings", {
    splitHeight: 70,
    upperTextSize: 1,
    lowerTextSize: 1,
  });

  console.log("before watch");
  if (useWatchChange([unit])) {
    setQuestionIndex(0);
    setConditionReport(unit.report || { evaluation: {}, damage: {} });
    hideUnit(refs.text, refs.box, refs.code); // hide unit until ready
  }
  console.log("after watch");

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
  const textSwipe = useSwipeable(
    swipeControl(codebook?.questions?.[questionIndex], refs, setSwipe, false)
  );
  const menuSwipe = useSwipeable(
    swipeControl(codebook?.questions?.[questionIndex], refs, setSwipe, true)
  );

  if (!unit) return null;

  // The size of the text div, in pct compared to the answer div
  let splitHeight = codebook?.settings?.text_window_size ?? settings.splitHeight;
  const formHeight = splitHeight === "auto" ? "auto" : `${100 - splitHeight}%`;

  // if there are only annotinder or confirm questions, minify the answer form
  let minifiedAnswerForm = true;
  const minifiable = ["annotinder", "confirm"];
  for (let question of codebook?.questions || [])
    if (!minifiable.includes(question.type)) minifiedAnswerForm = false;

  return (
    <Container ref={divref}>
      <FeedbackPortal
        variable={codebook?.questions?.[questionIndex]?.name}
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
              onReady={onNewUnit}
              showAnnotations={codebook?.questions?.[questionIndex]?.showAnnotations || []}
              fullScreenNode={fullScreenNode}
              focus={codebook?.questions?.[questionIndex]?.fields}
              centered
            />
          </Content>
        </SwipeableBox>
      </ContentWindow>
      <QuestionMenu
        {...menuSwipe}
        minifiedAnswerForm={minifiedAnswerForm}
        fontSize={settings.lowerTextSize}
        formHeight={formHeight}
      >
        <QuestionForm
          unit={unit}
          questions={codebook?.questions}
          questionIndex={questionIndex}
          setQuestionIndex={setQuestionIndex}
          nextUnit={nextUnit}
          setConditionReport={setConditionReport}
          swipe={swipe}
          setSwipe={setSwipe}
          startTransition={startTransition}
          blockEvents={blockEvents}
        >
          <SettingsPopup
            settings={settings}
            setSettings={setSettings}
            fullScreenNode={fullScreenNode}
            cantChangeSplitHeight={
              minifiedAnswerForm || codebook?.settings?.text_window_size != null
            }
          />
          <Instructions
            codebook={codebook}
            sessionData={sessionData}
            fullScreenNode={fullScreenNode}
          />
        </QuestionForm>
      </QuestionMenu>
    </Container>
  );
};

interface SettingsPopupProps {
  settings: { [key: string]: number | string };
  setSettings: SetState<{ [key: string]: number | string }>;
  fullScreenNode: FullScreenNode;
  cantChangeSplitHeight: boolean;
}

const SettingsPopup = ({
  settings,
  setSettings,
  fullScreenNode,
  cantChangeSplitHeight,
}: SettingsPopupProps) => {
  return (
    <Portal
      closeOnTriggerClick
      mountNode={fullScreenNode || undefined}
      on="click"
      trigger={
        <Button
          size="huge"
          icon="setting"
          style={{
            background: "transparent",
            cursor: "pointer",
            color: "white",
            padding: "4px 5px 4px 5px",
            margin: "0",
            width: "30px",
            zIndex: 1000,
          }}
        />
      }
    >
      <Segment
        style={{
          bottom: "30%",
          left: "10%",
          position: "fixed",
          width: "80%",
          maxWidth: "400px",
          zIndex: 10000,
          background: "#dfeffbaa",
          backdropFilter: "blur(2px)",
          border: "1px solid #136bae",
        }}
      >
        <Form>
          <Form.Group grouped>
            {cantChangeSplitHeight ? null : (
              <Form.Field>
                <label>
                  Text window height{" "}
                  <span style={{ color: "blue" }}>{`${settings.splitHeight}%`}</span>
                </label>
                <Input
                  size="mini"
                  step={2}
                  min={20}
                  max={80}
                  type="range"
                  value={settings.splitHeight}
                  onChange={(e, d) =>
                    setSettings((state: any) => ({ ...state, splitHeight: d.value }))
                  }
                />
              </Form.Field>
            )}
            <Form.Field>
              <label>
                Content text size{" "}
                <span style={{ color: "blue" }}>{`${settings.upperTextSize}`}</span>
              </label>
              <Input
                size="mini"
                step={0.025}
                min={0.4}
                max={1.6}
                type="range"
                value={settings.upperTextSize}
                onChange={(e, d) =>
                  setSettings((state: any) => ({ ...state, upperTextSize: d.value }))
                }
              />
            </Form.Field>
            <Form.Field>
              <label>
                Answer field text size{" "}
                <span style={{ color: "blue" }}>{`${settings.lowerTextSize}`}</span>
              </label>
              <Input
                size="mini"
                step={0.025}
                min={0.4}
                max={1.6}
                type="range"
                value={settings.lowerTextSize}
                onChange={(e, d) =>
                  setSettings((state: any) => ({ ...state, lowerTextSize: d.value }))
                }
              />
            </Form.Field>
          </Form.Group>
        </Form>
      </Segment>
    </Portal>
  );
};

const nextUnitTransition = (r: SwipeRefs, trans: Transition) => {
  const direction = trans?.direction;
  const color = trans?.color || "white";
  if (r?.box?.current?.style != null && r?.text?.current != null) {
    r.text.current.style.transition = `transform 2000ms`;
    r.text.current.style.transform = `translateX(${
      direction === "right" ? 100 : direction === "left" ? -100 : 0
    }%) translateY(${direction ? "-100" : "0"}%)`;
    r.box.current.style.transition = `opacity 250ms linear`;
    r.box.current.style.background = color || "white";
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
  box.current.style.background = "white";
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
  text.current.style.background = "white";
  text.current.style.opacity = "1";
  text.current.style.filter = "";
};

export default React.memo(QuestionTask);
