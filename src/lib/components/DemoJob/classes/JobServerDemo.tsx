import {
  Annotation,
  RawCodeBook,
  CodeBook,
  RawUnit,
  BackendUnit,
  Status,
  Progress,
  JobServer,
  DemoData,
  ConditionReport,
  ConditionalAction,
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
    return { id: i, ...this.demodata.units[i], unit: { ...this.demodata.units[i].unit } };
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
  const cr: ConditionReport = { evaluation: {}, damage: {} };

  if (type !== "train" && type !== "test" && type !== "pre") return cr;
  if (!units[unitIndex].conditionals) return cr;

  const annotation: Annotation[] = units[unitIndex].annotation;
  const status: Status = units[unitIndex].status;

  let damage = 0;

  // Default actions are determined by unit type
  let defaultSuccessAction: ConditionalAction = null;
  let defaultFailAction: ConditionalAction = null;
  let defaultMessage = null;
  let defaultDamage = 0;
  if (type === "train") {
    defaultSuccessAction = "applaud";
    defaultFailAction = "retry";
    defaultMessage =
      "### Please retry.\n\nThis is a **training** unit, and the answer you gave was incorrect. \nPlease have another look, and select a different answer";
  }
  if (type === "pre") {
    defaultFailAction = "block";
    defaultMessage =
      "### Thank you for participating.\n\nBased on your answer for this question we determined that you do not meet the qualifications for this coding job.\nWe sincerely thank you for your time.";
  }
  if (type === "test") {
    defaultDamage = 10;
  }

  for (let conditional of units[unitIndex].conditionals) {
    // only check conditions for variables that have been coded
    // (if unit is done, all variables are assumed to have been coded)
    if (!cr.evaluation[conditional.variable])
      cr.evaluation[conditional.variable] = {
        action: conditional.onSuccess || defaultSuccessAction,
        message: conditional.message || defaultMessage,
      };
    let variableCoded = status === "DONE";
    let success = true;
    let submessages: string[] = [];

    // Next to whether all conditions are met, we need to check whether all annotations
    // match a condition. We only do this for variables for which conditions have been specified
    let validAnnotation: { [annotationI: number]: boolean } = {};

    conditionloop: for (let c of conditional.conditions) {
      for (let i = 0; i < annotation.length; i++) {
        const a = annotation[i];
        if (conditional.variable !== a.variable) continue;
        if (!validAnnotation[i]) validAnnotation[i] = false;
        variableCoded = true;
        if (c.field != null && c.field !== a.field) continue;
        if (c.offset != null && c.offset !== a.offset) continue;
        if (c.length != null && c.length !== a.length) continue;

        const op = c.operator || "==";

        let hasMatch = false;
        if (op === "==" && a.value === c.value) hasMatch = true;
        if (op === "<=" && a.value <= c.value) hasMatch = true;
        if (op === "<" && a.value < c.value) hasMatch = true;
        if (op === ">=" && a.value >= c.value) hasMatch = true;
        if (op === ">" && a.value > c.value) hasMatch = true;
        if (op === "!=" && a.value !== c.value) hasMatch = true;
        if (hasMatch) {
          validAnnotation[i] = true;
          continue conditionloop;
        }
      }
      if (!variableCoded) continue;

      // arriving here indicates that condition failed
      success = false;
      damage += c.damage ?? 0;
      if (c.submessage) submessages.push(c.submessage);
    }

    // This means that there were annotations that did not match a condition
    const validAnnotationI = Object.keys(validAnnotation).filter(
      (i: string) => validAnnotation[Number(i)]
    );
    const invalidAnnotationI = Object.keys(validAnnotation).filter(
      (i: string) => !validAnnotation[Number(i)]
    );
    if (invalidAnnotationI.length > 0) success = false;

    if (success) {
      cr.evaluation[conditional.variable].action = conditional.onSuccess || defaultSuccessAction;
    } else {
      cr.evaluation[conditional.variable].action = conditional.onFail || defaultFailAction;
      cr.evaluation[conditional.variable].message = conditional.message || defaultMessage;
      cr.evaluation[conditional.variable].submessages = submessages;

      // add correct and incorrect annotations
      cr.evaluation[conditional.variable].correct = validAnnotationI.map(
        (i: string) => annotation[Number(i)]
      );
      cr.evaluation[conditional.variable].incorrect = invalidAnnotationI.map(
        (i: string) => annotation[Number(i)]
      );

      damage += conditional.damage ?? defaultDamage;
    }
  }
  if (damage) {
    cr.damage.damage = damage;
    alert(`This answer gave you ${damage} damage!\n(coders normally don't see this message)`);
  }

  return cr;
}

export default JobServerDemo;
