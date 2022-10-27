import {
  Annotation,
  RawCodeBook,
  CodeBook,
  Status,
  Progress,
  JobServer,
  DemoData,
  RawUnit,
  ConditionReport,
} from "../../../types";
import { importCodebook } from "../../../functions/codebook";
import checkConditions from "../../../functions/checkConditions";

class JobServerDemo implements JobServer {
  codebook: CodeBook; // TODO: add codebook interface
  demodata: DemoData;
  progress: Progress;
  return_link: string;

  constructor(codebook: RawCodeBook, units: RawUnit[]) {
    this.codebook = importCodebook(codebook);
    this.demodata = {
      units: units.map((u, i) => {
        return {
          id: i,
          external_id: String(u.id),
          unit: u.unit,
          type: u.type,
          conditionals: u.conditionals,
          index: i,
          status: null,
        };
      }),
    };
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
    if (i < 0) i = this.progress.n_coded;
    let unit = this.demodata.units[i];
    // deep copy to make sure no modifications seep into the demodata.units
    unit = JSON.parse(JSON.stringify(unit));
    return unit;
  }

  async postAnnotations(
    unit_id: number,
    annotation: Annotation[],
    status: Status
  ): Promise<ConditionReport> {
    try {
      let unit_index = Number(unit_id); // in demo job, we use the index as id
      this.demodata.units[unit_index].annotation = annotation;
      this.demodata.units[unit_index].status =
        this.demodata.units[unit_index].status === "DONE" ? "DONE" : status;
      this.progress.n_coded = Math.max(unit_index + 1, this.progress.n_coded);
      return checkConditions(this.demodata.units[unit_index]);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async getDebriefing() {
    return {
      message: "This is the end of the demo job!",
      link: "/demo",
      link_text: "return to overview",
    };
  }
}

export default JobServerDemo;
