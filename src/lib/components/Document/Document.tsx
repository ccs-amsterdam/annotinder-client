import React, { useState, useEffect, useRef, CSSProperties } from "react";
import AnnotateNavigation from "./components/AnnotateNavigation";
import Body from "./components/Body";
import useCodeSelector from "./components/useCodeSelector";
import useUnit from "./components/useUnit";
import SelectVariable from "./components/SelectVariable";

import "./documentStyle.css";
import useVariableMap from "./components/useVariableMap";
import {
  Variable,
  VariableMap,
  Unit,
  Annotation,
  SpanAnnotations,
  Token,
  SetState,
  FullScreenNode,
} from "../../types";
import { useCallback } from "react";

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
  /** A callback function that is called when the document is ready. This is mainly usefull for
   * managing layout while waiting for document to load
   */
  onReady?: Function;
  /** a boolean value for blocking all event listeners */
  blockEvents?: boolean;
  /** in fullscreenmode popups require a mountNode */
  fullScreenNode?: FullScreenNode;
  /** An array of variable names, to indicate that annotations of this variable should be highlighted */
  showAnnotations?: string[];
  /** Names of fields to focus on */
  focus?: string[];
  /** Should the text be centered? */
  centered?: boolean;
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
  onReady,
  blockEvents,
  fullScreenNode,
  showAnnotations,
  focus,
  centered,
  bodyStyle,
}: DocumentProps) => {
  const safetyCheck = useRef(null); // ensures only new annotations for the current unit are passed to onChangeAnnotations
  const [variable, setVariable] = useState(null);

  const unitStates = useUnit(unit, safetyCheck, returnTokens, onChangeAnnotations);
  const [variableMap, editMode] = useVariableMap(variables, variable, unitStates.importedCodes);
  const [codeSelector, triggerCodeSelector, codeSelectorOpen] = useCodeSelector(
    unitStates,
    variableMap,
    editMode,
    variables
  );

  useEffect(() => {
    if (returnVariableMap) returnVariableMap(variableMap);
  }, [variableMap, returnVariableMap]);

  const setSpanAnnotations = unitStates.setSpanAnnotations;
  const onBodyReady = useCallback(() => {
    if (onReady) onReady();
    setSpanAnnotations((spanAnnotations: SpanAnnotations) => ({ ...spanAnnotations })); //trigger DOM update after token refs have been prepared
  }, [onReady, setSpanAnnotations]);

  if (!unitStates.doc.tokens && !unitStates.doc.image_fields) return null;

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
        tokens={unitStates.doc.tokens}
        text_fields={unitStates.doc.text_fields}
        meta_fields={unitStates.doc.meta_fields}
        image_fields={unitStates.doc.image_fields}
        markdown_fields={unitStates.doc.markdown_fields}
        grid={unitStates.doc.grid}
        onReady={onBodyReady}
        bodyStyle={bodyStyle}
        focus={focus}
        centered={centered}
      />

      <AnnotateNavigation
        tokens={unitStates.doc.tokens}
        variableMap={variableMap}
        annotations={unitStates.spanAnnotations}
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
