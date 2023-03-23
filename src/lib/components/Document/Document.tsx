import React, { useState, useEffect, CSSProperties } from "react";
import AnnotateNavigation from "./components/AnnotateNavigation";
import Body from "./components/Body";
import useSpanSelector from "./hooks/useSpanSelector";
import useRelationSelector from "./hooks/useRelationSelector";
import useUnit from "./hooks/useUnit";
import SelectVariable from "./components/SelectVariable";

import useVariableMap from "./components/useVariableMap";
import {
  Variable,
  VariableMap,
  Unit,
  Annotation,
  SetState,
  VariableValueMap,
  TriggerSelector,
} from "../../types";
import { useCallback } from "react";
import styled from "styled-components";

const DocumentContainer = styled.div`
  display: flex;
  position: relative;
  height: 100%;
  max-height: 100%;
  flex-direction: column;
  color: var(--text);
  background: var(--background);
  z-index: 100;
  font-size: var(--font-size);
`;

interface DocumentProps {
  /** A unit object, as created in JobServerClass (or standardizeUnit) */
  unit: Unit;
  /** An array of annotations */
  annotations: Annotation[];
  /** An array of variables */
  variables?: Variable[];
  /** A VariableValueMap with codes per variable. If given, only these codes
   *  can be used
   */
  restrictedCodes?: VariableValueMap;
  /** An object with settings. Supports "editAll" (and probably more to come) */
  settings?: {
    [key: string]: any;
    editAll?: boolean;
  };
  /** If true, always show all annotations. This makes sense if the annotations property
   * is already the selection you need. But when coding multiple variables, it can be
   * better to set to false, so coders only see annotations of the variable they're working on
   */
  showAll?: boolean;
  /** for getting acces to annotations from the parent component
   *  If not given, Document is automatically in read only mode (i.e. cannot make annotations) */
  onChangeAnnotations?: (value: Annotation[]) => void;
  /** returnVariableMap */
  returnVariableMap?: SetState<VariableMap>;
  /**
   * a callback for returning a selector function to edit annotations
   */
  returnSelectors?: SetState<Record<string, TriggerSelector>>;
  /** A callback function that is called when the document is ready. This is mainly usefull for
   * managing layout while waiting for document to load
   */
  onReady?: Function;
  /** a boolean value for blocking all event listeners */
  blockEvents?: boolean;
  /** Names of fields to focus on, or Annotation objects to focus on */
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
  annotations,
  variables,
  restrictedCodes,
  settings,
  showAll,
  onChangeAnnotations,
  returnVariableMap,
  returnSelectors,
  onReady,
  blockEvents,
  focus,
  centered,
  bodyStyle,
}: DocumentProps) => {
  const [variable, setVariable] = useState(null);

  const [doc, annotationLib, annotationManager] = useUnit(unit, annotations, onChangeAnnotations);

  // keep track of current tokens object, to prevent rendering annotations on the wrong text
  const [currentUnit, setCurrentUnit] = useState(doc);

  const [variableMap, showValues, variableType, editMode] = useVariableMap(
    variables,
    variable,
    restrictedCodes
  );

  const [spanSelectorPopup, spanSelector, spanSelectorOpen] = useSpanSelector(
    doc,
    annotationLib,
    annotationManager,
    variableMap,
    editMode,
    variables
  );
  const [relationSelectorPopup, relationSelector, relationSelectorOpen] = useRelationSelector(
    doc,
    annotationLib,
    annotationManager,
    variableMap?.[variable]
  );

  useEffect(() => {
    returnSelectors && returnSelectors({ span: spanSelector, relation: relationSelector });
  }, [returnSelectors, spanSelector, relationSelector]);

  useEffect(() => {
    if (returnVariableMap) returnVariableMap(variableMap);
  }, [variableMap, returnVariableMap]);

  const onBodyReady = useCallback(() => {
    if (onReady) onReady();
    setCurrentUnit(doc);
  }, [onReady, doc, setCurrentUnit]);

  const triggerSelector = variableType === "relation" ? relationSelector : spanSelector;
  const selectorOpen = variableType === "relation" ? relationSelectorOpen : spanSelectorOpen;
  const selectorPopup = variableType === "relation" ? relationSelectorPopup : spanSelectorPopup;
  const annotationMode = variableType === "relation" ? "relationMode" : "spanMode";
  const currentUnitReady = currentUnit === doc;

  if (!doc.tokens && !doc.image_fields) return null;

  return (
    <DocumentContainer className={`${annotationMode} ${(editMode && "editMode") || ""}`}>
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
        onReady={onBodyReady}
        bodyStyle={bodyStyle}
        focus={focus}
        centered={centered}
        readOnly={!onChangeAnnotations}
        currentUnitReady={currentUnitReady}
      />

      <AnnotateNavigation
        tokens={doc.tokens}
        annotationLib={annotationLib}
        variable={variableMap?.[variable]}
        variableType={variableType}
        showValues={showValues}
        disableAnnotations={!onChangeAnnotations || !variableMap}
        editMode={editMode}
        triggerSelector={triggerSelector}
        eventsBlocked={selectorOpen || blockEvents}
        showAll={showAll}
      />

      {selectorPopup || null}
    </DocumentContainer>
  );
};

export default React.memo(Document);
