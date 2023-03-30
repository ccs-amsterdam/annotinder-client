import styled from "styled-components";

export const GridListDiv = styled.div<{ transition?: "up" | "down" }>`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  margin: auto;
  padding: 2rem;
  max-width: 900px;
  max-height: 600px;

  @keyframes changePageDown {
    49% {
      opacity: 0;
      transform: translateY(-50%);
    }
    51% {
      opacity: 0;
      transform: translateY(50%);
    }
    100% {
      opacity: 1;
      transform: translateY(0%);
    }
  }

  @keyframes changePageUp {
    49% {
      opacity: 0;
      transform: translateY(50%);
    }
    51% {
      opacity: 0;
      transform: translateY(-50%);
    }
    100% {
      opacity: 1;
      transform: translateY(0%);
    }
  }

  .QueryFields {
    display: flex;
    flex-wrap: wrap;
    //flex-direction: column;
    gap: 0.5rem;
  }

  .GridItems {
    display: grid;
    grid-gap: 1.5rem;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));

    .GridItem {
      padding: 1rem;
      border: 3px solid var(--primary-dark);
      border-radius: 5px;
      display: flex;
      flex-wrap: wrap;

      div {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &.Labels {
        background: var(--primary);
        color: white;
      }
      &.Values {
        animation: ${(p) =>
            p.transition ? (p.transition === "up" ? "changePageUp" : "changePageDown") : "none"}
          0.3s;
        transition: all 0.4s;
        color: var(--primary-text);
        background: var(--background-transparent);
        backdrop-filter: blur(5px);
        //box-shadow: 3px 3px 3px var(--primary);
        //margin: 0.2rem;
        cursor: pointer;
        &:hover {
          background: var(--secondary);
          color: var(--primary-dark);
        }

        &.Disabled {
          pointer-events: none;
          opacity: 0;
        }
      }
      &.PageChange {
        transition: all 0.4s;
        cursor: pointer;
        padding: 0;

        &.Disabled {
          pointer-events: none;
          opacity: 0;
        }
      }
    }
  }
`;

export const QueryDiv = styled.div<{ open?: boolean }>`
  min-height: 3rem;
  gap: 1rem;
  display: flex;
  flex-wrap: wrap;
  position: relative;
  pointer-events: none;

  --dropdown-display: none;
  --borderradius: 5px;
  --border: 1px solid var(--primary);
  --z-index: 900; // Makes sure z-index of button is lower than dropdown of another button
  --height: 3.5rem;
  --marginbottom: 0.5rem;
  ${(p) =>
    p.open &&
    `
    --dropdown-display: block;
    --borderradius: 0px;
    --border: none;
    --z-index: 1000;
    --height: 4rem;
    --marginbottom: 0;
    `}
  button {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    align-items: center;
    width: 3.5rem;
    margin-bottom: var(--marginbottom);
    height: var(--height);
    pointer-events: all;
    border: 1px solid var(--primary);
    background: var(--background);
    border-radius: 5px;
    border-bottom-right-radius: var(--borderradius);
    border-bottom-left-radius: var(--borderradius);
    border-bottom: var(--border);
    color: var(--primary-text);
    font-size: 1.5rem;
    z-index: var(--z-index);
    cursor: pointer;

    :disabled {
      pointer-events: none;
      opacity: 0.5;
    }
  }
  .Dropdown {
    min-width: 20rem;
    pointer-events: all;
    display: var(--dropdown-display);
    width: auto;
    max-width: 50vw;
    position: absolute;
    top: calc(100% - 1px);
    left: 0;
    z-index: 999;
    border: 1px solid var(--primary);
    border-radius: 5px;
    border-top-left-radius: var(--borderradius);
    background: var(--background);
    color: var(--primary-text);

    & > div {
      padding: 1rem;
    }
  }

  .QueryField {
    pointer-events: all;
    display: flex;
    gap: 0.5rem;
    align-items: center;
    svg {
      border-radius: 5px;
      font-size: 3rem;
      padding: 0.5rem;
      cursor: pointer;
    }
  }

  .QuerySelection .QueryField {
    gap: 0;
    //pointer-events: none;
    margin-right: 0.5rem;
    //border-bottom: 1px solid var(--primary);
  }
`;
