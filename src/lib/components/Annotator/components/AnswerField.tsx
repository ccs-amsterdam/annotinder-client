import React, { useEffect, useRef, useState } from "react";
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
  color: var(--text-inversed-fixed);

  &::before {
    position: sticky;
  }
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

  useEffect(() => {
    // Manually handle the sizing of the answerfield,
    // so that we can add transitions based on min-height.
    let newMinHeight = null;
    let resizeId;
    let startHeight = null;
    const minHeight = 60;
    let shrinkchecks = 0;
    let maxheight = null;

    function resize() {
      if (!answerRef.current) {
        resizeId = requestAnimationFrame(resize);
        return;
      }
      const el = answerRef.current;
      if (startHeight === null) {
        const container = el.closest(".QuestionContainer");
        maxheight = container ? container.clientHeight / 2 : 300;
        startHeight = Math.max(60, Math.min(maxheight, el.clientHeight));
        el.style["min-height"] = minHeight + "px";
      }

      if (el.clientHeight < startHeight || startHeight === minHeight) {
        // if shrinking started, or if startheight is already the minimum

        console.log(el.clientHeight, startHeight, el.scrollHeight);
        if (el.scrollHeight > el.clientHeight) {
          // see if the container overflows. If so, we can calculate the required height
          // and stop the loop
          const minheight = Math.max(100, el.scrollHeight + 10);
          newMinHeight = Math.min(maxheight, minheight);

          answerRef.current.style["min-height"] = newMinHeight + "px";
          //answerRef.current.style.opacity = 1;
          return;
        }

        if (el.clientHeight === minHeight) {
          // if minimum size is reached, and we know that shrinking started without overflowing
          // the container, we can break the loop
          if (startHeight !== minHeight) return;

          // if startHeight === minHeight, we can't tell whether shrinking started.
          // In this case we just quit after checking max 10 frames
          shrinkchecks++;
          if (shrinkchecks > 10) return;
        }
      }

      resizeId = requestAnimationFrame(resize);
    }

    // add a small delay, because safari is somehow too slow in recalculating the
    // scrollheight, so that sometimes after the contains starts shrinking it still
    // has the scrollheight from the previous question
    setTimeout(() => resize(), 50);

    return () => cancelAnimationFrame(resizeId);
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
