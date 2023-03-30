import { SetState } from "../../../types";
import { TbFilter } from "react-icons/tb";
import { FilterQuery, DataQuery, FilterQueryOption } from "./GridListTypes";
import { QueryDiv } from "./GridListStyled";
import { useEffect, useState, useRef } from "react";

interface FilterQueryProps {
  query: DataQuery;
  setQuery: SetState<DataQuery>;
  filterOptions: FilterQueryOption[];
}

const FilterQueryMenu = ({ query, setQuery, filterOptions }: FilterQueryProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const newFilter: FilterQuery[] = [];
    for (let option of filterOptions) {
      if (option.defaultSelect || option.defaultFrom || option.defaultTo) {
        const {
          type,
          variable,
          label,
          defaultFrom: from,
          defaultTo: to,
          defaultSelect: select,
        } = option;
        newFilter.push({ type, variable, label, from, to, select });
      }
    }
    setQuery((query) => ({ ...query, filter: newFilter }));
  }, [setQuery, filterOptions]);

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

  const allSelected = query.filter?.length === filterOptions.length;
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
        <TbFilter />
      </button>
      <div className="Dropdown" ref={dropdownRef}>
        <div>
          {filterOptions?.map((option) => {
            const selected = query.filter?.find((s) => s.variable === option.variable);
            if (selected) return null;
            return (
              <FilterField
                type={option.type}
                key={option.variable}
                setQuery={setQuery}
                variable={option.variable}
                label={option.label}
              />
            );
          })}
        </div>
      </div>
      <div className="QuerySelection">
        {(query.filter || []).map((filter) => {
          return null;
          // return (
          //   <FilterField
          //     key={filter.variable}
          //     setQuery={setQuery}
          //     variable={filter.variable}
          //     label={filter.label}
          //     currentOrder={filter.order}
          //   />
          // );
        })}
      </div>
    </QueryDiv>
  );
};

const FilterField = (props: {
  setQuery: SetState<DataQuery>;
  type: string;
  variable: string;
  label: string;
  currentOrder?: string;
  canDelete?: boolean;
}) => {
  const { type, variable, label, setQuery } = props;

  function onFilter(values: any, onlyDelete: boolean = false) {
    setQuery((query) => {
      const newFilter: FilterQuery[] = (query.filter || []).filter(
        (filter) => filter.variable !== variable && filter.type !== type
      );
      if (!onlyDelete) newFilter.push({ type, variable, label, ...values });
      return { ...query, filter: newFilter };
    });
  }

  if (type === "search") return <SearchFilterField onFilter={onFilter} />;

  return null;
};

const SearchFilterField = (props: { onFilter: (values: any) => void }) => {
  const [value, setValue] = useState("");

  return <input type="text" value={value} onChange={(e) => setValue(e.target.value)} />;
};

export default FilterQueryMenu;
