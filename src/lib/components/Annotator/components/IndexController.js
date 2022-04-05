import React, { useEffect, useState, useRef } from "react";
import { Icon, Label, Loader, Segment } from "semantic-ui-react";

const sliderColor = "#d3dfe9";
const progressColor = "#7fb9eb";
const iconStyle = { cursor: "pointer" };

const IndexController = ({ n, index, setIndex, canGoForward = true, canGoBack = true }) => {
  const reached = useRef(0); // if canGoBack but not canGoForward, can still go forward after going back
  const canMove = useRef(false);

  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [delayedActivePage, setDelayedActivePage] = useState(1);

  useEffect(() => {
    if (index < 0) return;
    if (index !== null) setActivePage(Math.min(index + 1, n + 1));
    if (index === null) setActivePage(n + 1);
  }, [index, n, setActivePage]);

  useEffect(() => {
    reached.current = 0;
    canMove.current = false;
  }, [n]);

  useEffect(() => {
    if (!n) return null;
    setActivePage(1);
    canMove.current = true;
  }, [n, setActivePage]);

  useEffect(() => {
    if (!n) return null;
    reached.current = Math.max(activePage, reached.current);
    if (activePage - 1 === n) {
      setIndex(null);
    } else {
      setIndex(activePage - 1);
    }
    setDelayedActivePage(activePage);
  }, [n, setIndex, activePage]);

  useEffect(() => {
    if (!n) return null;
    if (activePage === delayedActivePage) {
      setLoading(false);
      return null;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      setActivePage(delayedActivePage);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [activePage, delayedActivePage, n, setLoading]);

  if (!n) return null;
  const progress = (100 * Math.max(0, reached.current - 1)) / n;
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
        maxHeight: "35px",
        borderRadius: "0",
        fontSize: "1em",
      }}
    >
      <div style={{ marginRight: "3px" }}>
        <Loader active={loading} size="small" content="" />
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
        <Label
          color="blue"
          style={{
            height: "19px",
            padding: "3px 0 3px 0",
            margin: "0 5px 0px 5px",
            width: labelwidth,
            textAlign: "center",
            fontWeight: "bold",
            borderRadius: "2px",
          }}
        >
          {delayedActivePage <= n ? `${delayedActivePage} / ${n}` : `done`}
        </Label>
        <Icon
          name="step forward"
          onClick={() => setActivePage(Math.min(reached.current, activePage + 1))}
          disabled={!canGoForward && activePage >= reached.current}
          style={iconStyle}
        />
        <Icon
          name="fast forward"
          onClick={() => setActivePage(reached.current)}
          disabled={!canGoForward && activePage >= reached.current}
          style={iconStyle}
        />
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
          if (Number(e.target.value) > delayedActivePage) {
            if (canGoForward) {
              setDelayedActivePage(Number(e.target.value));
            } else {
              setDelayedActivePage(Math.min(reached.current, Number(e.target.value)));
            }
          }
          if (canGoBack && Number(e.target.value) < delayedActivePage)
            setDelayedActivePage(Number(e.target.value));
        }}
        type="range"
        value={delayedActivePage}
      />
    </Segment>
  );
};

export default IndexController;
