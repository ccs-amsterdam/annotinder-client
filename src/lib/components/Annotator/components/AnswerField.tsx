import React, { useEffect, useState } from "react";
import Annotinder from "./AnswerFieldAnnotinder";
import Confirm from "./AnswerFieldConfirm";
import Scale from "./AnswerFieldScale";
import SearchCode from "./AnswerFieldSearchCode";
import SelectCode from "./AnswerFieldSelectCode";
import Inputs from "./AnswerFieldInputs";
import { AnswerItem, OnSelectParams, Swipes, Question, Answer } from "../../../types";

const MIN_DELAY = 200;
// TODO: using questionindex for resetting states is bad, because it doesn't update for consequtive codebooks with 1 question

interface AnswerFieldProps {
  answers: Answer[];
  questions: Question[];
  questionIndex: number;
  onAnswer: (items: AnswerItem[], onlySave: boolean, minDelay: number) => void;
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

  const onFinish = () => {
    console.log(answerItems);
    onAnswer(answerItems, false, MIN_DELAY);
  };

  const onSelect = ({
    value,
    itemIndex = 0,
    multiple = false,
    finish = false,
    invalid = false,
    save = false,
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
      onAnswer(newAnswerItems, false, MIN_DELAY);
    } else {
      if (save) onAnswer(newAnswerItems, true, MIN_DELAY);
    }
    return newAnswerItems;
  };

  if (!answerItems) return null;
  // use these props:
  // values         array of values
  // answerItems     object with items as keys and values array as value

  if (question.type === "select code")
    return (
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
      />
    );

  if (question.type === "search code")
    return (
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
    return (
      <Scale
        answerItems={answerItems}
        items={question.items || [""]}
        options={question.options}
        onSelect={onSelect}
        onFinish={onFinish}
        blockEvents={blockEvents}
        questionIndex={questionIndex}
      />
    );

  if (question.type === "annotinder")
    return (
      <Annotinder
        answerItems={answerItems}
        swipeOptions={question.swipeOptions}
        onSelect={onSelect}
        swipe={swipe}
        blockEvents={blockEvents}
      />
    );

  if (question.type === "confirm")
    return (
      <Confirm
        onSelect={onSelect}
        button={question?.button}
        swipe={swipe}
        blockEvents={blockEvents}
      />
    );

  if (question.type === "inputs")
    return (
      <Inputs
        items={question.items || [null]}
        answerItems={answerItems}
        onSelect={onSelect}
        onFinish={onFinish}
        blockEvents={blockEvents}
        questionIndex={questionIndex}
      />
    );

  return null;
};

export default React.memo(AnswerField);
