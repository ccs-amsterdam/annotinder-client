import { Button, Modal, Pagination, Table } from "semantic-ui-react";
import styled, { StyledComponent } from "styled-components";

// Use styled components to customize semantic ui components.
// Note that !important is still nicely contained, because styled components
// creates unique class names.

// On the longer term, we might want to remove semantic-ui altogether.
// therefore we'll run all semantic ui components via custom styled versions,
// so that we can gradually replace them.

const CustomButton = styled.button<{ size?: number; selected?: boolean }>`
  font-size: ${(p) => p.size || 1.5}rem;
  padding: 0.7em 1em 0.7em 1rem;
  margin: 0;
  color: ${(p) => (p.selected ? "white" : "black")};
  background: var(--inactive);
  cursor: pointer;
  border: 3px solid;
  border-color: ${(p) => (p.selected ? "var(--text)" : "var(--background)")};
  //border: 1px solid var(--grey);
  border-radius: 6px;
  position: relative;

  transition: background-color 0.2s;

  &.primary {
    background: var(--primary);
    color: white;
    &:hover {
      background: var(--primary-dark);
    }
  }
  &.secondary {
    background: var(--secondary);
    color: white;
    &:hover {
      background: var(--secondary-dark);
    }
  }
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

  :hover,
  :active {
    background: var(--active);
  }

  ::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${(p) => (p.selected ? "#555" : "#fff")};
    z-index: -1;
    //border-radius: 5px;
  }
`;

const StyledButton = styled(Button)`
  font-size: inherit !important;

  &.primary {
    background: var(--primary) !important;
    color: white !important;
  }
  &.secondary {
    background: StyledButt var(--secondary) !important;
    color: white !important;
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
  CustomButton,
  StyledButton,
  StyledModal,
  StyledContainer,
  StyledTable,
  StyledSegment,
  StyledPagination,
};
