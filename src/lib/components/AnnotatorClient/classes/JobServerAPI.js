class JobServerAPI {
  constructor(backend, job_id, setJobServer) {
    this.backend = backend;
    this.job_id = job_id;
    this.where = "remote";
    this.setJobServer = setJobServer;
  }

  async init() {
    try {
      this.codebook = await this.backend.getCodebook(this.job_id);
      this.progress = await this.backend.getProgress(this.job_id);
    } catch (e) {
      console.error(e);
      this.success = false;
      return;
    }
    this.success = true;
  }

  async getUnit(i) {
    const getNext = i >= this.progress.n_coded && !this.progress.seek_forwards;
    const unit = await this.backend.getUnit(this.job_id, getNext ? null : i);
    //this.progress.n_coded = Math.max(unit?.index ?? i, this.progress.n_coded);
    return unit;
  }

  async postAnnotations(unitId, unitIndex, annotation, status) {
    try {
      await this.backend.postAnnotation(this.job_id, unitId, annotation, status);
      this.progress.n_coded = Math.max(unitIndex + 1, this.progress.n_coded);
    } catch (e) {
      if (this.setJobServer) this.setJobServer(null);
    }
  }
}

export default JobServerAPI;
