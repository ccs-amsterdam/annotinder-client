import Annotator from "./components/Annotator/Annotator";
import JobServerAPI from "./components/AnnotatorClient/classes/JobServerAPI";
import JobServerDemo from "./components/DemoJob/classes/JobServerDemo";
import AnnotatorRClient from "./components/AnnotatorClient/AnnotatorRClient";

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
  JobServerAPI,
  JobServerDemo,
  AnnotatorRClient,
  AnnotatorAmcatClient,
  prepareDocument,
  standardizeCodes,
  getCodebook,
  exportSpanAnnotations,
  getCodeTreeArray,
  codeBookEdgesToMap,
};
