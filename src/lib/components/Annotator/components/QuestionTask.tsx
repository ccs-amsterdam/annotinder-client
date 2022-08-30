import React, { useState, useEffect, useRef, RefObject, useCallback, useMemo } from "react";
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
  outline-offset: -1px;
  position: absolute;
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
`;

const QuestionMenu = styled.div<{
  minifiedAnswerForm: boolean;
  formHeight: string;
  fontSize: number;
}>`
  height: ${(props) => (props.minifiedAnswerForm ? null : props.formHeight)};
  min-height: ${(props) => (props.minifiedAnswerForm ? null : "200px")};
  font-size: ${(props) => props.fontSize}em;
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
  const textref = useRef();
  const boxref = useRef();
  const coderef = useRef();
  const refs = useMemo(() => {
    return { text: textref, box: boxref, code: coderef };
  }, []);

  const [textReady, setTextReady] = useState(0);
  const [settings, setSettings] = useLocalStorage("questionTaskSettings", {
    splitHeight: 70,
    upperTextSize: 1,
    lowerTextSize: 1,
  });
  const divref = useRef(null);
  const [conditionReport, setConditionReport] = useState<ConditionReport>(null);

  useEffect(() => {
    // when new unit arrives, reset style (in case of swipe) and make
    // text transparent.
    resetStyle(refs.text, refs.box);
  }, [refs.text, refs.box, unit, questionIndex]);

  useEffect(() => {
    // fade in text when the text is ready (which Document tells us)
    fadeIn(refs.text, refs.box);
  }, [textReady, refs.text, refs.box, questionIndex]);

  useEffect(() => {
    // When unit changes, refresh condition report
    // (the backend can also return a condition report for a new unit)
    setConditionReport(unit.report || {});
  }, [unit]);

  const startTransition = useCallback(
    (trans: Transition) => {
      const direction = trans?.direction || "up";
      const color = trans?.color || "white";
      const r: SwipeRefs = refs;
      if (r?.box?.current?.style != null && r?.text?.current != null) {
        r.code.current.innerText = "";
        r.text.current.style.transition = `transform 250ms ease-out, opacity 250ms ease-out`;
        r.text.current.style.transform = `translateX(${
          direction === "right" ? 100 : direction === "left" ? -100 : 0
        }%) translateY(-100%)`;
        r.box.current.style.background = color || "white";
        r.box.current.style.transition = `opacity 250ms ease-out`;
        r.box.current.style.opacity = "0";
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
  let splitHeight = unit?.settings?.text_window_size ?? settings.splitHeight;
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
              setReady={setTextReady}
              showAnnotations={codebook?.questions?.[questionIndex]?.showAnnotations || []}
              fullScreenNode={fullScreenNode}
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
          startTransition={startTransition}
          blockEvents={blockEvents}
        >
          <SettingsPopup
            settings={settings}
            setSettings={setSettings}
            fullScreenNode={fullScreenNode}
            cantChangeSplitHeight={minifiedAnswerForm || unit?.settings?.text_window_size != null}
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
          bottom: "0",
          position: "fixed",
          width: "50%",
          zIndex: 10000,
          background: "#dfeffb",
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

const resetStyle = (text: RefObject<HTMLElement>, box: RefObject<HTMLElement>): void => {
  if (!text.current) return null;
  box.current.style.backgroundColor = "white";
  text.current.style.transition = ``;
  box.current.style.transition = ``;
  box.current.style.opacity = "0";
  text.current.style.transform = "translateX(0%) translateY(0%)";
};

const fadeIn = (text: RefObject<HTMLElement>, box: RefObject<HTMLElement>): void => {
  if (!text.current) return null;
  box.current.style.transition = `opacity 200ms ease-out`;
  box.current.style.opacity = "1";
};

export default React.memo(QuestionTask);
