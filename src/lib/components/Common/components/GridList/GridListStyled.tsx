import styled from "styled-components";

export const GridListDiv = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  gap: 0.5rem;
  width: 100%;
  margin: auto;
  padding: 2rem;
  max-width: 900px;
  max-height: 600px;

  opacity: 1;
  transition: opacity 0.5s;

  &.Empty {
    opacity: 0;
  }

  @keyframes UpOut {
    0% {
      opacity: 1;
      transform: translateY(0%);
    }
    100% {
      opacity: 0;
      transform: translateY(50%);
    }
  }
  @keyframes UpIn {
    0% {
      opacity: 0;
      transform: translateY(-50%);
    }
    100% {
      opacity: 1;
      transform: translateY(0%);
    }
  }
  @keyframes DownOut {
    0% {
      opacity: 1;
      transform: translateY(0%);
    }
    100% {
      opacity: 0;
      transform: translateY(-50%);
    }
  }
  @keyframes DownIn {
    0% {
      opacity: 0;
      transform: translateY(50%);
    }
    100% {
      opacity: 1;
      transform: translateY(0%);
    }
  }

  &.upIn .Values {
    animation: UpIn 0.2s;
  }
  &.downIn .Values {
    animation: DownIn 0.2s;
  }
  &.upOut .Values {
    animation: UpOut 0.2s forwards;
  }
  &.downOut .Values {
    animation: DownOut 0.2s forwards;
  }

  .QueryFields {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    //flex-direction: column;
    gap: 0.5rem;

    .Results {
      font-size: 1.5rem;
      margin-right: 0.2rem;
      margin-left: auto;
    }
  }

  .GridItems {
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));

    .GridItem {
      text-align: left;
      padding: 1rem;
      border: 2px solid var(--primary-text);
      border-radius: 5px;
      box-shadow: 2px 2px 1px var(--primary);
      display: flex;
      flex-wrap: wrap;

      svg {
        font-size: 2rem;
      }

      &.Labels {
        background: var(--primary);
        color: white;
      }
      &.Values {
        transition: all 0.2s;
        color: var(--primary-text);
        background: var(--background-transparent);
        backdrop-filter: blur(5px);
        //box-shadow: 3px 3px 3px var(--primary);
        //margin: 0.2rem;
        cursor: pointer;
        &:hover,
        &.Selected {
          background: var(--secondary);
          color: var(--primary-dark);
        }
        &.Selected {
          transform: scale(1.05);
        }

        &.Disabled {
          pointer-events: none;
          opacity: 0.3;
        }
      }
      &.PageChange {
        transition: all 0.4s;
        cursor: pointer;
        padding: 0;

        &.Disabled {
          pointer-events: none;
          opacity: 0.3;
        }
      }
    }

    &.SinglePage .Disabled {
      opacity: 0 !important;
    }
  }

  .DetailContainer {
    pointer-events: none;
    transition: all 0.2s;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    padding: 2rem 4rem;
    z-index: 9000;

    .Detail {
      padding: 1rem;
      transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
      transition-delay: 0.1s;
      opacity: 0;
      //max-width: 100%;
      width: auto;
      margin: auto;
      transform: scale(1%);
      border: 2px solid var(--primary-text);
      background: var(--background-transparent);
      border-radius: 5px;
    }

    &.Open {
      pointer-events: all;
      background: var(--background-transparent);
      backdrop-filter: blur(3px);

      .Detail {
        transform: none;
        opacity: 1;
      }
    }
  }
`;

export const QueryDiv = styled.div<{ open?: boolean; active?: boolean }>`
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
    border-radius: 5px;
    border-bottom-right-radius: var(--borderradius);
    border-bottom-left-radius: var(--borderradius);
    border-bottom: var(--border);
    font-size: 1.5rem;
    z-index: var(--z-index);
    cursor: pointer;

    background: ${(p) => (p.active ? "var(--secondary)" : "var(--background)")};
    color: ${(p) => (p.active ? "var(--primary-dark)" : "var(--primary-text)")};

    :disabled {
      pointer-events: none;
      opacity: 0.5;
    }
  }
  .Dropdown {
    //min-width: 30rem;
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

    background: ${(p) => (p.active ? "var(--secondary)" : "var(--background)")};
    color: ${(p) => (p.active ? "var(--primary-dark)" : "var(--primary-text)")};

    & > div {
      padding: 1rem;
    }

    .Divider {
      height: 0;
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid var(--primary);
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

      &.NotSelected {
        opacity: 0.5;
      }
    }
    .CloseIcon {
      margin-left: auto;

      &.Disabled {
        pointer-events: none;
        opacity: 0.5;
      }
    }
    span {
      padding-top: 0.3rem;
      white-space: nowrap;
    }
  }

  .QuerySelection {
    display: flex;
    gap: 0.5rem;
    .QueryField {
      gap: 0;

      //pointer-events: none;
      //border-bottom: 1px solid var(--primary);
    }
  }

  .FilterField {
    padding: 0.5rem 1rem 0.5rem 1rem;
    display: flex;
    flex-direction: column;

    .SearchField {
      line-height: 2rem;
      border: 1px solid var(--primary);
      border-radius: 5px;
      padding: 0.5rem 1rem;
      font-size: 1.5rem;
    }

    .SelectField {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;

      &.Disabled {
        opacity: 0.5;
      }

      .SelectOption {
        display: flex;
        border: 1px solid var(--primary);
        border-radius: 5px;
        background: #fff;
        color: var(--primary-dark);
        padding: 0.3rem;
        cursor: pointer;

        &.Selected {
          background: var(--primary);
          color: white;
        }
      }
    }
  }
`;
