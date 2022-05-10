import React from "react";
import { Segment } from "semantic-ui-react";
import Annotinder from "./AnswerFieldAnnotinder";
import Confirm from "./AnswerFieldConfirm";
import Scale from "./AnswerFieldScale";
import SearchCode from "./AnswerFieldSearchCode";
import SelectCode from "./AnswerFieldSelectCode";

const AnswerField = ({ currentAnswer, questions, questionIndex, onSelect, swipe, blockEvents }) => {
  const question = questions[questionIndex];

  const renderAnswerField = () => {
    if (question.type === "search code")
      return (
        <SearchCode
          options={question.options}
          currentAnswer={currentAnswer[0].value}
          callback={onSelect}
          blockEvents={blockEvents}
        />
      );
    if (question.type === "scale")
      return (
        <Scale
          items={question.items || [""]}
          options={question.options}
          currentAnswer={currentAnswer}
          callback={onSelect}
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
          callback={onSelect}
          blockEvents={blockEvents}
        />
      );
    if (question.type === "annotinder")
      return (
        <Annotinder
          swipeOptions={question.swipeOptions}
          currentAnswer={currentAnswer[0].value}
          callback={onSelect}
          swipe={swipe}
          blockEvents={blockEvents}
        />
      );
    if (question.type === "confirm")
      return <Confirm callback={onSelect} swipe={swipe} blockEvents={blockEvents} />;
    return null;
  };

  return (
    <Segment
      style={{
        flex: "0.5 1 auto",
        padding: "0",
        overflowY: "auto",
        height: "100%",
        width: "100%",
        margin: "0",
      }}
    >
      {renderAnswerField()}
    </Segment>
  );
};

export default React.memo(AnswerField);
