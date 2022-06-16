import {
  Annotation,
  RawCodeBook,
  CodeBook,
  RawUnit,
  BackendUnit,
  Status,
  Progress,
  JobServer,
  Feedback,
  DemoData,
  ConditionReport,
  ConditionAction,
} from "../../../types";
import { importCodebook } from "../../../functions/codebook";

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
          external_id: u.id,
          unit: u.unit,
          type: u.type,
          conditions: u.conditions,
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
    return this.demodata.units[i];
  }

  async postAnnotations(
    unit_id: number,
    unit_index: number,
    annotation: Annotation[],
    status: Status
  ): Promise<ConditionReport> {
    try {
      this.demodata.units[unit_index].annotation = annotation;
      this.demodata.units[unit_index].status =
        this.demodata.units[unit_index].status === "DONE" ? "DONE" : status;
      this.progress.n_coded = Math.max(unit_index + 1, this.progress.n_coded);
      return checkConditions(this.demodata.units, unit_index);
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

function checkConditions(units: BackendUnit[], unitIndex: number): ConditionReport {
  const type = units[unitIndex].type;
  if (type !== "train" && type !== "test" && type !== "screening")
    return { action: "pass", feedback: [] };
  if (!units[unitIndex].conditions) return { action: "pass", feedback: [] };

  const annotation: Annotation[] = units[unitIndex].annotation;
  const status: Status = units[unitIndex].status;

  const feedback: Feedback[] = [];
  let damage = 0;
  let pass = true;
  outerloop: for (let c of units[unitIndex].conditions) {
    // only check gold matches for variables that have been coded
    // (if unit is done, all variables are assumed to have been coded)
    let variableCoded = status === "DONE";
    for (let a of annotation) {
      if (c.variable !== a.variable) continue;
      variableCoded = true;
      if (c.field && c.field !== a.field) continue;
      if (c.offset && c.offset !== a.offset) continue;
      if (c.length && c.length !== a.length) continue;

      const op = c.operator || "==";
      if (op === "==" && a.value === c.value) continue outerloop;
      if (op === "<=" && a.value <= c.value) continue outerloop;
      if (op === "<" && a.value < c.value) continue outerloop;
      if (op === ">=" && a.value >= c.value) continue outerloop;
      if (op === ">" && a.value > c.value) continue outerloop;
      if (op === "!=" && a.value !== c.value) continue outerloop;
    }
    if (!variableCoded) continue;
    pass = false;

    // being here means none of the annotations matched the gold
    if (type === "test") damage += c.damage != null ? c.damage : 10;

    if (type === "train" || type === "screening") {
      const f: Feedback = { variable: c.variable };
      if (c.message) f.message = c.message;
      feedback.push(f);
    }
  }

  if (pass) {
    if (type === "train") return { action: "applaud", feedback: [] };
    return { action: "pass", feedback: [] };
  }

  units[unitIndex].damage = damage;
  // const redemption = type === 'test'
  // units[unitIndex].damage = redemption
  //   ? damage
  //   : Math.max(damage, units[unitIndex].damage || 0);

  if (damage && feedback.length === 0) {
    alert(
      `This answer silently gave you ${units[unitIndex].damage} damage!\n(coders normally don't see this message)`
    );
  }

  let action: ConditionAction = "silent";
  if (type === "train") action = "retry";
  if (type === "screening") action = "stop";
  if (action !== "silent") units[unitIndex].status = "IN_PROGRESS";

  return { action, feedback };
}

export default JobServerDemo;
