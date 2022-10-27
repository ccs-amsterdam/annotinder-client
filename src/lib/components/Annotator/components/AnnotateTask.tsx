import React, { useState, useEffect, useRef, useMemo } from "react";
import { Form, Input, Icon } from "semantic-ui-react";
import AnnotateTable from "./AnnotateTable";
import Document from "../../Document/Document";
import useLocalStorage from "../../../hooks/useLocalStorage";
import AnnotateTaskManual from "./AnnotateTaskManual";
import RelativePopup from "../../Common/RelativePopup";

import {
  Annotation,
  FullScreenNode,
  Unit,
  VariableValueMap,
  VariableMap,
  SetState,
  CodeBook,
  SessionData,
} from "../../../types";
import Instructions from "./Instructions";
import ThemeSelector from "../../Common/Theme";
import { StyledButton } from "../../../styled/StyledSemantic";
import styled from "styled-components";

const NEXTDELAY = 500;
const BODYSTYLE = {
  paddingTop: "10px",
  paddingBottom: "10px",
};

const AnnotateGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-areas: "document table";
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr;
  height: 100%;
  width: 100%;
  overflow: auto;

  @media screen and (max-width: 800px) {
    grid-template-areas: "table" "document";
    grid-template-columns: 1fr;
    grid-template-rows: 30% 70%;
    grid-gap: 0;
  }

  & .document {
    grid-area: document;
    overflow: auto;
    height: 100%;
  }
  & .table {
    grid-area: table;
    overflow: auto;
    border-bottom: 1px solid;
  }
`;

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

  const restrictedCodes = useMemo(() => {
    const restrictedCodes: VariableValueMap = {};
    for (let v of codebook.variables) {
      if (v.onlyImported) restrictedCodes[v.name] = {};
    }
    for (let a of unit.unit.importedAnnotations || []) {
      if (!restrictedCodes[a.variable]) continue;
      restrictedCodes[a.variable][a.value] = true;
    }
    return restrictedCodes;
  }, [unit, codebook]);

  if (!unit || codebook?.variables === null) return null;

  let ann = unit.unit.annotations;
  if (unit.unit.importedAnnotations && (!ann || ann.length === 0) && unit.status !== "DONE")
    ann = unit.unit.importedAnnotations;

  return (
    <AnnotateGrid>
      <div className="document">
        <div
          style={{
            height: "calc(100% - 35px)",
            fontSize: `${settings.textSize}em`,
            overflow: "auto",
          }}
        >
          <Document
            unit={unit}
            annotations={ann}
            settings={codebook?.settings}
            variables={codebook?.variables}
            restrictedCodes={restrictedCodes}
            onChangeAnnotations={onChangeAnnotations}
            returnTokens={setTokens}
            returnVariableMap={setVariableMap}
            blockEvents={blockEvents}
            fullScreenNode={fullScreenNode}
            bodyStyle={BODYSTYLE}
          />
        </div>
        <div
          style={{
            display: "flex",
            padding: "0",
            height: "35px",
            background: "var(--secondary)",
            borderRadius: "5px",
          }}
        >
          <SettingsPopup settings={settings} setSettings={setSettings} />
          <Instructions
            codebook={codebook}
            sessionData={sessionData}
            fullScreenNode={fullScreenNode}
          />
          <AnnotateTaskManual fullScreenNode={fullScreenNode} />
          <NextUnitButton unit={unit} annotations={annotations} nextUnit={nextUnit} />
        </div>
      </div>
      <div className="table">
        <div style={{}}>
          <AnnotateTable tokens={tokens} variableMap={variableMap} annotations={annotations} />
        </div>
      </div>
    </AnnotateGrid>
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
    setAnnotations(unit.unit.annotations || []);
    // if (!unit.annotations || unit.annotations.length === 0)
    //   unit.jobServer.postAnnotations(unit.unitId, [], "IN_PROGRESS");
  }, [unit, setAnnotations]);

  const onChangeAnnotations = React.useCallback(
    (newAnnotations: Annotation[]) => {
      if (unit.unitId !== safeWrite.current) return;
      setAnnotations(newAnnotations);
      const cleanAnnotations = getCleanAnnotations(newAnnotations);
      if (!annotationsHaveChanged(unit.unit.annotations || [], cleanAnnotations)) return;
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
    <StyledButton
      disabled={tempDisable !== "ready"}
      loading={tempDisable === "loading"}
      primary
      fluid
      size="tiny"
      style={{ padding: "5px", marginLeft: "30px", marginRight: "0px" }}
      onClick={onNext}
    >
      <Icon name="play" />
      Go to next unit
    </StyledButton>
  );
};

interface SettingsPopupProps {
  settings: Record<string, string | number>;
  setSettings: SetState<Record<string, string | number>>;
}

const SettingsPopup = ({ settings, setSettings }: SettingsPopupProps) => {
  return (
    <RelativePopup
      trigger={
        <StyledButton
          size="huge"
          icon="setting"
          style={{
            padding: "8px 5px 4px 5px",
            maxWidth: "30px",
            background: "transparent",
            color: "var(--text-inversed-fixed)",
            cursor: "pointer",
            margin: "0",
            width: "30px",
            zIndex: 1000,
          }}
        />
      }
    >
      <Form>
        <Form.Field style={{ textAlign: "center" }}>
          <label>Dark mode</label>
          <ThemeSelector />
        </Form.Field>
        <Form.Group grouped>
          <Form.Field>
            <label>
              text size scaling{" "}
              <span style={{ color: "var(--primary)" }}>{`${settings.textSize}`}</span>
            </label>
            <Input
              size="mini"
              step={0.025}
              min={0.4}
              max={1.6}
              type="range"
              value={settings.textSize}
              onChange={(e, d) => setSettings({ ...settings, textSize: d.value })}
            />
          </Form.Field>
        </Form.Group>
      </Form>
    </RelativePopup>
  );
};

export default React.memo(AnnotateTask);
