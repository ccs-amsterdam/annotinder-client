import { useState } from "react";
import { FaKeyboard } from "react-icons/fa";

import {
  StyledTable,
  StyledButton,
  StyledContainer,
  StyledModal,
} from "../../../styled/StyledSemantic";
import { FullScreenNode } from "../../../types";

interface AnnotateTaskManualProps {
  fullScreenNode: FullScreenNode;
}

const AnnotateTaskManual = ({ fullScreenNode }: AnnotateTaskManualProps) => {
  const [open, setOpen] = useState(false);

  return (
    <StyledModal
      mountNode={fullScreenNode || undefined}
      open={open}
      onClose={() => setOpen(false)}
      position="bottom left"
      trigger={
        <div onClick={() => setOpen(!open)}>
          <FaKeyboard />
        </div>
      }
    >
      <StyledModal.Header>Controls</StyledModal.Header>
      <StyledModal.Content scrolling>
        <StyledContainer>
          <StyledTable celled structured unstackable>
            <StyledTable.Header>
              <StyledTable.Row>
                <StyledTable.HeaderCell width={5}></StyledTable.HeaderCell>
                <StyledTable.HeaderCell>Keyboard</StyledTable.HeaderCell>
                <StyledTable.HeaderCell>Mouse</StyledTable.HeaderCell>
                <StyledTable.HeaderCell>Touchpad</StyledTable.HeaderCell>
              </StyledTable.Row>
            </StyledTable.Header>
            <StyledTable.Body>
              <StyledTable.Row>
                <StyledTable.Cell>
                  <strong>Navigate</strong>
                </StyledTable.Cell>
                <StyledTable.Cell>
                  <i>Arrow keys</i>
                </StyledTable.Cell>
                <StyledTable.Cell></StyledTable.Cell>
                <StyledTable.Cell></StyledTable.Cell>
              </StyledTable.Row>
              <StyledTable.Row>
                <StyledTable.Cell>
                  <strong>Select words</strong>
                </StyledTable.Cell>
                <StyledTable.Cell>
                  <i>spacebar.</i> Hold to select mutiple
                </StyledTable.Cell>
                <StyledTable.Cell>
                  <i>Left-click.</i> Hold to select multiple
                </StyledTable.Cell>
                <StyledTable.Cell>
                  <i>tap</i> the start word, then tap the end word
                </StyledTable.Cell>
              </StyledTable.Row>

              <StyledTable.Row>
                <StyledTable.Cell>
                  <strong>
                    Select variable
                    <br />
                    (if multiple)
                  </strong>
                </StyledTable.Cell>
                <StyledTable.Cell>
                  Next with <i>tab</i>, previous with <i>shift+tab</i>
                </StyledTable.Cell>
                <StyledTable.Cell colSpan="2">Use the buttons</StyledTable.Cell>
              </StyledTable.Row>
              <StyledTable.Row>
                <StyledTable.Cell>
                  <strong>Edit/remove code</strong>
                </StyledTable.Cell>
                <StyledTable.Cell colSpan="3">
                  Select annotated words to overwrite or delete the code
                </StyledTable.Cell>
              </StyledTable.Row>
              <StyledTable.Row>
                <StyledTable.Cell>
                  <strong>Finish unit</strong>
                </StyledTable.Cell>
                <StyledTable.Cell>
                  <i>ctrl+Enter</i> or <i>alt+Enter</i>
                </StyledTable.Cell>
                <StyledTable.Cell colSpan="2">Use the next unit button</StyledTable.Cell>
              </StyledTable.Row>
              <br />

              <StyledTable.Row>
                <StyledTable.Cell>
                  <strong>Edit mode</strong>
                </StyledTable.Cell>
                <StyledTable.Cell colSpan="3">
                  A job, or a specific variable in a job, can also be in <b>edit mode</b>
                </StyledTable.Cell>
              </StyledTable.Row>
              <StyledTable.Row>
                <StyledTable.Cell>
                  <strong>Edit mode: navigation</strong>
                </StyledTable.Cell>
                <StyledTable.Cell>
                  <i>Arrow keys</i> select last/next annotation
                </StyledTable.Cell>
                <StyledTable.Cell colSpan="2">
                  Can only select existing annotations
                </StyledTable.Cell>
              </StyledTable.Row>
              <StyledTable.Row>
                <StyledTable.Cell>
                  <strong>Edit mode: update/delete</strong>
                </StyledTable.Cell>
                <StyledTable.Cell colSpan="3">
                  Select a single token to get entire annotation, and update or delete this
                  annotation
                </StyledTable.Cell>
              </StyledTable.Row>
              {/* <StyledTable.Row>
              <StyledTable.Cell>
                <strong>
                  Browse units
                  <br />
                  (if allowed)
                </strong>
              </StyledTable.Cell>
              <StyledTable.Cell>
                Press or hold <i>ctrl+Enter</i> (forward) or <i>ctrl+backspace</i> (backward)
              </StyledTable.Cell>
              <StyledTable.Cell>back and next buttons (top-left)</StyledTable.Cell>
              <StyledTable.Cell>back and next buttons (top-left)</StyledTable.Cell>
            </StyledTable.Row> */}
            </StyledTable.Body>
            <StyledTable.Footer>
              <StyledTable.Row>
                <StyledTable.HeaderCell>
                  <strong>Quick keys</strong> <br />
                  in popup
                </StyledTable.HeaderCell>
                <StyledTable.HeaderCell colSpan="3">
                  <ul>
                    <li>
                      navigate buttons with <i>arrow keys</i>, select with <i>spacebar</i>
                    </li>
                    <li>
                      <i>text input</i> automatically opens dropdown{" "}
                    </li>
                    <li>
                      use <i>escape</i> to close popup
                    </li>
                    <li>
                      hold <i>ctrl</i> or <i>alt</i> to select multiple codes without closing the
                      popup
                    </li>
                  </ul>
                </StyledTable.HeaderCell>
              </StyledTable.Row>
            </StyledTable.Footer>
          </StyledTable>
        </StyledContainer>
      </StyledModal.Content>
      <StyledModal.Actions>
        <StyledButton onClick={() => setOpen(false)}>Close</StyledButton>
      </StyledModal.Actions>
    </StyledModal>
  );
};

export default AnnotateTaskManual;
