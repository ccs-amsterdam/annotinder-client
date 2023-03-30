import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { SetState } from "../../../types";
import { TbArrowsSort } from "react-icons/tb";
import { MdCancel } from "react-icons/md";
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

  const allSelected = query.sort?.length === sortOptions.length;
  if (allSelected && open) setOpen(false);

  return (
    <QueryDiv open={open}>
      <button
        disabled={allSelected}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        <TbArrowsSort />
      </button>
      <div className="Dropdown" ref={dropdownRef}>
        <div>
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
                canDelete={true}
              />
            );
          })}
        </div>
      </div>
      <div className="QuerySelection">
        {(query.sort || []).map((sort) => {
          return (
            <SortField
              key={sort.variable}
              setQuery={setQuery}
              variable={sort.variable}
              label={sort.label}
              currentOrder={sort.order}
              canDelete={true}
            />
          );
        })}
      </div>
    </QueryDiv>
  );
};

const SortField = (props: {
  setQuery: SetState<DataQuery>;
  variable: string;
  label: string;
  currentOrder?: string;
  canDelete?: boolean;
}) => {
  const { variable, label, setQuery, currentOrder, canDelete } = props;

  function onSort(order: "asc" | "desc", onlyDelete?: boolean) {
    let newOrder = order;
    if (order === currentOrder) {
      if (order === "asc") newOrder = "desc";
      if (order === "desc") newOrder = "asc";
    }

    setQuery((query) => {
      const newSort: SortQuery[] = (query.sort || []).filter((sort) => sort.variable !== variable);
      if (!onlyDelete) newSort.push({ variable, order: newOrder, label });
      return { ...query, sort: newSort };
    });
  }

  const showUp = !currentOrder || currentOrder === "asc";
  const showDown = !currentOrder || currentOrder === "desc";

  return (
    <div className="QueryField">
      {showUp && (
        <FaChevronUp
          color="var(--primary)"
          onClick={(e) => {
            e.stopPropagation();
            onSort("asc");
          }}
        />
      )}
      {showDown && (
        <FaChevronDown
          color="var(--primary)"
          onClick={(e) => {
            e.stopPropagation();
            onSort("desc");
          }}
        />
      )}
      <span>{label}</span>
      {canDelete && currentOrder && (
        <MdCancel
          onClick={(e) => {
            e.stopPropagation();
            onSort("asc", true);
          }}
        />
      )}
    </div>
  );
};

export default SortQueryMenu;
