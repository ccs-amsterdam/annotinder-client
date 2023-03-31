import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { SetState } from "../../../../types";
import { TbArrowsSort } from "react-icons/tb";
import { SortQuery, DataQuery, SortQueryOption } from "./GridListTypes";
import { QueryDiv } from "./GridListStyled";
import { useEffect, useState, useRef } from "react";

interface SortQueryProps {
  query: DataQuery;
  setQuery: SetState<DataQuery>;
  sortOptions: SortQueryOption[];
}

const SortQueryMenu = ({ query, setQuery, sortOptions }: SortQueryProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const newSort: SortQuery[] = [];
    for (let option of sortOptions) {
      if (option.default) {
        const { variable, label, default: order } = option;
        newSort.push({ variable, label, order });
      }
    }
    setQuery((query) => ({ ...query, sort: newSort }));
  }, [setQuery, sortOptions]);

  useEffect(() => {
    function closeOnPageClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        e.stopPropagation();
        setOpen(false);
      }
    }
    document.addEventListener("click", closeOnPageClick);
    return () => document.removeEventListener("click", closeOnPageClick);
  }, [dropdownRef]);

  return (
    <QueryDiv open={open} active={query.sort && query.sort.length > 0}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        <TbArrowsSort />
      </button>
      <div className="Dropdown" ref={dropdownRef}>
        <div>
          {query.sort?.map((sort) => {
            return (
              <SortField
                key={sort.variable}
                setQuery={setQuery}
                variable={sort.variable}
                label={sort.label}
                currentOrder={sort.order}
              />
            );
          })}
          {query.sort?.length > 0 && <div className="Divider" />}
          {sortOptions?.map((option) => {
            const currentOrder = query.sort?.find((s) => s.variable === option.variable)?.order;
            if (currentOrder) return null;
            return (
              <SortField
                key={option.variable}
                setQuery={setQuery}
                variable={option.variable}
                label={option.label}
                currentOrder={currentOrder}
              />
            );
          })}
        </div>
      </div>
    </QueryDiv>
  );
};

const SortField = (props: {
  setQuery: SetState<DataQuery>;
  variable: string;
  label: string;
  currentOrder?: "asc" | "desc";
}) => {
  const { variable, label, setQuery, currentOrder } = props;

  function onSort(order: "asc" | "desc") {
    const deleteSort = order === currentOrder;

    setQuery((query) => {
      const newSort: SortQuery[] = [];
      let currentExists = false;
      for (let sort of query.sort || []) {
        if (sort.variable === variable) {
          currentExists = true;
          if (!deleteSort) newSort.push({ variable, order, label });
        } else {
          newSort.push(sort);
        }
      }
      if (!currentExists) newSort.push({ variable, order, label });
      return { ...query, sort: newSort };
    });
  }

  const showUp = currentOrder === "asc";
  const showDown = currentOrder === "desc";

  return (
    <div className="QueryField">
      <FaChevronUp
        className={!showUp && "NotSelected"}
        onClick={(e) => {
          e.stopPropagation();
          onSort("asc");
        }}
      />

      <FaChevronDown
        className={!showDown && "NotSelected"}
        onClick={(e) => {
          e.stopPropagation();
          onSort("desc");
        }}
      />

      <span>{label}</span>
    </div>
  );
};

export default SortQueryMenu;
