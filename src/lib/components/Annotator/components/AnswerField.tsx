import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Annotinder from "./AnswerFieldAnnotinder";
import Confirm from "./AnswerFieldConfirm";
import Scale from "./AnswerFieldScale";
import SearchCode from "./AnswerFieldSearchCode";
import SelectCode from "./AnswerFieldSelectCode";
import Inputs from "./AnswerFieldInputs";
import { AnswerItem, OnSelectParams, Swipes, Question, Answer, Transition } from "../../../types";
import styled from "styled-components";

const AnswerDiv = styled.div`
  transition: all 0.2s;
  position: relative;
  padding: 0;
  overflow-y: auto;
  height: 60px;
  width: 100%;
  margin: 0;
  font-size: inherit;
  color: var(--text-inversed);
`;

interface AnswerFieldProps {
  answers: Answer[];
  questions: Question[];
  questionIndex: number;
  onAnswer: (items: AnswerItem[], onlySave: boolean, transition?: Transition) => void;
  swipe: Swipes;
  blockEvents?: boolean;
}

const AnswerField = ({
  answers,
  questions,
  questionIndex,
  onAnswer,
  swipe,
  blockEvents = false,
}: AnswerFieldProps) => {
  const [question, setQuestion] = useState(null);
  const [answerItems, setAnswerItems] = useState(null);
  const answerRef = useRef(null);

  useEffect(() => {
    const currentAnswer = answers?.[questionIndex]?.items;
    // Note that currentAnswer:
    // is an array of objects: [{item: 'string of item name', values: [array of unique answer values]}]
    // order and length mathces question.items. If question doesn't have items, it must be an array of length 1
    setAnswerItems(currentAnswer);
    setQuestion(questions[questionIndex]);
  }, [answers, questions, questionIndex]);

  useEffect(() => {
    // if answer changed but has not been saved, warn users when they try to close the app
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      const msg = "If you leave now, any changes made in the current unit will not be saved."; // most browsers actually show default message
      e.returnValue = msg;
      return msg;
    };

    if (answers?.[questionIndex]?.items !== answerItems) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    } else {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [answers, questionIndex, answerItems]);

  useLayoutEffect(() => {
    // Manually handle the sizing of the answerfield,
    // so that we can add transitions. This should run
    // after rendering a new answer field (after onAnswer)
    // just before updating layout, and then interject with
    // changes to the answer field height
    const timer = setTimeout(() => {
      let maxframes = 60;
      requestAnimationFrame(function animate() {
        if (!answerRef.current) return;
        if (maxframes < 0) {
          answerRef.current.style.opacity = 1;
          return;
        }
        maxframes--;

        answerRef.current.style.opacity = 0;
        if (answerRef.current.scrollHeight > answerRef.current.offsetHeight) {
          // if the field is scrollable, increase size to scroll height plus a margin
          const minheight = Math.max(100, answerRef.current.scrollHeight + 10);
          const container = answerRef.current?.closest(".QuestionContainer");
          const maxheight = container ? container.clientHeight / 2 : 300;
          answerRef.current.style["min-height"] = `min(${minheight}px, ${maxheight}px)`;
          answerRef.current.style.opacity = 1;
        } else {
          // if the field is not scrollable, scrollHeight can be too high if the previous
          // height was higher than needed. Therefore set to minimum height, and then
          // per animation frame check if the field become scrollable, at which point
          // it again increases the height and breaks the loop
          answerRef.current.style["min-height"] = "60px";

          if (answerRef.current.clientHeight > 60) return requestAnimationFrame(animate);
        }
        answerRef.current.style.opacity = 1;
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [answerRef, onAnswer]);

  const onFinish = () => {
    onAnswer(answerItems, false);
  };

  const onSelect = ({
    value,
    itemIndex = 0,
    multiple = false,
    finish = false,
    invalid = false,
    save = false,
    transition,
  }: OnSelectParams = {}) => {
    // this bad boy is used in all of the AnswerField sub-components to write values.
    // it's a bit complicated here, but it makes the code within the sub-components easier
    // answerItems is an array of objects, where each object is an item.
    //    if a question has no items, it is still an array of length 1 for consistency
    // each item object has a .value, which is an array of multiple values
    //    if an item can only have 1 value, it is still an array of length 1 for consistency

    if (Array.isArray(value)) {
      // if value is an array, write exact array to answer
      answerItems[itemIndex] = { ...answerItems[itemIndex], values: value };
    } else {
      // if a single value, check whether it should be treated as multiple, or add as array of length 1
      if (multiple) {
        const valueIndex = answerItems[itemIndex].values.findIndex(
          (v: string | number) => v === value
        );
        if (valueIndex < 0) {
          // if value doesn't exist yet, add it
          answerItems[itemIndex].values.push(value);
        } else {
          // if it does exist, remove it
          answerItems[itemIndex].values.splice(valueIndex, 1);
        }
      } else {
        answerItems[itemIndex] = { ...answerItems[itemIndex], values: [value] };
      }
    }

    const newAnswerItems = [...answerItems];
    newAnswerItems[itemIndex].invalid = invalid;
    setAnswerItems(newAnswerItems);
    if (finish) {
      onAnswer(newAnswerItems, false, transition);
    } else {
      if (save) onAnswer(newAnswerItems, true);
    }
    return newAnswerItems;
  };

  if (!answerItems) return null;
  // use these props:
  // values         array of values
  // answerItems     object with items as keys and values array as value

  let answerfield = null;
  if (question.type === "select code")
    answerfield = (
      <SelectCode
        options={question.options}
        values={answerItems[0].values} // only use first because selectCode doesn't support items
        multiple={question.multiple}
        singleRow={question.single_row}
        sameSize={question.same_size}
        onSelect={onSelect}
        onFinish={onFinish}
        blockEvents={blockEvents} // for disabling key/click events
        questionIndex={questionIndex} // for use in useEffect for resetting values on question change
        scrollRef={answerRef}
      />
    );

  if (question.type === "search code")
    answerfield = (
      <SearchCode
        options={question.options}
        values={answerItems[0].values}
        multiple={question.multiple}
        onSelect={onSelect}
        onFinish={onFinish}
        blockEvents={blockEvents}
      />
    );

  if (question.type === "scale")
    answerfield = (
      <Scale
        answerItems={answerItems}
        items={question.items || [""]}
        options={question.options}
        onSelect={onSelect}
        onFinish={onFinish}
        blockEvents={blockEvents}
        questionIndex={questionIndex}
        scrollRef={answerRef}
      />
    );

  if (question.type === "annotinder")
    answerfield = (
      <Annotinder
        answerItems={answerItems}
        swipeOptions={question.swipeOptions}
        onSelect={onSelect}
        swipe={swipe}
        blockEvents={blockEvents}
      />
    );

  if (question.type === "confirm")
    answerfield = (
      <Confirm
        onSelect={onSelect}
        button={question?.button}
        swipe={swipe}
        blockEvents={blockEvents}
      />
    );

  if (question.type === "inputs")
    answerfield = (
      <Inputs
        items={question.items || [null]}
        answerItems={answerItems}
        onSelect={onSelect}
        onFinish={onFinish}
        blockEvents={blockEvents}
        questionIndex={questionIndex}
        scrollRef={answerRef}
      />
    );

  return <AnswerDiv ref={answerRef}>{answerfield}</AnswerDiv>;
};

export default React.memo(AnswerField);
