import { DataPoint, DataQuery } from "./GridListTypes";

export function queryFullData(fullData: DataPoint[], query: DataQuery) {
  let data = fullData.filter((v) => {
    for (let filter of query.filter) {
      if (filter.type === "search") {
        const str: string = v[filter.variable] as string;
        if (typeof str !== "string") continue;
        if (!str.toLowerCase().includes(filter.search.toLowerCase())) return false;
      }
      if (filter.type === "select") {
        if (!filter.select.includes(v[filter.variable])) return false;
      }
    }

    return true;
  });

  sortData(data, query);
  const meta = { offset: query.offset, total: data.length };
  data = data.slice(query.offset, query.offset + query.n);
  return { data, meta };
}

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
