import { css } from "styled-components";

export default css`
  input[type="range"] {
    border-radius: 2px;
    height: 24px;
    background-color: var(--primary-light) !important;
    margin-top: 0px;
    outline: none;
    cursor: crosshair;
    -webkit-appearance: none;
    -moz-appearance: none;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 10px;
    height: 24px;
    padding: 0;
    background: var(--primary);
    cursor: pointer;
    border: 1px solid var(--background-inversed-fixed);
  }

  input[type="range"]::-moz-range-thumb {
    appearance: none;
    width: 10px;
    height: 24px;
    padding: 0;
    background: var(--primary);
    cursor: pointer;
    border-radius: 0px;
    border: 1px solid var(--text);
  }

  .fullscreen {
    height: 100%;
    width: 100%;
  }

  .dom-node-provider {
    height: 100%;
    width: 100%;
  }

  @media only screen and (max-width: 767px) {
    .ui.grid {
      margin-left: 0rem !important;
      margin-right: 0rem !important;
    }
  }
`;
