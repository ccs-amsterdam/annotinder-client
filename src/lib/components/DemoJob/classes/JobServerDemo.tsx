import { Annotation, CodeBook, RawUnit, BackendUnit, Status, Progress } from "../../../types";

class JobServerDemo {
  codebook: CodeBook; // TODO: add codebook interface
  units: BackendUnit[];
  progress: Progress;
  return_link: string;

  constructor(codebook: CodeBook, units: RawUnit[]) {
    this.codebook = codebook;
    this.units = units.map((u, i) => ({ ...u, index: i }));
    this.progress = {
      n_total: units.length,
      n_coded: 0,
      seek_backwards: true,
      seek_forwards: false,
    };
    this.return_link = "/demo";
  }

  async init() {}

  async getUnit(i: number) {
    this.progress.n_coded = Math.max(i, this.progress.n_coded);
    return this.units[i];
  }

  async postAnnotations(
    unit_id: number,
    unit_index: number,
    annotation: Annotation[],
    status: Status
  ) {
    try {
      this.units[unit_index].annotation = annotation;
      this.units[unit_index].status = status;
      this.progress.n_coded = Math.max(unit_index + 1, this.progress.n_coded);
    } catch (e) {
      console.error(e);
    }
  }
}

export default JobServerDemo;
