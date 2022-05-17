import React, { useState, useEffect, useRef } from "react";
import QuestionForm from "./QuestionForm";
import Document from "../../Document/Document";
import { useSwipeable } from "react-swipeable";
import { codeBookEdgesToMap, getCodeTreeArray } from "../../../functions/codebook";
import { Button, Form, Input, Portal, Segment } from "semantic-ui-react";
import standardizeColor from "../../../functions/standardizeColor";
import swipeControl from "../functions/swipeControl";
import useLocalStorage from "../../../hooks/useLocalStorage";

const documentSettings = {
  centerVertical: true,
};

const QuestionTask = ({ unit, codebook, setUnitIndex, blockEvents, fullScreenNode }) => {
  const [tokens, setTokens] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState(null);
  const refs = {
    text: useRef(),
    box: useRef(),
    code: useRef(),
    positionTracker: useRef({ containerRef: null }),
  };
  const [textReady, setTextReady] = useState(0);
  const [settings, setSettings] = useLocalStorage("questionTaskSettings", {
    splitHeight: 70,
    upperTextSize: 1,
    lowerTextSize: 1,
  });
  const divref = useRef(null);

  useEffect(() => {
    if (!codebook?.questions) return;
    setQuestions(prepareQuestions(codebook));
  }, [codebook]);

  useEffect(() => {
    if (!refs?.text.current) return null;
    refs.box.current.style.backgroundColor = "white";
    refs.text.current.style.transition = ``;
    refs.box.current.style.transition = ``;
    refs.box.current.style.opacity = 0;
    refs.text.current.style.transform = "translateX(0%) translateY(0%)";
  }, [refs.text, refs.box, unit, questionIndex]);

  useEffect(() => {
    if (!refs?.text.current) return null;
    refs.box.current.style.transition = `opacity 200ms ease-out`;
    refs.box.current.style.opacity = 1;
  }, [textReady, refs.text, refs.box, questionIndex]);

  // swipe controlls need to be up in the QuestionTask component due to working on the div containing the question screen
  // use separate swipe for text (document) and menu rows, because swiping up in the text is only possible if scrolled all the way down
  const [swipe, setSwipe] = useState(null);
  const textSwipe = useSwipeable(swipeControl(questions?.[questionIndex], refs, setSwipe, false));
  const menuSwipe = useSwipeable(swipeControl(questions?.[questionIndex], refs, setSwipe, true));

  if (!unit) return null;

  // The size of the text div, in pct compared to the answer div
  let splitHeight = unit?.text_window_size ?? settings.splitHeight;
  const formHeight = splitHeight === "auto" ? "auto" : `${100 - splitHeight}%`;

  // if there are only annotinder or confirm questions, minify the answer form
  let minifiedAnswerForm = true;
  const minifiable = ["annotinder", "confirm"];
  for (let question of questions || [])
    if (!minifiable.includes(question.type)) minifiedAnswerForm = false;

  return (
    <div
      ref={divref}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        {...textSwipe}
        style={{
          flex: "1 1 auto",
          position: "relative",
          //height: `${splitHeight}%`,
        }}
      >
        <div
          ref={refs.box}
          style={{
            height: "100%",
            width: "100%",
            overflow: "hidden",
            outline: "1px solid black",
            outlineOffset: "-1px",
            position: "absolute",

            //border: "0.5px solid",
          }}
        >
          {/* This div moves around behind the div containing the document to show the swipe code  */}
          <div
            ref={refs.code}
            style={{ padding: "0.6em 0.3em", width: "100%", fontSize: "3em", position: "absolute" }}
          />
          <div
            ref={refs.text}
            style={{
              height: "100%",
              width: "100%",
              position: "absolute",
              top: "0",
              backgroundColor: "white",
              //overflow: "hidden",
              fontSize: `${settings.upperTextSize}em`,
              boxShadow: "5px 5px 20px 5px",

              //border: "0.5px solid",
            }}
          >
            <Document
              unit={unit}
              settings={documentSettings}
              setReady={setTextReady}
              returnTokens={setTokens}
              fullScreenNode={fullScreenNode}
              positionTracker={refs.positionTracker}
            />
          </div>
        </div>
      </div>
      <div
        {...menuSwipe}
        style={{
          height: minifiedAnswerForm ? null : formHeight,
          minHeight: minifiedAnswerForm ? null : "200px", // minimum height in px to prevent mobile keyboard from making things unreadable
          fontSize: `${settings.lowerTextSize}em`,
        }}
      >
        <QuestionForm
          unit={unit}
          tokens={tokens}
          questions={questions}
          questionIndex={questionIndex}
          setQuestionIndex={setQuestionIndex}
          setUnitIndex={setUnitIndex}
          swipe={swipe}
          blockEvents={blockEvents}
        >
          <SettingsPopup
            settings={settings}
            setSettings={setSettings}
            fullScreenNode={fullScreenNode}
            cantChangeSplitHeight={minifiedAnswerForm || unit?.text_window_size != null}
          />
        </QuestionForm>
      </div>
    </div>
  );
};

const SettingsPopup = ({ settings, setSettings, fullScreenNode, cantChangeSplitHeight }) => {
  return (
    <Portal
      mountNode={fullScreenNode || undefined}
      on="click"
      trigger={
        <Button
          size="large"
          icon="setting"
          style={{
            background: "transparent",
            cursor: "pointer",
            color: "white",
            padding: "10px 10px",
            paddingBottom: "2px",
            zIndex: 9000,
          }}
        />
      }
    >
      <Segment
        style={{
          bottom: "0",
          position: "fixed",
          width: "50%",
          zIndex: 1000,
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
                  <font style={{ color: "blue" }}>{`${settings.splitHeight}%`}</font>
                </label>
                <Input
                  size="mini"
                  step={2}
                  min={20}
                  max={80}
                  type="range"
                  value={settings.splitHeight}
                  onChange={(e, d) => setSettings((state) => ({ ...state, splitHeight: d.value }))}
                />
              </Form.Field>
            )}
            <Form.Field>
              <label>
                Content text size{" "}
                <font style={{ color: "blue" }}>{`${settings.upperTextSize}`}</font>
              </label>
              <Input
                size="mini"
                step={0.025}
                min={0.4}
                max={1.6}
                type="range"
                value={settings.upperTextSize}
                onChange={(e, d) => setSettings((state) => ({ ...state, upperTextSize: d.value }))}
              />
            </Form.Field>
            <Form.Field>
              <label>
                Answer field text size{" "}
                <font style={{ color: "blue" }}>{`${settings.lowerTextSize}`}</font>
              </label>
              <Input
                size="mini"
                step={0.025}
                min={0.4}
                max={1.6}
                type="range"
                value={settings.lowerTextSize}
                onChange={(e, d) => setSettings((state) => ({ ...state, lowerTextSize: d.value }))}
              />
            </Form.Field>
          </Form.Group>
        </Form>
      </Segment>
    </Portal>
  );
};

const prepareQuestions = (codebook) => {
  const questions = codebook.questions;
  return questions.map((question) => {
    const fillMissingColor = !["scale"].includes(question.type);
    const codeMap = codeBookEdgesToMap(question.codes, fillMissingColor);
    let cta = getCodeTreeArray(codeMap);
    const [options, swipeOptions] = getOptions(cta);
    return { ...question, options, swipeOptions }; // it's important that this deep copies question
  });
};

const getOptions = (cta) => {
  const options = [];
  const swipeOptions = {}; // object, for fast lookup in swipeControl

  for (let code of cta) {
    if (!code.active) continue;
    if (!code.activeParent) continue;
    let tree = code.tree.join(" - ");
    const option = {
      code: code.code,
      tree: tree,
      makes_irrelevant: code.makes_irrelevant,
      required_for: code.required_for,
      color: standardizeColor(code.color, "88"),
      ref: React.createRef(), // used for keyboard navigation of buttons
    };
    if (code.swipe) swipeOptions[code.swipe] = option;
    options.push(option);
  }
  // if swipe options for left and right are not specified, use order.
  if (!swipeOptions.left && !swipeOptions.right) {
    swipeOptions.left = options?.[0];
    swipeOptions.right = options?.[1];
    swipeOptions.up = options?.[2];
  }
  return [options, swipeOptions];
};

export default React.memo(QuestionTask);
