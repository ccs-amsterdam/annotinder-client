import React, { useState } from "react";
import { Button, Container, Modal, Table, List, ListItem } from "semantic-ui-react";

const AnnotateTaskManual = ({ fullScreenNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <Modal
      mountNode={fullScreenNode || undefined}
      flowing
      open={open}
      onClose={() => setOpen(false)}
      position="bottom left"
      trigger={
        <Button
          secondary
          icon="question"
          size="tiny"
          onClick={() => setOpen(!open)}
          style={{ maxWidth: "50px" }}
        />
      }
    >
      <Modal.Header>Controls</Modal.Header>
      <Modal.Content>
        <Container
          style={{
            overflow: "auto",
            paddingTop: "2em",
            width: "100%",
            maxWidth: "700px",
          }}
        >
          <Table structured compact basic="very" unstackable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={3}></Table.HeaderCell>
                <Table.HeaderCell>Keyboard</Table.HeaderCell>
                <Table.HeaderCell>Mouse</Table.HeaderCell>
                <Table.HeaderCell>Touchpad</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell>
                  <strong>Navigate</strong>
                </Table.Cell>
                <Table.Cell>
                  <i>Arrow keys</i>
                </Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell></Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <strong>Select words</strong>
                </Table.Cell>
                <Table.Cell>
                  <i>spacebar</i>
                  <br />
                  Hold to select mutiple
                </Table.Cell>
                <Table.Cell>
                  <i>Left-click</i>
                  <br />
                  Hold to select multiple
                </Table.Cell>
                <Table.Cell>
                  <i>tab</i> twice to begin, then once to close
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <strong>Edit/remove code</strong>
                </Table.Cell>
                <Table.Cell colSpan="3">
                  Select annotated words to overwrite or delete the code
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <strong>
                    Select variable
                    <br />
                    (if multiple)
                  </strong>
                </Table.Cell>
                <Table.Cell>
                  Next with <i>tab</i>, previous with <i>shift+tab</i>
                </Table.Cell>
                <Table.Cell colSpan="2">Use the buttons</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <strong>Finish unit</strong>
                </Table.Cell>
                <Table.Cell>
                  <i>ctrl+Enter</i> or <i>alt+Enter</i>
                </Table.Cell>
                <Table.Cell colSpan="2">Use the next unit button</Table.Cell>
              </Table.Row>
              {/* <Table.Row>
              <Table.Cell>
                <strong>
                  Browse units
                  <br />
                  (if allowed)
                </strong>
              </Table.Cell>
              <Table.Cell>
                Press or hold <i>ctrl+Enter</i> (forward) or <i>ctrl+backspace</i> (backward)
              </Table.Cell>
              <Table.Cell>back and next buttons (top-left)</Table.Cell>
              <Table.Cell>back and next buttons (top-left)</Table.Cell>
            </Table.Row> */}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell>
                  <strong>Quick keys</strong> <br />
                  in popup
                </Table.HeaderCell>
                <Table.HeaderCell colSpan="3">
                  <List as="ul">
                    <ListItem as="li">
                      <i>text input</i> automatically opens dropdown{" "}
                    </ListItem>
                    <ListItem as="li">
                      navigate buttons with <i>arrow keys</i>, select with <i>spacebar</i>
                    </ListItem>
                    <ListItem as="li">
                      use <i>escape</i> to close popup and <i>delete</i> to remove code
                    </ListItem>
                  </List>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table>
        </Container>
      </Modal.Content>
      <Modal.Actions>
        <Button content="Close" onClick={() => setOpen(false)} positive />
      </Modal.Actions>
    </Modal>
  );
};

export default AnnotateTaskManual;