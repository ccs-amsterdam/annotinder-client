import React, { useEffect, useState, useRef, createRef } from "react";
import { Button, Form } from "semantic-ui-react";
import { scrollToMiddle } from "../../../functions/scroll";

const Text = ({ items, currentAnswer, onSelect, blockEvents }) => {
  const [selectedItem, setSelectedItem] = useState(0);
  const [answers, setAnswers] = useState(null);

  useEffect(() => {
    setSelectedItem(0);
    if (currentAnswer && Array.isArray(currentAnswer) && currentAnswer.length === items.length) {
      setAnswers(currentAnswer);
    } else {
      const answers = items.map((item) => ({ item: item?.name || item, value: null }));
      setAnswers(answers);
    }
  }, [currentAnswer, items, onSelect, setSelectedItem]);

  const nAnswered = 0;
  const done = false;
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
      <div>
        <Items
          items={items}
          onSelect={onSelect}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          blockEvents={blockEvents}
        />
      </div>
      <div>
        <Button
          primary
          fluid
          disabled={!done}
          icon={done ? "play" : null}
          content={done ? "Continue" : `${nAnswered} / ${answers.length}`}
          style={{
            flex: "1 1 0px",
            textAlign: "center",
            color: done ? null : "black",
            margin: "0",
            background: done ? null : "white",
            border: `5px solid ${selectedItem < 0 ? "black" : "#ece9e9"}`,
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

const Items = ({ items, onSelect, selectedItem, setSelectedItem, blockEvents }) => {
  const containerRef = useRef(null);
  const rowRefs = useRef([]);

  console.log(selectedItem);
  useEffect(() => {
    const onKeydown = (e) => {
      if (e.keyCode === 9) {
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
          if (e.shift)
            scrollToMiddle(
              containerRef?.current,
              rowRefs?.current?.[newselecteditem]?.current,
              0.5
            );
          rowRefs?.current?.[newselecteditem]?.current?.focus();
          return newselecteditem;
        });
      }
    };

    if (!blockEvents) {
      window.addEventListener("keydown", onKeydown);
    } else window.removeEventListener("keydown", onKeydown);
    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  }, [blockEvents, items, setSelectedItem, containerRef, rowRefs]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: "1 1 auto",
        overflow: "auto",
      }}
    >
      {items.map((itemObj, itemIndex) => {
        const itemlabel = itemObj.label || itemObj.name || itemObj;
        const ref = createRef();
        rowRefs.current[itemIndex] = ref;
        return (
          <div key={itemIndex} style={{ paddingTop: "10px", width: "100%", textAlign: "center" }}>
            <Form onSubmit={(e, d) => console.log(d.value)}>
              <Form.Field>
                <label style={{ color: "black" }}>{itemlabel}</label>
                <input style={{ maxWidth: "300px" }} />
              </Form.Field>
            </Form>
          </div>
        );
      })}
    </div>
  );
};

export default Text;
