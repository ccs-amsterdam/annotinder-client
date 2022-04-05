class JobServerDemo {
  constructor(codebook, units) {
    this.codebook = codebook;
    this.units = units.map((u, i) => ({ ...u, id: i })); // use index as id
    this.progress = {
      n_total: units.length,
      n_coded: 0,
      seek_backwards: true,
      seek_forwards: false,
    };
  }

  async init() {
    try {
      this.success = true;
    } catch (e) {
      console.error(e);
      this.success = false;
      return;
    }
  }

  async getUnit(i) {
    this.progress.n_coded = Math.max(i, this.progress.n_coded);
    return this.units[i];
  }

  async postAnnotations(unit_id, annotation, status) {
    try {
      this.units[unit_id].annotation = annotation;
      this.units[unit_id].status = status;
    } catch (e) {
      console.error(e);
    }
  }
}

export default JobServerDemo;
