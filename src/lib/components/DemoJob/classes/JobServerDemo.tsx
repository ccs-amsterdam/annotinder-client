import {
  Annotation,
  RawCodeBook,
  CodeBook,
  RawUnit,
  BackendUnit,
  Status,
  Progress,
  JobServer,
  Gold,
  GoldFeedback,
  DemoData,
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
          gold: u.gold,
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
  ) {
    try {
      this.demodata.units[unit_index].annotation = annotation;
      this.demodata.units[unit_index].status =
        this.demodata.units[unit_index].status === "DONE" ? "DONE" : status;
      this.progress.n_coded = Math.max(unit_index + 1, this.progress.n_coded);
      return checkGold(this.demodata.units, unit_index);
    } catch (e) {
      console.error(e);
      return [];
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

function checkGold(units: BackendUnit[], unitIndex: number): GoldFeedback[] {
  const type = units[unitIndex].type;
  if (type !== "train" && type !== "test") return [];
  const gold: Gold = {
    action: type === "train" ? "retry" : "silent",
    damage: type === "train" ? 0 : 10,
    matches: units[unitIndex].gold,
  };
  const annotation: Annotation[] = units[unitIndex].annotation;
  const status: Status = units[unitIndex].status;
  if (!gold.matches) return [];

  const goldfeedback: GoldFeedback[] = [];
  let damage = 0;
  goldloop: for (let g of gold.matches) {
    // only check gold matches for variables that have been coded
    // (if unit is done, all variables are assumed to have been coded)
    let variableCoded = status === "DONE";
    for (let a of annotation) {
      if (g.variable !== a.variable) continue;
      variableCoded = true;
      if (g.field && g.field !== a.field) continue;
      if (g.offset && g.offset !== a.offset) continue;
      if (g.length && g.length !== a.length) continue;

      const op = g.operator || "==";
      if (op === "==" && a.value === g.value) continue goldloop;
      if (op === "<=" && a.value <= g.value) continue goldloop;
      if (op === "<" && a.value < g.value) continue goldloop;
      if (op === ">=" && a.value >= g.value) continue goldloop;
      if (op === ">" && a.value > g.value) continue goldloop;
      if (op === "!=" && a.value !== g.value) continue goldloop;
    }
    if (!variableCoded) continue;

    // being here means none of the annotations matched the gold
    damage += g.damage || 0;

    if (gold.action === "retry") {
      const feedback: GoldFeedback = { variable: g.variable };
      if (g.message) feedback.message = g.message;
      goldfeedback.push(feedback);
    }
  }

  // damage can occur on both the level of specific matches and the gold in general
  damage += gold.damage || 0;

  units[unitIndex].damage = gold.redemption
    ? damage
    : Math.max(damage, units[unitIndex].damage || 0);

  if (damage && goldfeedback.length === 0) {
    alert(
      `This answer silently gave you ${units[unitIndex].damage} damage!\n(coders normally don't see this message)`
    );
  }

  if (goldfeedback.length > 0) units[unitIndex].status = "IN_PROGRESS";
  units[unitIndex].goldFeedback = goldfeedback;

  return goldfeedback;
}

export default JobServerDemo;
