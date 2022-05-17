import React, { useEffect, useState, useRef, createRef } from "react";
import { Button, Form } from "semantic-ui-react";
import { scrollToMiddle } from "../../../functions/scroll";

/**
 * Answerfield for (multiple) open input items, like text, number
 * @returns
 */
const Inputs = ({ items, itemValues, onSelect, onFinish, blockEvents }) => {
  const [selectedItem, setSelectedItem] = useState(0);

  useEffect(() => {
    setSelectedItem(0);
  }, [onFinish]);

  const done =
    itemValues &&
    !itemValues.some((a, i) => (a.values?.[0] == null || a.invalid) && !items[i].optional);
  if (!itemValues) return null;

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
        itemValues={itemValues}
        done={done}
        items={items}
        onSelect={onSelect}
        onFinish={onFinish}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        blockEvents={blockEvents}
      />

      <div>
        <Button
          primary
          fluid
          size="mini"
          disabled={!done}
          icon={done ? "play" : null}
          content={done ? "Continue" : "Please complete the form to continue"}
          style={{
            flex: "1 1 0px",
            textAlign: "center",
            color: done ? null : "black",
            margin: "0",
            background: done ? null : "white",
            border: `4px solid ${selectedItem === items.length ? "black" : "grey"}`,
          }}
          onClick={() => {
            // this is a bit of an odd one out. We didn't anticipate having multiple answers,
            // so some of the previous logic doesn't hold
            onFinish();
          }}
        />
      </div>
    </div>
  );
};

const Items = ({
  itemValues,
  done,
  items,
  onSelect,
  onFinish,
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
          return newselecteditem;
        });
      }

      if ((e.keyCode === 32 || e.keyCode === 13) && selectedItem === items.length) {
        if (done) onFinish();
        return;
      }
    };

    if (!blockEvents) {
      window.addEventListener("keydown", onKeydown);
    } else window.removeEventListener("keydown", onKeydown);
    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  }, [blockEvents, done, items, onSelect, onFinish, itemValues, selectedItem, setSelectedItem]);

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
        background: "rgb(211, 223, 233)",
      }}
    >
      {items.map((itemObj, itemIndex) => {
        let itemlabel = itemObj.label ?? itemObj.name ?? itemObj;

        let margin = "0px 0px";
        if (itemIndex === 0) margin = "auto 0px 0px 0px";
        if (itemIndex === items.length - 1) margin = "0px 0px auto 0px";
        return (
          <div
            key={itemObj.label}
            style={{ padding: "10px", width: "100%", textAlign: "center", margin }}
          >
            <Form onSubmit={(e, d) => setSelectedItem((current) => current + 1)}>
              <Form.Field>
                <label style={{ color: "black" }}>
                  {itemlabel}
                  <i style={{ color: "grey" }}>{itemObj?.optional ? " (optional)" : ""}</i>
                </label>

                <Input
                  itemValues={itemValues}
                  onSelect={onSelect}
                  item={itemObj}
                  rowRefs={rowRefs}
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

const Input = ({ itemValues, onSelect, item, rowRefs, itemIndex }) => {
  const ref = rowRefs?.current?.[itemIndex];
  console.log(itemValues);
  const value = itemValues?.[itemIndex]?.values?.[0]; // for all non-multiple forms

  if (item?.type === "number") {
    return (
      <input
        key={item.name}
        ref={ref}
        type={"number"}
        min={item?.min}
        max={item?.max}
        value={Number(value) || null}
        style={{
          maxWidth: "150px",
          textAlign: "center",
          background: itemValues[itemIndex]?.invalid ? "#ff000088" : "white",
        }}
        onChange={(e) => {
          if (!itemValues?.[itemIndex]) return;
          let value = e.target.value;
          const invalid =
            isNaN(value) || (item?.min && value < item.min) || (item?.max && value > item.max);
          onSelect({ value, itemIndex, invalid });
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
        value={value}
        onChange={(e) => {
          if (!itemValues?.[itemIndex]) return;
          const value = e.target.value === "" ? null : e.target.value;
          onSelect({ value, itemIndex });
        }}
      ></textarea>
    );
  }

  if (item?.type === "email")
    return (
      <input
        type="email"
        name="email"
        key={item.name}
        ref={ref}
        autoComplete={"email"}
        value={value || ""}
        style={{
          maxWidth: "300px",
          textAlign: "center",
          background: itemValues[itemIndex].invalid ? "#ff000088" : "white",
        }}
        onChange={(e) => {
          if (!itemValues?.[itemIndex]) return;
          const value = e.target.value === "" ? null : e.target.value;
          const invalid = !!e.target.validationMessage;
          onSelect({ value, itemIndex, invalid });
        }}
      />
    );

  return (
    <input
      key={item.name}
      ref={ref}
      autoComplete={item?.autocomplete}
      value={value || ""}
      style={{ maxWidth: "300px", textAlign: "center" }}
      onChange={(e) => {
        if (!itemValues?.[itemIndex]) return;
        const value = e.target.value === "" ? null : e.target.value;
        onSelect({ value, itemIndex });
      }}
    />
  );
};

export default Inputs;
