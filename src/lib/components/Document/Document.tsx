import React, { useState, useEffect, useRef, CSSProperties, useMemo } from "react";
import AnnotateNavigation from "./components/AnnotateNavigation";
import Body from "./components/Body";
import useCodeSelector from "./components/useCodeSelector";
import { exportFieldAnnotations, exportSpanAnnotations } from "../../functions/annotations";
import useUnit from "./components/useUnit";
import SelectVariable from "./components/SelectVariable";

import "./documentStyle.css";
import useVariableMap from "./components/useVariableMap";
import {
  CodeHistory,
  Variable,
  VariableMap,
  Unit,
  Annotation,
  SpanAnnotations,
  FieldAnnotations,
  Token,
  SetState,
  FullScreenNode,
} from "../../types";

interface DocumentProps {
  /** A unit object, as created in JobServerClass (or standardizeUnit) */
  unit: Unit;
  /** An array of variables */
  variables?: Variable[];
  /** An object with settings. Supports "editAll" (and probably more to come) */
  settings?: {
    [key: string]: any;
    editAll?: boolean;
  };
  /** for getting acces to annotations from the parent component
   *  If not given, Document is automatically in read only mode (i.e. cannot make annotations) */
  onChangeAnnotations?: (value: Annotation[]) => void;
  /** for getting access to the tokens from the parent component  */
  returnTokens?: SetState<Token[]>;
  /** returnVariableMap */
  returnVariableMap?: SetState<VariableMap>;
  /** for setting a boolean state indicating whether the document is ready to render */
  setReady?: SetState<number>;
  /** a boolean value for blocking all event listeners */
  blockEvents?: boolean;
  /** in fullscreenmode popups require a mountNode */
  fullScreenNode?: FullScreenNode;
  /** An array of variable names, to indicate that annotations of this variable should be highlighted */
  showAnnotations?: string[];
  /** Names of fields to focus on */
  focus?: string[];
  /** CSSProperties for the body container  */
  bodyStyle?: CSSProperties;
}

/**
 * This is hopefully the only Component in this folder that you'll ever see. It should be fairly isolated
 * and easy to use, but behind the scenes it gets dark real fast.
 */
const Document = ({
  unit,
  variables,
  settings,
  onChangeAnnotations,
  returnTokens,
  returnVariableMap,
  setReady,
  blockEvents,
  fullScreenNode,
  showAnnotations,
  focus,
  bodyStyle,
}: DocumentProps) => {
  const safetyCheck = useRef(null); // ensures only new annotations for the current unit are passed to onChangeAnnotations
  const [variable, setVariable] = useState(null);
  const [codeHistory, setCodeHistory] = useState<CodeHistory>({});
  const [spanAnnotations, setSpanAnnotations] = useState<SpanAnnotations | null>(null);
  const [fieldAnnotations, setFieldAnnotations] = useState<FieldAnnotations | null>(null);
  const [tokensReady, setTokensReady] = useState(0);

  const [doc, importedCodes] = useUnit(
    unit,
    safetyCheck,
    returnTokens,
    setSpanAnnotations,
    setFieldAnnotations,
    setCodeHistory
  );

  const [variableMap, editMode] = useVariableMap(variables, variable, importedCodes);
  const [codeSelector, triggerCodeSelector, codeSelectorOpen] = useCodeSelector(
    doc.tokens,
    variableMap,
    editMode,
    variables,
    spanAnnotations,
    setSpanAnnotations,
    codeHistory,
    setCodeHistory,
    fullScreenNode
  );

  // If annotations change, immediately prepare memoised version in standard annotation
  // array format. Then when one of these changes, a side effect performs onChangeAnnotations
  const exportedSpanAnnotations: Annotation[] = useMemo(() => {
    return exportSpanAnnotations(spanAnnotations, doc.tokens, true);
  }, [spanAnnotations, doc]);

  const exportedFieldAnnotations: Annotation[] = useMemo(() => {
    return exportFieldAnnotations(fieldAnnotations);
  }, [fieldAnnotations]);

  useEffect(() => {
    // if exported annotations are updated, and onChangeAnnotations
    if (!onChangeAnnotations) return;
    // check if same unit, to prevent annotations from spilling over due to race conditions
    if (safetyCheck.current.tokens !== doc.tokens) return;
    onChangeAnnotations([...exportedSpanAnnotations, ...exportedFieldAnnotations]);
  }, [doc.tokens, exportedSpanAnnotations, exportedFieldAnnotations, onChangeAnnotations]);

  useEffect(() => {
    if (returnVariableMap) returnVariableMap(variableMap);
  }, [variableMap, returnVariableMap]);

  useEffect(() => {
    if (setReady) setReady((counter) => counter + 1);
    setSpanAnnotations((spanAnnotations: SpanAnnotations) => ({ ...spanAnnotations })); //trigger DOM update after token refs have been prepared
  }, [tokensReady, setSpanAnnotations, setReady]);

  if (!doc.tokens && !doc.image_fields) return null;

  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        height: "100%",
        maxHeight: "100%",
        flexDirection: "column",
      }}
    >
      <SelectVariable
        variables={variables}
        variable={variable}
        setVariable={setVariable}
        editAll={settings?.editAll}
      />
      <Body
        tokens={doc.tokens}
        text_fields={doc.text_fields}
        meta_fields={doc.meta_fields}
        image_fields={doc.image_fields}
        markdown_fields={doc.markdown_fields}
        grid={doc.grid}
        setReady={setTokensReady}
        bodyStyle={bodyStyle}
        focus={focus}
      />

      <AnnotateNavigation
        tokens={doc.tokens}
        variableMap={variableMap}
        annotations={spanAnnotations}
        disableAnnotations={!onChangeAnnotations || !variableMap}
        editMode={editMode}
        triggerCodeSelector={triggerCodeSelector}
        eventsBlocked={codeSelectorOpen || blockEvents}
        showAnnotations={showAnnotations}
        fullScreenNode={fullScreenNode}
      />
      {codeSelector || null}
    </div>
  );
};

export default React.memo(Document);
