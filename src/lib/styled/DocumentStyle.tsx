import { css } from "styled-components";

export default css`
  /* Override color of the default text in semantic dropdown */
  .ui.default.dropdown:not(.button) > .text,
  .ui.dropdown:not(.button) > .default.text {
    color: rgba(0, 0, 0, 0.87) !important;
  }

  .sentence {
    line-height: 1.8em;
    vertical-align: middle;
  }

  span.token {
    /* vertical-align: bottom; */
    padding-bottom: 0px;
    color: var(--text-light);
  }

  span.token.codingUnit {
    font-size: 1.2em;
    background-color: transparent;
    color: var(--text);
  }

  span.token.selected > span {
    background-color: var(--text-light) !important;
    color: var(--text-inversed);
    border-color: var(--text);
  }
  span.token.selected.start > span.pre {
    background-color: var(--primary-light) !important;
  }
  span.token.selected.end > span.post {
    background-color: var(--primary-light) !important;
  }

  span.token.tapped > span {
    transition: text-decoration 0.3s ease;
    text-decoration: underline overline !important;
  }

  button.active {
    border: solid !important;
  }

  span.token.annotated > span {
    /* line-height: 1.5em; */
    padding: 2px 0px;
    transition: all 0.5s ease;
    border: 1px solid;
    border-left: none;
    border-right: none;
    /* cursor: pointer;; */
    vertical-align: bottom;
    box-shadow: none;
    box-sizing: border-box;
  }

  span.token.annotated.anyLeft > span.text {
    border-left: solid;
    border-left-width: 0px;
    border-bottom-left-radius: 0px;
  }

  span.token.annotated.allLeft > span.pre {
    border: none;
    background: none;
  }
  span.token.annotated.allLeft > span.text {
    padding-left: 3px;
    border-left: solid;
    border-left-width: 1px;
    border-bottom-left-radius: 5px;
    border-top-left-radius: 5px;
  }

  span.token.annotated.anyRight > span.text {
    border-right: 0px solid;
  }
  span.token.annotated.allRight > span.post {
    border: none;
    background: none;
  }
  span.token.annotated.allRight > span.text {
    padding-right: 3px;
    border-right: solid;
    border-right-width: 1px;
    border-bottom-right-radius: 5px;
    border-top-right-radius: 5px;
  }

  .noselect {
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Old versions of Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none; /* Non-prefixed version, currently
                                    supported by Chrome, Edge, Opera and Firefox */
  }

  .focus {
    transition: background-color 500ms;
    position: relative;
    background-color: var(--background) !important;
    border: 1px double var(--border);
    border-radius: 20px;
    box-shadow: 0px 1px 3px black;
    z-index: 20;
  }

  .menu > .selected {
    background: var(--primary) !important;
    color: var(--text-inversed) !important;
  }
`;
