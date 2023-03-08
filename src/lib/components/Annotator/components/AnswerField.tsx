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
  display: flex;
  position: relative;
  padding: 0;
  overflow-y: auto;
  height: 60px;
  min-height: 200px;
  width: 100%;
  margin: 0;
  font-size: inherit;
  color: var(--text-inversed-fixed);

  & .InnerAnswerField {
    width: 100%;
    margin-top: auto;
  }

  /* &::before {
    position: sticky;
  } */
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
    // change the min-height of the answerField based on whether it needs to grow
    // or shrink. This way, the transition animation works (which is not possible with flex)
    const resize = () => {
      if (!answerRef.current) return;
      const el = answerRef.current;

      if (el.scrollHeight > el.clientHeight) {
        // if div is scrollable, it needs to grow. growAnswerField
        // does this taking the height of the content into account
        growAnswerField(el);
        return;
      }
      el.style["border-top"] = "";

      const innerEl = el.children[0];
      if (!innerEl) return;
      if (el.clientHeight - innerEl.clientHeight > 15) {
        // if the innerAnswerField is smaller than the answerField (with some margin), we can
        // shrink the answerfield
        answerRef.current.style["min-height"] = innerEl.clientHeight + "px";
      }
    };

    // first do a quick update, using a small delay that is enough for most content
    setTimeout(() => resize(), 50);
    // then check whether height needs to change with short intervalls. This is fairly inexpensive
    // and ensures that theres no issues when content is slow to load (e.g., images)
    const interval = setInterval(() => {
      resize();
    }, 500);
    return () => clearInterval(interval);
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
    // it's a bit complicated here, but it makes the code within the sub-components easier.
    // answerItems is an array of objects, where each object is an item.
    //    if a question has no items (i.e. just a single value), it is still an array of length 1 for consistency
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
        vertical={question.vertical}
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
        button={question.options?.[0]?.code}
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

  return (
    <AnswerDiv ref={answerRef}>
      <div className="InnerAnswerField">{answerfield}</div>
    </AnswerDiv>
  );
};

const growAnswerField = (el: HTMLDivElement) => {
  if (!el) return;
  const container = el.closest(".QuestionContainer");
  const questionMenu = container.querySelector(".QuestionMenu");
  const questionMenuHeight = questionMenu.scrollHeight;
  const content = container.querySelector(".DocumentContent");
  const minContentHeight = container.clientHeight / 2;
  const contentHeight = Math.min(content.clientHeight, minContentHeight);

  const maxheight = container.clientHeight - contentHeight - questionMenuHeight - 10;

  const minheight = Math.max(100, el.scrollHeight);
  const newMinHeight = Math.min(maxheight, minheight);

  if (maxheight < minheight) el.style["border-top"] = "1px solid var(--background-fixed)";
  el.style["min-height"] = newMinHeight + "px";
  //answerRef.current.style.opacity = 1;
};

export default React.memo(AnswerField);
