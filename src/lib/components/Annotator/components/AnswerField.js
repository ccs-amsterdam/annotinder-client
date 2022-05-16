import React from "react";
import Annotinder from "./AnswerFieldAnnotinder";
import Confirm from "./AnswerFieldConfirm";
import Scale from "./AnswerFieldScale";
import SearchCode from "./AnswerFieldSearchCode";
import SelectCode from "./AnswerFieldSelectCode";
import Inputs from "./AnswerFieldInputs";

const AnswerField = ({ currentAnswer, questions, questionIndex, onSelect, swipe, blockEvents }) => {
  const question = questions[questionIndex];

  if (question.type === "search code")
    return (
      <SearchCode
        options={question.options}
        currentAnswer={currentAnswer[0].value}
        onSelect={onSelect}
        blockEvents={blockEvents}
      />
    );

  if (question.type === "scale")
    return (
      <Scale
        items={question.items || [""]}
        options={question.options}
        currentAnswer={currentAnswer}
        onSelect={onSelect}
        blockEvents={blockEvents}
      />
    );

  if (question.type === "select code")
    return (
      <SelectCode
        options={question.options}
        currentAnswer={currentAnswer[0].value}
        singleRow={question.single_row}
        sameSize={question.same_size}
        onSelect={onSelect}
        blockEvents={blockEvents}
      />
    );

  if (question.type === "annotinder")
    return (
      <Annotinder
        swipeOptions={question.swipeOptions}
        currentAnswer={currentAnswer[0].value}
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
        items={question.items || [""]}
        currentAnswer={currentAnswer}
        onSelect={onSelect}
        blockEvents={blockEvents}
      />
    );

  return null;
};

export default React.memo(AnswerField);
