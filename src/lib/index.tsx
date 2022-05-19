import Annotator from "./components/Annotator/Annotator";
import JobServerAPI from "./components/AnnotatorClient/classes/JobServerAPI";
import JobServerDemo from "./components/DemoJob/classes/JobServerDemo";
import AnnotatorAmcatClient from "./components/AnnotatorClient/AnnotatorAmcatClient";
import AnnotatorRClient from "./components/AnnotatorClient/AnnotatorRClient";

import { prepareDocument } from "./functions/createDocuments";
import { standardizeCodes, getCodeTreeArray, codeBookEdgesToMap } from "./functions/codebook";
import { exportSpanAnnotations } from "./functions/annotations";

export {
  Annotator as default,
  JobServerAPI,
  JobServerDemo,
  AnnotatorRClient,
  AnnotatorAmcatClient,
  prepareDocument,
  standardizeCodes,
  exportSpanAnnotations,
  getCodeTreeArray,
  codeBookEdgesToMap,
};
