import React, { useEffect, useState } from "react";
import { Icon, Label, Segment } from "semantic-ui-react";

const sliderColor = "#d3dfe9";
const progressColor = "#7fb9eb";
const iconStyle = { cursor: "pointer" };
const iconStyleHidden = { color: "white" };

const IndexController = ({ n, nCoded, index, setIndex, canGoForward = true, canGoBack = true }) => {
  const [activePage, setActivePage] = useState(1);
  const [delayedActivePage, setDelayedActivePage] = useState(1);

  useEffect(() => {
    if (index < 0) return;
    if (index !== null) setActivePage(Math.min(index + 1, n + 1));
    if (index === null) setActivePage(n + 1);
  }, [index, n, setActivePage]);

  useEffect(() => {
    if (!n) return null;
    if (activePage - 1 === n) {
      setIndex(null);
    } else {
      setIndex(activePage - 1);
    }
    setDelayedActivePage(activePage);
  }, [n, setIndex, activePage]);

  if (!n) return null;
  let progress = (100 * Math.max(0, nCoded)) / n;
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
        width: "100%",
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
              onClick={() => setActivePage(1)}
              style={iconStyle}
              disabled={!canGoBack || activePage === 1}
            />
            <Icon
              name="step backward"
              onClick={() => setActivePage(Math.max(1, activePage - 1))}
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
          {delayedActivePage <= n ? `${delayedActivePage} / ${n}` : `done`}
        </Label>
        {canGoForward || canGoBack ? (
          <>
            <Icon
              name="step forward"
              onClick={() => {
                if (canGoForward) {
                  setActivePage(activePage + 1);
                } else {
                  setActivePage(Math.min(nCoded + 1, activePage + 1));
                }
              }}
              disabled={!canGoForward && activePage >= nCoded + 1}
              style={iconStyle}
            />
            <Icon
              name="fast forward"
              onClick={() => {
                if (canGoForward) {
                  setActivePage(Math.max(nCoded + 1, activePage + 1));
                } else {
                  setActivePage(nCoded + 1);
                }
              }}
              disabled={!canGoForward && activePage >= nCoded + 1}
              style={canGoForward ? iconStyleHidden : iconStyle}
            />
          </>
        ) : null}
      </div>
      <input
        style={{
          flex: "1 1 auto",
          marginTop: "3px",
          //maxWidth: "500px",
          background: `linear-gradient(to right, ${progressColor} ${progress}%, ${sliderColor} ${progress}% 100%, ${sliderColor} 100%)`,
        }}
        min={1}
        max={n + 1}
        onChange={(e) => {
          // Changing the range slider directly only updates delayedActivePage, which shows the value on the slider.
          // Below, the onMouseUp event then process the change
          if (Number(e.target.value) > delayedActivePage) {
            if (canGoForward) {
              setDelayedActivePage(Number(e.target.value));
            } else {
              setDelayedActivePage(Math.min(nCoded + 1, Number(e.target.value)));
            }
          }
          if (canGoBack && Number(e.target.value) < delayedActivePage)
            setDelayedActivePage(Number(e.target.value));
        }}
        onMouseUp={(e) => {
          setActivePage(delayedActivePage);
        }}
        onTouchEnd={(e) => {
          setActivePage(delayedActivePage);
        }}
        type="range"
        value={delayedActivePage}
      />
    </Segment>
  );
};

export default IndexController;
