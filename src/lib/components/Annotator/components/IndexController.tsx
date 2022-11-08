import { useRef, useState } from "react";
import { Icon } from "semantic-ui-react";
import styled from "styled-components";
import useWatchChange from "../../../hooks/useWatchChange";
import { SetState } from "../../../types";

const IndexControllerBar = styled.div`
  position: relative;
  display: flex;
  border: none;
  box-shadow: none;
  padding: 0;
  left-margin: 0px;
  border-radius: 0;
  font-size: 1rem;
  background: var(--background-inversed-fixed);

  & > div {
    margin-right: 3px;
    display: flex;
  }
`;

const Slider = styled.input<{ progress: number }>`
  flex: 1 1 0px;
  margin-top: 0px;
  min-width: 1px;
  border: 1px solid white;
  background: linear-gradient(
    to right,
    ${(props) => `var(--primary-light) ${props.progress}%,
    var(--primary-verylight) ${props.progress}% 100%,
    var(--primary-verylight) 100%`}
  );
`;

const IndexLabel = styled.div`
  height: 24px;
  padding: 0px 3px 0px 3px;
  margin: 0 2.5px 0px 0px;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr 0.7rem 1fr;
  line-height: 24px;
  text-align: center;
  white-space: nowrap;
  font-size: 0.85rem;
  font-weight: bold;
  border-radius: 2px;
  background: var(--primary);
  color: var(--text-inversed-fixed);
  border: 1px solid white;

  & div {
    minwidth: 1rem;
  }
`;

const StyledIcon = styled(Icon)`
  cursor: pointer !important;
  height: 24px !important;
  line-height: 24px !important;
  font-size: 20px !important;
  color: var(--text-inversed-fixed) !important;
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
          <StyledIcon
            name="step backward"
            onClick={() => updatePage(Math.max(1, activePage - 1))}
            disabled={!canGoBack || activePage === 1}
          />
        ) : null}
        <IndexLabel>
          {sliderPage > n ? (
            <div>done</div>
          ) : (
            <>
              <div>{sliderPage}</div>
              &frasl;
              <div>{n}</div>
            </>
          )}
        </IndexLabel>
        {canGoForward || canGoBack ? (
          <StyledIcon
            name="step forward"
            onClick={() => {
              if (canGoForward) {
                updatePage(activePage + 1);
              } else {
                updatePage(Math.min(progressN + 1, activePage + 1));
              }
            }}
            disabled={!canGoForward && activePage >= progressN + 1}
          />
        ) : null}
      </div>
      <Slider
        progress={progress}
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
    </IndexControllerBar>
  );
};

export default IndexController;
