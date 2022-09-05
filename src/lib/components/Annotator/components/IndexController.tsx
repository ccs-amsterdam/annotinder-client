import React, { useEffect, useRef, useState } from "react";
import { Icon, Label, Segment } from "semantic-ui-react";
import { SetState } from "../../../types";

const sliderColor = "#d3dfe9";
const progressColor = "#7fb9eb";
const iconStyle = { cursor: "pointer" };
const iconStyleHidden = { color: "white" };

interface IndexControllerProps {
  n: number;
  progressN: number;
  index: number;
  setIndex: SetState<number>;
  canGoForward: boolean;
  canGoBack: boolean;
}

const IndexController = ({
  n,
  progressN,
  index,
  setIndex,
  canGoForward = true,
  canGoBack = true,
}: IndexControllerProps) => {
  const [activePage, setActivePage] = useState(0);
  const [sliderPage, setSliderPage] = useState(0);

  // also keep track of slider as a ref, because touchevents suck (see onTouchEnd below for explanation)
  const slider = useRef(0);

  useEffect(() => {
    // if index changes on the outside, update the active page shown in the controller
    if (index < 0) return;
    const page = index === null ? n + 1 : Math.min(index + 1, n + 1);
    setActivePage(page);
    setSliderPage(page);
  }, [index, n, setActivePage]);

  const updatePage = (page: number) => {
    setIndex(page - 1);
    setActivePage(page);
    setSliderPage(page);
  };

  const updateSliderPage = (e: any) => {
    // Changing the range slider directly only updates sliderPage, which shows the value on the slider.
    // the onMouseUp event then process the change
    let newpage: number = null;
    if (Number(e.target.value) > sliderPage) {
      if (canGoForward) {
        newpage = Number(e.target.value);
      } else {
        newpage = Math.min(progressN + 1, Number(e.target.value));
      }
    }
    if (canGoBack && Number(e.target.value) < sliderPage) newpage = Number(e.target.value);

    if (newpage !== null) {
      setSliderPage(newpage);
      slider.current = newpage;
    }
  };

  if (!n) return null;
  let progress = (100 * Math.max(0, progressN)) / n;
  if (canGoForward) progress = 0; // linear progress is useless in this case.

  const digits = Math.floor(Math.log10(n)) + 1;
  const labelwidth = `${3 + digits * 2}em`;

  return (
    <Segment
      style={{
        display: "flex",
        border: "none",
        boxShadow: "none",
        padding: "0",
        leftMargin: "0px",
        height: "35px",
        borderRadius: "0",
        fontSize: "1em",
      }}
    >
      <div style={{ marginRight: "3px" }}>
        {canGoBack || canGoForward ? (
          <>
            <Icon
              name="fast backward"
              onClick={() => updatePage(1)}
              style={iconStyle}
              disabled={!canGoBack || activePage === 1}
            />
            <Icon
              name="step backward"
              onClick={() => updatePage(Math.max(1, activePage - 1))}
              disabled={!canGoBack || activePage === 1}
              style={iconStyle}
            />
          </>
        ) : null}
        <Label
          color="blue"
          style={{
            height: "24px",
            padding: "6px 0 2px 0",
            margin: "0 5px 0px 5px",
            width: labelwidth,
            textAlign: "center",
            fontWeight: "bold",
            borderRadius: "2px",
          }}
        >
          {sliderPage <= n ? `${sliderPage || ""} / ${n}` : `done`}
        </Label>
        {canGoForward || canGoBack ? (
          <>
            <Icon
              name="step forward"
              onClick={() => {
                if (canGoForward) {
                  updatePage(activePage + 1);
                } else {
                  updatePage(Math.min(progressN + 1, activePage + 1));
                }
              }}
              disabled={!canGoForward && activePage >= progressN + 1}
              style={iconStyle}
            />
            <Icon
              name="fast forward"
              onClick={() => {
                if (canGoForward) {
                  updatePage(Math.max(progressN + 1, activePage + 1));
                } else {
                  updatePage(progressN + 1);
                }
              }}
              disabled={!canGoForward && activePage >= progressN + 1}
              style={canGoForward ? iconStyleHidden : iconStyle}
            />
          </>
        ) : null}
      </div>
      <input
        style={{
          flex: "1 1 0px",
          marginTop: "0px",
          minWidth: "1px",
          //maxWidth: "500px",
          background: `linear-gradient(to right, ${progressColor} ${progress}%, ${sliderColor} ${progress}% 100%, ${sliderColor} 100%)`,
        }}
        min={1}
        max={n + 1}
        onChange={updateSliderPage}
        onMouseUp={(e) => {
          updatePage(slider.current);
        }}
        onTouchEnd={(e) => {
          // For touch events onChange runs after onTouchEnd, so we use setTimeout
          // to put it on the callback Queue. We also need a ref for sliderPage otherwise
          // it sets the previous state
          setTimeout(() => updatePage(slider.current), 0);
        }}
        type="range"
        value={sliderPage}
      />
    </Segment>
  );
};

export default IndexController;