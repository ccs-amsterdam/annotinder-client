import React, { useEffect, useState, useRef, createRef } from "react";
import { Button, Form } from "semantic-ui-react";
import { scrollToMiddle } from "../../../functions/scroll";

/**
 * Answerfield for (multiple) open input items, like text, number
 * @returns
 */
const Inputs = ({ items, currentAnswer, onSelect, blockEvents }) => {
  const [selectedItem, setSelectedItem] = useState(0);
  const [answers, setAnswers] = useState(null);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      return "If you leave now, any changes made to text fields will not be saved.";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    // read currentAnswer into answers state
    setSelectedItem(0);
    if (currentAnswer && Array.isArray(currentAnswer) && currentAnswer.length === items.length) {
      setAnswers(currentAnswer.map((a, i) => ({ ...a, optional: items?.[i]?.optional })));
    } else {
      const answers = items.map((item) => ({
        item: item?.name || item,
        value: null,
        optional: item?.optional,
      }));
      setAnswers(answers);
    }
  }, [currentAnswer, items, onSelect, setSelectedItem]);

  const done = answers && !answers.some((a) => (a.value === null || a.invalid) && !a.optional);
  if (!answers) return null;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Items
        answers={answers}
        setAnswers={setAnswers}
        items={items}
        onSelect={onSelect}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        blockEvents={blockEvents}
      />

      <div>
        <Button
          primary
          fluid
          disabled={!done}
          icon={done ? "play" : null}
          content={done ? "Continue" : "Please complete the form to continue"}
          style={{
            flex: "1 1 0px",
            textAlign: "center",
            color: done ? null : "black",
            margin: "0",
            background: done ? null : "white",
            border: `5px solid ${selectedItem === items.length ? "black" : "#ece9e9"}`,
          }}
          onClick={() => {
            // this is a bit of an odd one out. We didn't anticipate having multiple answers,
            // so some of the previous logic doesn't hold
            onSelect({ code: answers });
          }}
        />
      </div>
    </div>
  );
};

const Items = ({
  answers,
  setAnswers,
  items,
  onSelect,
  selectedItem,
  setSelectedItem,
  blockEvents,
}) => {
  const containerRef = useRef(null);
  const rowRefs = useRef([]);

  useEffect(() => {
    rowRefs.current = items.map(() => createRef());
  }, [items, rowRefs]);

  useEffect(() => {
    const onKeydown = (e) => {
      if (e.keyCode === 9 || e.KeyCode) {
        // tab key
        e.preventDefault();
        e.stopPropagation();

        // go to next item (including continue button) or go to first when none left
        setSelectedItem((selectedItem) => {
          let newselecteditem;
          if (e.shiftKey) {
            newselecteditem = selectedItem <= 0 ? items.length : selectedItem - 1;
          } else {
            newselecteditem = selectedItem >= items.length ? 0 : selectedItem + 1;
          }
          return newselecteditem;
        });
      }

      if ((e.keyCode === 32 || e.keyCode === 13) && selectedItem === items.length) {
        if (!answers.some((a) => a.value === null)) onSelect({ code: answers });
        return;
      }
    };

    if (!blockEvents) {
      window.addEventListener("keydown", onKeydown);
    } else window.removeEventListener("keydown", onKeydown);
    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  }, [blockEvents, items, onSelect, answers, selectedItem, setSelectedItem]);

  useEffect(() => {
    scrollToMiddle(containerRef?.current, rowRefs?.current?.[selectedItem]?.current, 0.5);
    const selectedel = rowRefs?.current?.[selectedItem]?.current;
    if (selectedel) {
      setTimeout(() => selectedel.focus(), 10); // otherwise react keeps complaining
    } else {
      setTimeout(() => document.activeElement.blur(), 10);
    }
  }, [selectedItem, containerRef, rowRefs]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: "1 1 auto",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {items.map((itemObj, itemIndex) => {
        let itemlabel = itemObj.label || itemObj.name || itemObj;

        let margin = "0px 0px";
        if (itemIndex === 0) margin = "auto 0px 0px 0px";
        if (itemIndex === items.length - 1) margin = "0px 0px auto 0px";
        return (
          <div
            key={itemIndex}
            style={{ padding: "10px", width: "100%", textAlign: "center", margin }}
          >
            <Form onSubmit={(e, d) => setSelectedItem((current) => current + 1)}>
              <Form.Field>
                <label style={{ color: "black" }}>
                  {itemlabel}
                  <i style={{ color: "grey" }}>{itemObj?.optional ? " (optional)" : ""}</i>
                </label>

                <Input
                  item={itemObj}
                  rowRefs={rowRefs}
                  answers={answers}
                  setAnswers={setAnswers}
                  itemIndex={itemIndex}
                />
              </Form.Field>
            </Form>
          </div>
        );
      })}
    </div>
  );
};

const Input = ({ item, rowRefs, answers, setAnswers, itemIndex }) => {
  const ref = rowRefs?.current?.[itemIndex];

  if (item?.type === "number") {
    return (
      <input
        key={item.name}
        ref={ref}
        type={"number"}
        min={item?.min}
        max={item?.max}
        value={Number(answers?.[itemIndex]?.value) || null}
        style={{
          maxWidth: "150px",
          textAlign: "center",
          background: answers[itemIndex].invalid ? "#ff000088" : "white",
        }}
        onChange={(e) => {
          if (!answers?.[itemIndex]) return;
          let value = e.target.value;
          answers[itemIndex].value = value;
          answers[itemIndex].invalid =
            isNaN(value) || (item?.min && value < item.min) || (item?.max && value > item.max);
          setAnswers([...answers]);
        }}
      />
    );
  }

  if (item?.type === "textarea") {
    return (
      <textarea
        key={item.name}
        ref={ref}
        rows={item?.rows || 5}
        value={answers?.[itemIndex]?.value}
        onChange={(e) => {
          if (!answers?.[itemIndex]) return;
          answers[itemIndex].value = e.target.value;
          if (answers[itemIndex].value === "") answers[itemIndex].value = null;
          setAnswers([...answers]);
        }}
      ></textarea>
    );
  }

  return (
    <input
      key={item.name}
      ref={ref}
      value={answers?.[itemIndex]?.value || ""}
      style={{ maxWidth: "300px", textAlign: "center" }}
      onChange={(e) => {
        if (!answers?.[itemIndex]) return;
        answers[itemIndex].value = e.target.value;
        if (answers[itemIndex].value === "") answers[itemIndex].value = null;
        setAnswers([...answers]);
      }}
    />
  );
};

export default Inputs;
