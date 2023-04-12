import { css } from "styled-components";

export default css`
  .field {
  }

  .paragraph {
    vertical-align: middle;
  }

  span.token {
    /* vertical-align: bottom; */
    color: var(--text-light);
    .pre,
    .text,
    .post {
      position: relative;
      padding: 0.35rem 0rem 0.1rem;

      .relation {
        position: absolute;
        bottom: -0.5em;
        left: 0%;
        width: 100%;
        height: 0.5em;
        background: none;
      }
    }
  }

  span.token.hasRelation {
    .relation {
    }
  }

  .relationMode {
    cursor: not-allowed;
  }
  .relationMode span.token {
    opacity: 0.6;
  }
  .relationMode span.token.can-select {
    opacity: 1;
    cursor: crosshair;
  }

  span.token.codingUnit {
    font-size: 1.2em;
    //background-color: var(--background-transparent);
    //text-shadow: 0px 0px 2px var(--background);
    color: var(--text);
  }

  span.token:focus {
    outline: none;
  }

  span.token:focus > span.text,
  span.token.selected > span.text {
    background-color: var(--text-light) !important;
    color: var(--text-inversed);
  }

  span.token.selected:not(.end) > span.post {
    background-color: var(--text-light) !important;
  }
  span.token.selected:not(.start) > span.pre {
    background-color: var(--text-light) !important;
  }

  span.token.tapped > span {
    transition: text-decoration 0.3s ease;
    text-decoration: underline overline !important;
  }

  button.active {
    border: solid !important;
  }

  .editMode {
    .token {
      cursor: not-allowed;
    }
    .token.annotated {
      cursor: pointer;
    }
  }

  span.token.annotated > span {
    /* line-height: 1.5em; */
    transition: background 0.3s ease;
    border: 1px solid var(--background-inversed-fixed);
    border-left: none;
    border-right: none;
    /* cursor: pointer;; */
    vertical-align: bottom;
    box-shadow: none;
    box-sizing: border-box;
    hyphens: none;

    /* add white background for dark mode. Annotation colors are customizable,
    so we use opacity on a white background to ensure text readability.
    (also possible on black background, but not easy on the eyes)  */
    color: var(--text-fixed);
    position: relative;
    //z-index: 1;
    ::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: white;
      z-index: -1;
      border-radius: inherit;
    }
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
    border-left: 1px solid var(--background-inversed-fixed);
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
    border-right: 1px solid var(--background-inversed-fixed);
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

  .overlayFocus {
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

  .buttonBackground {
    position: relative;
    ::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: white;
      z-index: -1;
      border-radius: inherit;
    }
  }
`;
