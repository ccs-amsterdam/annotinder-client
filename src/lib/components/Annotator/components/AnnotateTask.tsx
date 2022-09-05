import React, { useState, useEffect, useRef } from "react";
import { Grid, Button, Popup, Form, Input, Icon } from "semantic-ui-react";
import AnnotateTable from "./AnnotateTable";
import Document from "../../Document/Document";
import useLocalStorage from "../../../hooks/useLocalStorage";
import AnnotateTaskManual from "./AnnotateTaskManual";
import {
  Annotation,
  FullScreenNode,
  Unit,
  VariableMap,
  SetState,
  CodeBook,
  SessionData,
} from "../../../types";
import Instructions from "./Instructions";

const NEXTDELAY = 500;
const BODYSTYLE = {
  paddingTop: "10px",
  paddingBottom: "10px",
};

interface AnnotateTaskProps {
  unit: Unit;
  codebook: CodeBook;
  nextUnit: () => void;
  fullScreenNode: FullScreenNode;
  sessionData?: SessionData;
  blockEvents?: boolean;
}

const AnnotateTask = ({
  unit,
  codebook,
  nextUnit,
  fullScreenNode,
  sessionData,
  blockEvents = false,
}: AnnotateTaskProps) => {
  const [annotations, onChangeAnnotations] = useAnnotations(unit);
  const [variableMap, setVariableMap] = useState<VariableMap>(null);
  const [settings, setSettings] = useLocalStorage("annotateTaskSettings", { textSize: 1 });
  const [tokens, setTokens] = useState(null);

  if (!unit || codebook?.variables === null) return null;

  const renderAnnotateTable = () => {
    if (codebook?.settings?.no_table) return null;
    return (
      <Grid.Column
        width={6}
        style={{
          padding: "0",
          height: "100%",
          paddingLeft: "10px",
        }}
      >
        <div style={{ borderBottom: "1px solid", height: "calc(100%)", overflow: "auto" }}>
          <AnnotateTable tokens={tokens} variableMap={variableMap} annotations={annotations} />
        </div>
      </Grid.Column>
    );
  };

  return (
    <Grid
      centered
      stackable
      style={{ height: "100%", width: "100%", paddingTop: "0", margin: "0" }}
      columns={2}
    >
      <Grid.Column
        width={10}
        style={{
          padding: "0",
          height: "100%",
          //margin: "0",
        }}
      >
        <div
          style={{
            height: "calc(100% - 35px)",
            fontSize: `${settings.textSize}em`,
          }}
        >
          <Document
            unit={unit}
            settings={codebook?.settings}
            variables={codebook?.variables}
            onChangeAnnotations={onChangeAnnotations}
            returnTokens={setTokens}
            returnVariableMap={setVariableMap}
            blockEvents={blockEvents}
            fullScreenNode={fullScreenNode}
            bodyStyle={BODYSTYLE}
          />
        </div>
        <Button.Group
          fluid
          style={{
            padding: "0",
            height: "35px",
            background: "#27292a",
            borderRadius: "5px",
          }}
        >
          <SettingsPopup
            settings={settings}
            setSettings={setSettings}
            fullScreenNode={fullScreenNode}
          />
          <Instructions
            codebook={codebook}
            sessionData={sessionData}
            fullScreenNode={fullScreenNode}
          />
          <AnnotateTaskManual fullScreenNode={fullScreenNode} />
          <NextUnitButton unit={unit} annotations={annotations} nextUnit={nextUnit} />
        </Button.Group>
      </Grid.Column>
      {renderAnnotateTable()}
    </Grid>
  );
};

const useAnnotations = (unit: Unit): [Annotation[], (value: Annotation[]) => void] => {
  // simple hook for onChangeAnnotations that posts to server and returns state
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
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
    (newAnnotations: Annotation[]) => {
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

const annotationsHaveChanged = (old: Annotation[], current: Annotation[]) => {
  if (old.length !== current.length) return true;
  const compareOn = ["variable", "value", "field", "offset", "length"];
  for (let i = 0; i < old.length; i++) {
    for (let field of compareOn) {
      if (old[i]?.[field as keyof Annotation] !== current[i]?.[field as keyof Annotation])
        return true;
    }
  }
  return false;
};

const getCleanAnnotations = (annotations: Annotation[]) => {
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

interface NextUnitButtonProps {
  unit: Unit;
  annotations: Annotation[];
  nextUnit: () => void;
}

const NextUnitButton = ({ unit, annotations, nextUnit }: NextUnitButtonProps) => {
  const [tempDisable, setTempDisable] = useState("ready");

  const onNext = () => {
    if (tempDisable !== "ready") return;

    // write DONE status
    setTempDisable("loading");
    unit.jobServer
      .postAnnotations(unit.unitId, getCleanAnnotations(annotations), "DONE")
      .then((res: any) => {
        // wait until post succeeds before moving to next unit, because backend
        // needs to know this unit is done.
        nextUnit();
        setTempDisable("cooldown");
        setTimeout(() => {
          setTempDisable("ready");
        }, NEXTDELAY);
      })
      .catch((e: Error) => {
        console.error(e);
        setTempDisable("ready");
      });
  };

  const onKeyDown = (e: KeyboardEvent) => {
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
      style={{ padding: "5px", marginLeft: "30px" }}
      onClick={onNext}
    >
      <Icon name="play" />
      Go to next unit
    </Button>
  );
};

interface SettingsPopupProps {
  settings: Record<string, string | number>;
  setSettings: SetState<Record<string, string | number>>;
  fullScreenNode: FullScreenNode;
}

const SettingsPopup = ({ settings, setSettings, fullScreenNode }: SettingsPopupProps) => {
  return (
    <Popup
      on="click"
      mountNode={fullScreenNode || undefined}
      trigger={
        <Button
          width={1}
          size="huge"
          icon="setting"
          style={{
            background: "transparent",
            cursor: "pointer",
            color: "white",
            padding: "4px 5px 4px 5px",
            maxWidth: "30px",
            zIndex: 900,
          }}
        />
      }
    >
      <Form>
        <Form.Group grouped>
          <Form.Field>
            <label>
              text size scaling <span style={{ color: "blue" }}>{`${settings.textSize}`}</span>
            </label>
            <Input
              size="mini"
              step={0.025}
              min={0.4}
              max={1.6}
              type="range"
              value={settings.textSize}
              onChange={(e, d) => setSettings((state: any) => ({ ...state, textSize: d.value }))}
            />
          </Form.Field>
        </Form.Group>
      </Form>
    </Popup>
  );
};

export default React.memo(AnnotateTask);
