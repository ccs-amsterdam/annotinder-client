import { Button, Modal, Table } from "semantic-ui-react";
import styled, { StyledComponent } from "styled-components";

// Use styled components to customize semantic ui components.
// Note that !important is still nicely contained, because styled components
// creates unique class names.

// On the longer term, we might want to remove semantic-ui altogether.
// therefore we'll run all semantic ui components via custom styled versions,
// so that we can gradually replace them.

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
  color: var(--text) !important;
  background: var(--background) !important;

  & thead,
  tboy {
    color: var(--text) !important;
    background: var(--background) !important;
  }
`;

const StyledSegment = styled.div`
  position: relative;
  padding: 1em;
`;

export { StyledButton, StyledModal, StyledContainer, StyledTable, StyledSegment };
