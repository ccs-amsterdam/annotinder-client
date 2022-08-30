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
import Backend from "./Backend";

class JobServerAPI implements JobServer {
  backend: Backend;
  job_id: number;
  setJobServer: SetState<JobServerAPI>;
  progress: Progress;
  codebook: CodeBook;
  return_link: string;

  constructor(
    backend: Backend,
    job_id: number,
    setJobServer: SetState<JobServerAPI>,
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
    return await this.backend.getUnit(this.job_id, i);
  }

  async postAnnotations(unitId: number, annotation: Annotation[], status: Status) {
    try {
      return await this.backend.postAnnotation(this.job_id, unitId, annotation, status);
    } catch (e) {
      if (this.setJobServer) this.setJobServer(null);
    }
  }

  async getDebriefing() {
    return this.backend.getDebriefing(this.job_id);
  }
}

export default JobServerAPI;
