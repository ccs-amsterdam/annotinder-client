import { useRef, useState } from "react";
import { FaCheck, FaStepBackward, FaStepForward } from "react-icons/fa";
import styled from "styled-components";
import useWatchChange from "../../../hooks/useWatchChange";
import { SetState } from "../../../types";

const IndexControllerBar = styled.div`
  position: relative;
  display: flex;
  max-width: 300px;
  border: none;
  box-shadow: none;
  padding: 0px;
  border-radius: 0;
  font-size: 1.4rem;
  background: transparent;

  & > div {
    margin-right: 3px;
    display: flex;
    gap: 0.5rem;
  }
`;

const Slider = styled.input<{ progress: number }>`
  flex: 1 1 0px;
  margin-top: 0px;
  min-width: 1px;
  background: linear-gradient(
    to right,
    ${(props) => `var(--primary) ${props.progress}%,
    var(--primary-light) ${props.progress}% 100%,
    var(--primary-light) 100%`}
  );
`;

const IndexLabel = styled.div`
  display: flex;
  text-align: center;
  white-space: nowrap;
  font-size: 1.6rem;

  font-weight: bold;
  color: var(--primary-text);

  & div {
    min-width: 1.6rem;
    margin: auto;
  }
`;

const Icon = styled.div<{ disabled?: boolean }>`
  font-size: 2.5rem;
  cursor: ${(p) => (p.disabled ? "default" : "pointer")};
  color: ${(p) => (p.disabled ? "grey" : "var(--primary-text)")};

  /* svg:hover {
    fill: ${(p) => (p.disabled ? "grey" : "var(--secondary)")};
  } */
`;

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

  if (useWatchChange([index, n])) {
    if (index < 0) return;
    const page = index === null ? n + 1 : Math.min(index + 1, n + 1);
    setActivePage(page);
    setSliderPage(page);
  }

  const updatePage = (page: number) => {
    if (page !== activePage) {
      setIndex(page - 1);
      setActivePage(page);
      setSliderPage(page);
    }
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

  return (
    <IndexControllerBar>
      <div>
        {canGoBack || canGoForward ? (
          <Icon
            onClick={() => updatePage(Math.max(1, activePage - 1))}
            disabled={!canGoBack || activePage === 1}
          >
            <FaStepBackward />
          </Icon>
        ) : null}
        <IndexLabel>
          {sliderPage > n ? (
            <div>
              <FaCheck />
            </div>
          ) : (
            <div>{sliderPage}</div>
          )}
        </IndexLabel>
        {canGoForward || canGoBack ? (
          <Icon
            onClick={() => {
              if (canGoForward) {
                updatePage(activePage + 1);
              } else {
                updatePage(Math.min(progressN + 1, activePage + 1));
              }
            }}
            disabled={!canGoForward && activePage >= progressN + 1}
          >
            <FaStepForward />
          </Icon>
        ) : null}
      </div>
      <Slider
        progress={progress}
        min={1}
        max={n + 1}
        onChange={updateSliderPage}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => {
          e.stopPropagation();
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
    </IndexControllerBar>
  );
};

export default IndexController;
