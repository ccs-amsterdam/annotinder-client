import { BackendUnit, ConditionReport, Annotation, Status, ConditionalAction } from "../types";

/**
 * If unit.conditionals exists, check whether an annotation satistfies the conditions.
 *
 * Note that for applications in which the conditionals should be secret (i.e. test unit)
 * this local version should (ideally) not be used, because it requires the conditionals
 * to be included in the unit, which users will be able to see (if they know how to).
 *
 * When using the python backend, the conditionals are checked server-side. The main reason
 * for including this client-side version is for demoing and testing with the R backend.
 */
export default function checkConditions(unit: BackendUnit): ConditionReport {
  const type = unit.type;
  const cr: ConditionReport = { evaluation: {}, damage: {} };

  if (type !== "train" && type !== "test" && type !== "pre") return cr;
  if (!unit.conditionals) return cr;

  const annotation: Annotation[] = unit.annotation;
  const status: Status = unit.status;

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

  for (let conditional of unit.conditionals) {
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
    alert(
      `This answer gave you ${damage} damage!\n\nCoders won't see this message if the job is hosted on an AnnoTinder (Python) server.`
    );
  }

  return cr;
}
