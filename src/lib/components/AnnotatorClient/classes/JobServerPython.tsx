import { importCodebook } from "../../../functions/codebook";
import {
  Annotation,
  RawUnit,
  CodeBook,
  ConditionReport,
  JobServer,
  Progress,
  SetState,
  Status,
} from "../../../types";
import Backend from "../../Login/Backend";

class JobServerPython implements JobServer {
  backend: Backend;
  job_id: string;
  setJobServer: SetState<JobServerPython>;
  progress: Progress;
  codebook: CodeBook;
  return_link: string;

  constructor(
    backend: Backend,
    job_id: string,
    setJobServer: SetState<JobServerPython>,
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

  async getUnit(i: number): Promise<RawUnit> {
    return await this.backend.getUnit(this.job_id, i);
  }

  async postAnnotations(unitId: string, annotation: Annotation[], status: Status) {
    try {
      const conditionReport: ConditionReport = await this.backend.postAnnotation(
        this.job_id,
        unitId,
        annotation,
        status
      );
      return conditionReport;
    } catch (e) {
      if (this.setJobServer) this.setJobServer(null);
    }
  }

  async getDebriefing() {
    return await this.backend.getDebriefing(this.job_id);
  }
}

export default JobServerPython;
