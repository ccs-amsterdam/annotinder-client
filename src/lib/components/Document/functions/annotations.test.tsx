// import { getDoc, getAnnotations } from "./prepareDocumentContent";
// import { exportSpanAnnotations, importSpanAnnotations, toggleSpanAnnotation } from "./annotations";
// import { Annotation, Unit } from "../../../types";

// const unit: Unit = {
//   unitId: "test",
//   annotations: [],
//   status: "IN_PROGRESS",
//   text_fields: [
//     {
//       name: "text",
//       label: "text",
//       value:
//         "All these investments, in innovation, education, and infrastructure, will make America a better place to do business and create jobs. But to help our companies compete, we also have to knock down barriers that stand in the way of their success.",
//     },
//   ],
// };

// const spanAnnotations = [
//   {
//     field: "text",
//     variable: "testvar",
//     value: "match",
//     offset: 0,
//     length: 9,
//   },
//   {
//     field: "text",
//     variable: "testvar",
//     value: "partial match",
//     offset: 10,
//     length: 1,
//   },
// ];

// test("importing annotations", () => {
//   const doc = getDoc(unit);
//   const [annotations] = getAnnotations(doc, spanAnnotations);

//   // test if offset based annotations are correctly linked to token indices
//   const ann1 = annotations["0"]["testvar|match"];
//   const ann2 = annotations["2"]["testvar|partial match"];
//   const tokens1 = doc.tokens.slice(ann1.span[0], ann1.span[1] + 1);
//   const tokens2 = doc.tokens.slice(ann2.span[0], ann2.span[1] + 1);

//   expect(tokens1[0].text).toBe("All"); // ann1 matches first 2 tokens
//   expect(tokens1[1].text).toBe("these");
//   expect(tokens2[0].text).toBe("investments"); // ann2 matches full token (though actually only matches part of the word)
// });

// test("toggling annotations", () => {
//   const doc = getDoc(unit);
//   const [annotations] = getAnnotations(doc, spanAnnotations);
//   const addAnnotation: Annotation = {
//     index: 0,
//     variable: "testvar",
//     span: [4, 4],
//     length: 2,
//     value: "added",
//     field: "text",
//     offset: 24,
//   };

//   let newAnnotations = toggleSpanAnnotation(annotations, addAnnotation, false, false);
//   expect(Object.keys(newAnnotations).length).toBe(4); // one additional word (the 4th) annotated

//   const overwriteAnnotation: Annotation = {
//     index: 0,
//     variable: "testvar",
//     span: [0, 0],
//     length: 3,
//     value: "match",
//     field: "text",
//     offset: 0,
//   };

//   newAnnotations = toggleSpanAnnotation(newAnnotations, overwriteAnnotation, false, false);

//   // this overwrites the first annotation, which covered 2 tokens (offset 0, length 9)
//   // the new annotations covers 1 token, so we should have one annotated token less
//   expect(Object.keys(newAnnotations).length).toBe(3);
// });

// test("exporting annotations", () => {
//   const doc = getDoc(unit);
//   const [annotations] = getAnnotations(doc, spanAnnotations);

//   const expAnnotations = exportSpanAnnotations(annotations, doc.tokens);

//   // the first annotation should match exactly
//   expect(expAnnotations[0]).toEqual(spanAnnotations[0]);

//   // the second annotation will have a different length, because it was a partial match
//   expect(expAnnotations[1]).not.toEqual(spanAnnotations[1]);
//   expAnnotations[1].length = 1; // lets pretend it didn't change
//   expect(expAnnotations[1]).toEqual(spanAnnotations[1]);
// });
