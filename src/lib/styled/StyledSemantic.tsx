import { Button, Modal, Pagination, Table } from "semantic-ui-react";
import styled, { StyledComponent } from "styled-components";

// Use styled components to customize semantic ui components.
// Note that !important is still nicely contained, because styled components
// creates unique class names.

// On the longer term, we might want to remove semantic-ui altogether.
// therefore we'll run all semantic ui components via custom styled versions,
// so that we can gradually replace them.

const CustomButton = styled.button`
  padding: 0.3rem 0.7rem;
  margin: 0;
  color: var(--grey);
  background: var(--inactive);
  cursor: pointer;
  border: 1px solid var(--grey);
  border-radius: 5px;

  transition: background 0.2s;

  &.primary {
    background: var(--primary);
    color: white;
  }
  &.secondary {
    background: var(--secondary);
    color: white;
  }
  & > i {
    margin: 0;
  }
  &:hover {
    background: var(--active);
  }
`;

const StyledButton = styled(Button)`
  &.primary {
    background: var(--primary) !important;
    color: white !important;
  }
  &.secondary {
    background: var(--secondary) !important;
    color: white !important;
  }
`;

const StyledModal: StyledComponent<typeof Modal, any, {}, never> = styled(Modal)`
  border: 1px solid var(--background-inversed);
  font-size: 0.9em;

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
