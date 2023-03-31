import { DataPoint, DataQuery } from "./GridListTypes";

export function sortData(data: DataPoint[], query: DataQuery) {
  if (!query.sort || query.sort.length === 0) return;

  function compare(a: any, b: any) {
    if (!a && !b) return 0;
    if (!a) return -1;
    if (!b) return 1;
    if (typeof a === "string") return a.localeCompare(b);
    return a - b;
  }

  data.sort((aData: DataPoint, bData: DataPoint) => {
    for (let sort of query.sort) {
      const a: any = aData[sort.variable];
      const b: any = bData[sort.variable];
      let diff = compare(a, b);
      if (diff !== 0) return sort.order === "asc" ? diff : -diff;
    }
    return 0;
  });
}
