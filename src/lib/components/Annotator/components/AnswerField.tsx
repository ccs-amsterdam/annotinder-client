import React, { useEffect, useState } from "react";
import Annotinder from "./AnswerFieldAnnotinder";
import Confirm from "./AnswerFieldConfirm";
import Scale from "./AnswerFieldScale";
import SearchCode from "./AnswerFieldSearchCode";
import SelectCode from "./AnswerFieldSelectCode";
import Inputs from "./AnswerFieldInputs";
import { OnSelectParams } from "../../../types";

const MIN_DELAY = 200;
// TODO: using questionindex for resetting states is bad, because it doesn't update for consequtive codebooks with 1 question

const AnswerField = ({
  currentAnswer,
  questions,
  questionIndex,
  onAnswer,
  swipe,
  blockEvents = false,
}) => {
  const question = questions[questionIndex];
  const [itemValues, setItemValues] = useState(currentAnswer);

  console.log(question);
  useEffect(() => {
    // Note that currentAnswer:
    // is an array of objects: [{item: 'string of item name', values: [array of unique answer values]}]
    // order and length mathces question.items. If question doesn't have items, it must be an array of length 1
    setItemValues(currentAnswer);
  }, [currentAnswer]);

  useEffect(() => {
    // if answer changed but has not been saved, warn users when they try to close the app
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      const msg = "If you leave now, any changes made in the current unit will not be saved."; // most browsers actually show default message
      e.returnValue = msg;
      return msg;
    };

    if (currentAnswer !== itemValues) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    } else {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentAnswer, itemValues]);

  const onFinish = () => {
    onAnswer(itemValues, false, MIN_DELAY);
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
    // itemValues is an array of objects, where each object is an item.
    //    if a question has no items, it is still an array of length 1 for consistency
    // each item object has a .value, which is an array of multiple values
    //    if an item can only have 1 value, it is still an array of length 1 for consistency

    if (Array.isArray(value)) {
      // if value is an array, write exact array to answer
      itemValues[itemIndex] = { ...itemValues[itemIndex], values: value };
    } else {
      // if a single value, check whether it should be treated as multiple, or add as array of length 1
      if (multiple) {
        const valueIndex = itemValues[itemIndex].values.findIndex((v) => v === value);
        if (valueIndex < 0) {
          // if value doesn't exist yet, add it
          itemValues[itemIndex].values.push(value);
        } else {
          // if it does exist, remove it
          itemValues[itemIndex].values.splice(valueIndex, 1);
        }
      } else {
        itemValues[itemIndex] = { ...itemValues[itemIndex], values: [value] };
      }
    }

    const newItemValues = [...itemValues];
    newItemValues[itemIndex].invalid = invalid;
    setItemValues(newItemValues);
    if (finish) {
      onAnswer(newItemValues, false, MIN_DELAY);
    } else {
      if (save) onAnswer(newItemValues, true, MIN_DELAY);
    }
    return newItemValues;
  };

  if (!itemValues) return null;
  // use these props:
  // values         array of values
  // itemValues     object with items as keys and values array as value

  if (question.type === "select code")
    return (
      <SelectCode
        options={question.options}
        values={itemValues[0].values} // only use first because selectCode doesn't support items
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
        values={itemValues[0].values}
        multiple={question.multiple}
        onSelect={onSelect}
        onFinish={onFinish}
        blockEvents={blockEvents}
      />
    );

  if (question.type === "scale")
    return (
      <Scale
        itemValues={itemValues}
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
        itemValues={itemValues}
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
        itemValues={itemValues}
        onSelect={onSelect}
        onFinish={onFinish}
        blockEvents={blockEvents}
        questionIndex={questionIndex}
      />
    );

  return null;
};

export default React.memo(AnswerField);
