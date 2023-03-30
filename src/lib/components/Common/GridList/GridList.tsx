import React, { useMemo, useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { CenteredDiv } from "../../../styled/Styled";
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
} from "./GridListTypes";
import { GridListDiv } from "./GridListStyled";

interface GridListProps {
  loadData?: (query: DataQuery) => GridListData;
  template: GridItemTemplate[];
  sortOptions?: SortQueryOption[];
  filterOptions?: FilterQueryOption[];
  searchOptions?: string[];
  onClick?: (data: DataPoint) => void;
  pageSize?: number;
}

const GridList = ({
  loadData,
  template,
  sortOptions,
  filterOptions,
  onClick,
  pageSize = 7,
}: GridListProps) => {
  const [data, setData] = useState<GridListData>();
  const [transition, setTransition] = useState<"up" | "down">();
  const upRef = useRef<HTMLDivElement>(null);
  const downRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState<DataQuery>({ n: pageSize, offset: 0 });

  const pageData = useMemo(() => {
    const pageData: DataPointWithRef[] = [];
    for (let i = 0; i < pageSize; i++) {
      pageData.push({ datapoint: data?.data?.[i], ref: React.createRef<HTMLDivElement>() });
    }
    return pageData;
  }, [data, pageSize]);

  function changePage(direction: "up" | "down") {
    if (!data) {
      setQuery({ n: pageSize, offset: 0 });
      return;
    }
    if (direction === "down" && data.data.length < pageSize) return;
    setTransition(direction);
    setQuery((query) => {
      let offset = data?.meta?.offset || 0;
      const total = data?.meta?.total || 0;
      if (direction === "down") Math.min((offset += pageSize), total);
      if (direction === "up") Math.max((offset -= pageSize), 0);
      offset = Math.max(0, offset);
      return { ...query, offset };
    });
  }

  useEffect(() => {
    setData(loadData(query));
  }, [query, loadData]);

  useEffect(() => {
    let selected = -1;
    function castShadow(e?: MouseEvent) {
      if (e) {
        let clickOutside = true;
        for (let i = 0; i < pageData.length; i++) {
          if (pageData?.[i]?.ref?.current?.contains(e.target as Node)) {
            selected = i;
            clickOutside = false;
          }
        }
        if (clickOutside) selected = -1;
      }
      const light = selected >= 0 ? pageData[selected].ref.current : upRef.current;
      if (!light) return;
      const lightFrom = light.getBoundingClientRect();

      for (let i = 0; i < pageData.length; i++) {
        const ref = pageData[i].ref;
        if (i === selected) {
          ref.current.style.background = "var(--secondary)";
          ref.current.style.color = "var(--primary-dark)";
          ref.current.style.boxShadow = "";
          continue;
        }
        ref.current.style.background = "";
        ref.current.style.color = "";
        if (!ref.current) return;
        const lightTo = ref.current.getBoundingClientRect();

        let x = lightTo.left + lightTo.width * 0.5 - (lightFrom.left + lightFrom.width * 0.5);
        let y = lightTo.top + lightTo.height * 0.5 - (lightFrom.top + lightFrom.height * 0.5);
        let h = Math.sqrt(x * x + y * y);
        x = x / h;
        y = y / h;
        ref.current.style.boxShadow = `${x * 4}px ${y * 4}px 0.8rem var(--${
          selected >= 0 ? "secondary-dark" : "primary"
        })`;
      }
    }
    castShadow();

    document.addEventListener("mousedown", castShadow);
    return () => document.removeEventListener("mousedown", castShadow);
  }, [pageData, upRef]);

  const canGoUp = data && data.meta.offset > 0;
  const canGoDown = data && query.offset + pageSize < data.meta.total;

  return (
    <CenteredDiv>
      <GridListDiv transition={transition}>
        <div className="QueryFields">
          {sortOptions && (
            <SortQueryMenu query={query} setQuery={setQuery} sortOptions={sortOptions} />
          )}
          {filterOptions && (
            <FilterQueryMenu query={query} setQuery={setQuery} filterOptions={filterOptions} />
          )}
        </div>
        <div className="GridItems">
          {
            <div
              key="labels up"
              ref={upRef}
              className={`GridItem Labels ${canGoUp && "PageChange"}`}
              onClick={() => changePage("up")}
            >
              {canGoUp ? (
                <CenteredDiv>
                  <FaChevronUp size="5rem" />
                </CenteredDiv>
              ) : (
                template.map((item: GridItemTemplate, i) => (
                  <Value key={item.label + "_" + i} {...item}>
                    {item.label}
                  </Value>
                ))
              )}
            </div>
          }
          {pageData.map(({ datapoint, ref }, i) => {
            return (
              <div
                key={datapoint?.id ?? `missing_${i}`}
                ref={ref}
                className={`GridItem Values ${!datapoint && "Disabled"}`}
                onClick={() => datapoint && onClick && onClick(datapoint)}
              >
                {template.map((item: GridItemTemplate, j) => {
                  if (!datapoint) return <Value key={`missing_${i}_${j}`}></Value>;
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
            ref={downRef}
            className={`GridItem Labels PageChange ${!canGoDown && "Disabled"}`}
            onClick={() => changePage("down")}
          >
            <CenteredDiv>
              <FaChevronDown size="5rem" />
            </CenteredDiv>
          </div>
        </div>
      </GridListDiv>
    </CenteredDiv>
  );
};

const Value = styled.div`
  width: 100%;
  min-height: 2.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  return (
    <Value style={item.style}>
      {item?.prefix}
      {getValue()}
      {item?.suffix}
    </Value>
  );
};

const dateValue = (value: Date) => {
  const minutes_ago = Math.floor((new Date().getTime() - value.getTime()) / (1000 * 60));
  if (minutes_ago < 1) return "just now";
  if (minutes_ago < 60) return `${minutes_ago} minutes ago`;
  if (minutes_ago < 60 * 24) return `${Math.floor(minutes_ago / 60)} hours ago`;
  if (minutes_ago < 60 * 24 * 30) return `${Math.floor(minutes_ago / (60 * 24))} days ago`;
  return value.toISOString().split("T")[0];
};

export default GridList;
