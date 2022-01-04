import Annotator from "./components/Annotator/Annotator";
import QuestionTask from "./components/Annotator/components/QuestionTask";
import AnnotateTask from "./components/Annotator/components/AnnotateTask";
import IndexController from "./components/Annotator/components/IndexController";
import Document from "./components/Document/Document";

import { prepareDocument } from "./functions/createDocuments";
import {
  standardizeCodes,
  getCodebook,
  getCodeTreeArray,
  codeBookEdgesToMap,
} from "./functions/codebook";
import { exportSpanAnnotations } from "./functions/annotations";

export {
  Annotator as default,
  QuestionTask,
  AnnotateTask,
  IndexController,
  Document,
  prepareDocument,
  standardizeCodes,
  getCodebook,
  exportSpanAnnotations,
  getCodeTreeArray,
  codeBookEdgesToMap,
};
