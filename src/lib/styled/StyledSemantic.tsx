import { Modal, Pagination, Table } from "semantic-ui-react";
import styled, { StyledComponent } from "styled-components";

// Use styled components to customize semantic ui components.
// Note that !important is still nicely contained, because styled components
// creates unique class names.

// On the longer term, we might want to remove semantic-ui altogether.
// therefore we'll run all semantic ui components via custom styled versions,
// so that we can gradually replace them.

const CodeButton = styled.button<{
  color?: string;
  background?: string;
  borderColor?: string;
  size?: number;
  selected?: boolean;
  current?: boolean;
  afterBackground?: string;
  onDark?: boolean;
  compact?: boolean;
}>`
  font-size: ${(p) => p.size || 1.5}rem;
  padding: ${(p) => (p.compact ? "0.5rem" : "0.5rem")};
  min-height: ${(p) => (p.compact ? "" : "5rem")};
  margin: 0;

  cursor: pointer;
  border: 3px solid;
  border-radius: 5px;
  position: relative;
  transition: background-color 0.15s;
  overflow-wrap: break-word;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-decoration: ${(p) => (p.current ? "underline" : "")};
  color: ${(p) => (p.selected || p.current ? "white" : "#222")};
  border-color: ${(p) => {
    if (p.onDark) {
      if (p.selected || p.current) return "var(--background-fixed)";
      return "var(--background-inversed-fixed)";
    }
    if (p.selected || p.current) return "var(--background-inversed-fixed)";
    return "var(--background-fixed)";
  }};
  background: ${(p) => p.background || "var(--primary)"};
  flex: ${(p) => (p.compact ? "0.2 1 auto" : "1 1 auto")};

  & > i {
    margin: 0;
  }

  &.left {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  &.right {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  &.middle {
    border-radius: 0;
  }

  ::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${(p) => (p.selected || p.current ? "#555" : p.afterBackground || "#fff")};
    z-index: -1;
    border: 3px solid ${(p) => (p.selected || p.current ? "#555" : p.afterBackground || "#fff")};
    //border-radius: 3px;
  }

  :disabled {
    color: grey;
    cursor: not-allowed;
  }
`;

const StyledButton = styled.button<{
  size?: number;
  primary?: boolean;
  secondary?: boolean;
  fluid?: boolean;
  selected?: boolean;
}>`
  font-size: ${(p) => p.size || 1.5}rem;
  padding: 0.7em 1em 0.7em 1rem;
  margin: 0;
  cursor: pointer;
  border: none;
  border-radius: 5px;

  position: relative;
  transition: all 0.15s;

  &.left {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  &.right {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  &.middle {
    border-radius: 0;
  }

  svg {
    transform: translateY(${(p) => p.size * (1 / 7.5) || 0.2 + "rem"});
    margin-right: 0.5rem;
  }

  ${(p) => {
    if (p.primary) {
      return `
      background: var(--primary);
      color: white;
      .selected, :hover, :active {
        background: var(--primary-dark);
      }
        `;
    }
    if (p.secondary) {
      return `
      background: var(--secondary);
      color: #222;
      .selected, :hover, :active {
        background: var(--secondary-dark);
        color: white;
      }
        `;
    }
  }}

  :disabled {
    cursor: not-allowed;
  }

  :disabled::after {
    position: absolute;
    content: "";
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background: #8888;
  }

  ${(p) => {
    if (p.fluid)
      return `
      width: 100%;
      flex: 1 1 auto;
    `;
  }}
`;

const Button = StyledButton;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: nowrap;

  & > button {
    border-radius: 0;
  }

  & > button:first-of-type {
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
  }
  & > button:last-of-type {
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }
`;

const StyledModal: StyledComponent<typeof Modal, any, {}, never> = styled(Modal)`
  border: 1px solid var(--background-inversed);
  font-size: var(--font-size) !important;

  & .header,
  .content,
  .actions {
    background: var(--background) !important;
    color: var(--color) !important;
  }
`;

const StyledContainer = styled.div`
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  overflow: auto;
  padding: 1em;
`;

const StyledTable: StyledComponent<typeof Table, any, {}, never> = styled(Table)`
  color: inherit !important;
  background: inherit !important;
  font-size: inherit !important;

  & thead,
  tbody {
    color: inherit !important;
    background: inherit !important;
  }

  & td {
    padding-top: 2px !important;
    padding-bottom: 2px !important;
    border: 0px !important;
  }

  & tr {
    border: 0px !important;
  }
`;

const StyledSegment = styled.div`
  position: relative;
  padding: 1em;
`;

const StyledPagination = styled(Pagination)`
  & .item {
    color: var(--text) !important;
  }
`;

export {
  Button,
  ButtonGroup,
  CodeButton,
  StyledButton,
  StyledModal,
  StyledContainer,
  StyledTable,
  StyledSegment,
  StyledPagination,
};
