import React, { useState, useEffect, useRef } from "react";
import { Grid, Button, Popup, Form, Input, Icon } from "semantic-ui-react";
import AnnotateTable from "./AnnotateTable";
import Document from "../../Document/Document";
import useLocalStorage from "lib/hooks/useLocalStorage";
import AnnotateTaskManual from "./AnnotateTaskManual";

const AnnotateTask = ({ unit, codebook, setUnitIndex, blockEvents, fullScreenNode, nextDelay }) => {
  const [annotations, setAnnotations] = useAnnotations(unit);
  const [variableMap, setVariableMap] = useState(null);
  const [settings, setSettings] = useLocalStorage("annotateTaskSettings", { textSize: 1 });
  const [tokens, setTokens] = useState(null);

  if (!unit || codebook?.variables === null) return null;

  return (
    <Grid
      centered
      stackable
      style={{ height: "100%", width: "100%", paddingTop: "0" }}
      verticalAlign={"top"}
      columns={2}
    >
      <Grid.Column width={10} style={{ paddingRight: "0em", paddingTop: "0", height: "100%" }}>
        <Button.Group fluid style={{ padding: "0", height: "40px" }}>
          <SettingsPopup
            settings={settings}
            setSettings={setSettings}
            fullScreenNode={fullScreenNode}
          />
          <AnnotateTaskManual fullScreenNode={fullScreenNode} />
          <NextUnitButton
            unit={unit}
            annotations={annotations}
            setUnitIndex={setUnitIndex}
            nextDelay={nextDelay}
          />
        </Button.Group>
        <div style={{ height: "calc(100% - 20px", fontSize: `${settings.textSize}em` }}>
          <Document
            unit={unit}
            settings={codebook?.settings}
            variables={codebook?.variables}
            onChangeAnnotations={setAnnotations}
            returnTokens={setTokens}
            returnVariableMap={setVariableMap}
            blockEvents={blockEvents}
            fullScreenNode={fullScreenNode}
          />
        </div>
      </Grid.Column>
      <Grid.Column
        width={6}
        style={{
          paddingRight: "0em",
          padding: "0",
          height: "100%",
          paddingLeft: "10px",
        }}
      >
        <div style={{ borderBottom: "1px solid", height: "calc(100%)", overflow: "auto" }}>
          <AnnotateTable tokens={tokens} variableMap={variableMap} annotations={annotations} />
        </div>
      </Grid.Column>
    </Grid>
  );
};

const useAnnotations = (unit) => {
  // simple hook for onChangeAnnotations that posts to server and returns state
  const [annotations, setAnnotations] = useState([]);
  const safeWrite = useRef(null);
  //const hasChanged = useRef(false);

  useEffect(() => {
    if (!unit) {
      setAnnotations([]);
      return;
    }
    safeWrite.current = unit.unitId;
    //hasChanged.current = false;
    setAnnotations(unit.annotations || []);
    // if (!unit.annotations || unit.annotations.length === 0)
    //   unit.jobServer.postAnnotations(unit.unitId, [], "IN_PROGRESS");
  }, [unit, setAnnotations]);

  const onChangeAnnotations = React.useCallback(
    (newAnnotations) => {
      if (unit.unitId !== safeWrite.current) return;
      setAnnotations(newAnnotations);
      const cleanAnnotations = getCleanAnnotations(newAnnotations);
      if (!annotationsHaveChanged(unit.annotations, cleanAnnotations)) return;
      const newStatus = unit?.status === "DONE" ? "DONE" : "IN_PROGRESS";
      unit.jobServer.postAnnotations(unit.unitId, cleanAnnotations, newStatus);
    },
    [unit]
  );

  return [annotations, onChangeAnnotations];
};

const annotationsHaveChanged = (old, current) => {
  if (old.length !== current.length) return true;
  const compareOn = ["variable", "value", "field", "offset", "length"];
  for (let i = 0; i < old.length; i++) {
    for (let field of compareOn) {
      if (old[i]?.[field] !== current[i]?.[field]) return true;
    }
  }
  return false;
};

const getCleanAnnotations = (annotations) => {
  return annotations.map((na) => {
    return {
      variable: na.variable,
      value: na.value,
      field: na.field,
      offset: na.offset,
      length: na.length,
      text: na.text,
    };
  });
};

const NextUnitButton = ({ unit, annotations, setUnitIndex, nextDelay }) => {
  const [tempDisable, setTempDisable] = useState("ready");

  const onNext = () => {
    if (tempDisable !== "ready") return;

    // write DONE status
    setTempDisable("loading");
    unit.jobServer
      .postAnnotations(unit.unitId, getCleanAnnotations(annotations), "DONE")
      .then((res) => {
        // wait until post succeeds before moving to next unit, because backend
        // needs to know this unit is done.
        setUnitIndex((state) => state + 1);
        setTempDisable("cooldown");
        setTimeout(() => {
          setTempDisable("ready");
        }, nextDelay || 1000);
      })
      .catch((e) => {
        console.error(e);
        setTempDisable("ready");
      });
  };

  const onKeyDown = (e) => {
    if ((e.ctrlKey || e.altKey) && e.keyCode === 13) {
      e.preventDefault();
      onNext();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  });

  return (
    <Button
      disabled={tempDisable !== "ready"}
      loading={tempDisable === "loading"}
      primary
      size="tiny"
      onClick={onNext}
    >
      <Icon name="play" />
      Go to next unit
    </Button>
  );
};

const SettingsPopup = ({ settings, setSettings, fullScreenNode }) => {
  return (
    <Popup
      on="click"
      mountNode={fullScreenNode || undefined}
      trigger={
        <Button
          secondary
          width={1}
          size="large"
          icon="setting"
          style={{
            color: "white",
            maxWidth: "50px",
          }}
        />
      }
    >
      <Form>
        <Form.Group grouped>
          <Form.Field>
            <label>
              text size scaling <font style={{ color: "blue" }}>{`${settings.textSize}`}</font>
            </label>
            <Input
              size="mini"
              step={0.025}
              min={0.4}
              max={1.6}
              type="range"
              value={settings.textSize}
              onChange={(e, d) => setSettings((state) => ({ ...state, textSize: d.value }))}
            />
          </Form.Field>
        </Form.Group>
      </Form>
    </Popup>
  );
};

export default React.memo(AnnotateTask);
