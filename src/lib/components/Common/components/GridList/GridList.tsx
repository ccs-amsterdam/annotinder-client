import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { CenteredDiv } from "../../../../styled/Styled";
import SortQueryMenu from "./SortQueryMenu";
import FilterQueryMenu from "./FilterQueryMenu";
import {
  DataQuery,
  DataPoint,
  DataPointWithRef,
  SortQueryOption,
  FilterQueryOption,
  GridListData,
  GridItemTemplate,
  DataMeta,
  SelectedDataPoint,
} from "./GridListTypes";
import { GridListDiv } from "./GridListStyled";
import { ReactElement } from "react-markdown/lib/react-markdown";
import { queryFullData } from "./GridListFunctions";

interface GridListProps {
  fullData?: DataPoint[];
  /** Instead of providing fullData, you can also provide a function to generate page data given a DataQuery.
   * This makes sense if the data is coming from an API.
   * Note that this function should not change!! so use useCallback if created inside the component.
   */
  loadData?: (query: DataQuery) => Promise<GridListData>;
  template: GridItemTemplate[];
  sortOptions?: SortQueryOption[];
  filterOptions?: FilterQueryOption[];
  searchOptions?: string[];
  onClick?: (data: DataPoint) => void;
  setDetail?: (data: DataPoint) => Promise<ReactElement>;
  pageSize?: number;
}

const GridList = ({
  fullData,
  loadData,
  template,
  sortOptions,
  filterOptions,
  onClick,
  setDetail,
  pageSize = 10,
}: GridListProps) => {
  let [data, setData] = useState<DataPointWithRef[]>();
  const [meta, setMeta] = useState<DataMeta>();
  const gridRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<SelectedDataPoint>();
  const [query, setQuery] = useState<DataQuery>({
    n: pageSize,
    offset: 0,
    sort: [],
    filter: [],
  });

  const singlePage = meta && meta.total <= pageSize;

  function changePage(direction: "up" | "down") {
    if (!data) {
      setQuery({ n: pageSize, offset: 0 });
      return;
    }
    if (direction === "down" && data.length < pageSize) return;
    //setTransition(direction);
    setQuery((query) => {
      let offset = meta?.offset || 0;
      const total = meta?.total || 0;
      if (direction === "down") Math.min((offset += pageSize), total);
      if (direction === "up") Math.max((offset -= pageSize), 0);
      offset = Math.max(0, offset);
      return { ...query, offset, direction };
    });
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (detailRef.current?.contains(e.target as Node)) return;
      e.stopPropagation();
      e.preventDefault();
      setSelected(undefined);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [detailRef]);

  useEffect(() => {
    const gridEl = gridRef.current;
    if (!gridEl) return;
    gridEl.classList.remove("upOut", "downOut", "upIn", "downIn");
    gridEl.classList.add(`${query.direction || ""}Out`);

    const loadDataFunction = fullData
      ? async (query: DataQuery) => queryFullData(fullData, query)
      : loadData;

    const now = Date.now();
    loadDataFunction(query)
      .then(({ data, meta }) => {
        const dataWithRef: DataPointWithRef[] = [];
        for (let i = 0; i < pageSize; i++) {
          dataWithRef.push({ datapoint: data?.[i], ref: React.createRef<HTMLDivElement>() });
        }
        const delay = Math.max(0, 100 - (Date.now() - now));
        setTimeout(() => {
          setData(dataWithRef);
          setMeta(meta);
          gridEl.classList.remove("upOut", "downOut", "upIn", "downIn");
          gridEl.classList.add(`${query.direction || ""}In`);
        }, delay);
      })
      .catch(() => {
        gridEl.classList.remove("upOut", "downOut", "upIn", "downIn");
        gridEl.classList.add(`${query.direction || ""}In`);
      });
  }, [fullData, query, gridRef, pageSize, loadData]);

  const canGoUp = meta && meta.offset > 0;
  const canGoDown = meta && query.offset + pageSize < meta.total;

  const page = query.offset / pageSize + 1;
  const pages = Math.ceil(meta?.total / pageSize) || 1;

  if (!data) data = new Array(pageSize).fill({ datapoint: undefined, ref: React.createRef() });

  return (
    <CenteredDiv>
      <GridListDiv ref={gridRef}>
        <div className="QueryFields">
          {filterOptions && (
            <FilterQueryMenu query={query} setQuery={setQuery} filterOptions={filterOptions} />
          )}
          {sortOptions && (
            <SortQueryMenu query={query} setQuery={setQuery} sortOptions={sortOptions} />
          )}
          {!singlePage && <div className="Results">{page + " / " + pages}</div>}
        </div>
        <div className={`GridItems ${singlePage ? "SinglePage" : ""}`}>
          {
            <div
              key="labels up"
              className={`GridItem Labels ${canGoUp && "PageChange"}`}
              onClick={() => canGoUp && changePage("up")}
            >
              {canGoUp ? (
                <CenteredDiv>
                  <FaChevronUp size="5rem" />
                </CenteredDiv>
              ) : (
                template.map((item: GridItemTemplate, i) => (
                  <Value key={item.label + "_" + i} style={item.style}>
                    {item.label}
                  </Value>
                ))
              )}
            </div>
          }
          {data.map(({ datapoint, ref }, i) => {
            return (
              <div
                key={datapoint?.id ?? `missing_${i}`}
                ref={ref}
                className={`Up GridItem Values  ${!datapoint ? "Disabled" : ""} ${
                  selected && selected.datapoint.id === datapoint?.id ? "Selected" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!datapoint) return;
                  if (setDetail) {
                    setDetail(datapoint)
                      .then((detailElement) => {
                        setSelected({ datapoint, ref, detailElement });
                      })
                      .catch(console.error);
                  } else {
                    setSelected({ datapoint, ref });
                  }
                  onClick && onClick(datapoint);
                }}
              >
                {template.map((item: GridItemTemplate, j) => {
                  if (!datapoint)
                    return <Value style={item.style} key={`missing_${i}_${j}`}></Value>;
                  return (
                    <ItemValue
                      key={datapoint.id + "+" + item.value}
                      datapoint={datapoint}
                      item={item}
                    />
                  );
                })}
              </div>
            );
          })}

          <div
            key="labels down"
            className={`GridItem Labels PageChange ${!canGoDown && "Disabled"}`}
            onClick={() => changePage("down")}
          >
            <CenteredDiv>{canGoDown && <FaChevronDown size="5rem" />}</CenteredDiv>
          </div>
        </div>
        <div className={`DetailContainer ${selected?.detailElement ? "Open" : ""}`}>
          <div ref={detailRef} className={`Detail `}>
            {selected?.detailElement}
          </div>
        </div>
      </GridListDiv>
    </CenteredDiv>
  );
};

const Value = styled.div<{ wrap?: boolean }>`
  width: 100%;
  min-height: 2.1rem;
  padding-right: 0.1rem;
  ${(p) => {
    if (!p.wrap)
      return `
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
  }}
`;

const ItemValue = (props: { datapoint: DataPoint; item: GridItemTemplate }) => {
  const { datapoint, item } = props;

  function getValue() {
    if (typeof item.value === "string") {
      let value = datapoint[item.value];
      if (value == null) value = "";
      if (typeof (value as Date).getMonth === "function") value = dateValue(value as Date);
      return String(value);
    } else if (typeof item.value === "function") {
      return item.value(datapoint);
    }
    return null;
  }

  const value = getValue();

  return (
    <Value style={item.style} title={typeof value === "string" ? String(value) : undefined}>
      {item?.prefix}
      {value}
      {item?.suffix}
    </Value>
  );
};

const dateValue = (value: Date) => {
  const minutes_ago = Math.floor((new Date().getTime() - value.getTime()) / (1000 * 60));
  if (minutes_ago < 1) return "just now";
  if (minutes_ago < 60) return `${minutes_ago} minutes ago`;
  if (minutes_ago < 60 * 24) return `${Math.floor(minutes_ago / 60)} hours ago`;
  if (minutes_ago < 60 * 24 * 7) return `${Math.floor(minutes_ago / (60 * 24))} days ago`;
  return value.toISOString().split("T")[0];
};

export default GridList;
