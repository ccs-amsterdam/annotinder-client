import checkConditions from "../../../functions/checkConditions";
import { importCodebook } from "../../../functions/codebook";
import {
  Annotation,
  BackendUnit,
  CodeBook,
  JobServer,
  Progress,
  SetState,
  Status,
} from "../../../types";
import Backend from "../../Login/Backend";

class JobServerR implements JobServer {
  backend: Backend;
  job_id: number;
  setJobServer: SetState<JobServerR>;
  progress: Progress;
  codebook: CodeBook;
  return_link: string;
  unit: BackendUnit;

  constructor(
    backend: Backend,
    job_id: number,
    setJobServer: SetState<JobServerR>,
    return_link: string = undefined
  ) {
    this.backend = backend;
    this.job_id = job_id;
    this.return_link = return_link;
    this.setJobServer = setJobServer;
  }

  async init() {
    const rawcodebook = await this.backend.getCodebook(this.job_id);
    this.codebook = importCodebook(rawcodebook);
    this.progress = await this.backend.getProgress(this.job_id);
  }

  async getUnit(i: number): Promise<BackendUnit> {
    this.unit = await this.backend.getUnit(this.job_id, i);
    return this.unit;
  }

  async postAnnotations(unitId: number, annotation: Annotation[], status: Status) {
    try {
      await this.backend.postAnnotation(this.job_id, unitId, annotation, status);
      return checkConditions({ ...this.unit, annotation });
    } catch (e) {
      if (this.setJobServer) this.setJobServer(null);
    }
  }

  async getDebriefing() {
    return this.backend.getDebriefing(this.job_id);
  }
}

export default JobServerR;
