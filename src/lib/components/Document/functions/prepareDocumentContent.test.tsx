// import { Unit } from "../../../types";
// import { getAnnotations, getDoc } from "./prepareDocumentContent";

// const unit: Unit = {
//   unitId: "test",
//   status: "IN_PROGRESS",
//   text_fields: [
//     {
//       name: "title",
//       value: "Barack Obama",
//       paragraphs: true,
//     },
//     {
//       name: "text",
//       value:
//         "All these investments, in innovation, education, and infrastructure, will make America a better place to do business and create jobs. But to help our companies compete, we also have to knock down barriers that stand in the way of their success.",
//       paragraphs: true,
//     },
//   ],
//   meta_fields: [
//     { name: "date", label: "date", value: "2011-01-25" },
//     { name: "paragraph", label: "paragraph", value: 89 },
//   ],
//   annotations: [
//     {
//       field: "text",
//       variable: "testvar",
//       value: "match",
//       offset: 0,
//       length: 9,
//     },
//     {
//       field: "text",
//       variable: "testvar",
//       value: "partial match",
//       offset: 10,
//       length: 1,
//     },
//   ],
// };

// test("create document", () => {
//   const doc = getDoc(unit);
//   const [annotations] = getAnnotations(doc, unit.annotations);

//   // should be 43 tokens
//   expect(doc.tokens.length).toBe(43);

//   // test if offset based annotations are correctly linked to token indices
//   const ann1 = annotations["2"]["testvar|match"];
//   const ann2 = annotations["4"]["testvar|partial match"];
//   const tokens1 = doc.tokens.slice(ann1.span[0], ann1.span[1] + 1);
//   const tokens2 = doc.tokens.slice(ann2.span[0], ann2.span[1] + 1);

//   expect(tokens1[0].text).toBe("All"); // ann1 matches first 2 tokens
//   expect(tokens1[1].text).toBe("these");
//   expect(tokens2[0].text).toBe("investments"); // ann2 matches full token (though actually only matches part of the word)
// });
