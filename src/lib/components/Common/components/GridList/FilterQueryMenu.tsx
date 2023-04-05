import { SetState } from "../../../../types";
import { TbFilter } from "react-icons/tb";
import { FilterQuery, DataQuery, FilterQueryOption, SelectOption } from "./GridListTypes";
import { QueryDiv } from "./GridListStyled";
import { useEffect, useState, useRef, useCallback } from "react";

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

  return (
    <QueryDiv open={open} active={query.filter && query.filter.length > 0}>
      <button
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
            return (
              <div key={option.variable + option.type} className="QueryField">
                <FilterField option={option} setQuery={setQuery} />
              </div>
            );
          })}
        </div>
      </div>
    </QueryDiv>
  );
};

const FilterField = (props: { option: FilterQueryOption; setQuery: SetState<DataQuery> }) => {
  const { option, setQuery } = props;
  const { type, variable, label, selectOptions } = option;

  const onFilter = useCallback(
    (values: any, onlyDelete: boolean = false) => {
      setQuery((query) => {
        const newFilter: FilterQuery[] = (query.filter || []).filter(
          (filter) => filter.variable !== variable && filter.type !== type
        );
        if (!onlyDelete) newFilter.push({ type, variable, label, ...values });
        return { ...query, filter: newFilter };
      });
    },
    [label, setQuery, type, variable]
  );

  if (type === "search") return <SearchFilterField label={label} onFilter={onFilter} />;
  if (type === "select")
    return (
      <SelectFilterField
        label={label}
        options={selectOptions}
        defaultSelect={option.defaultSelect}
        onFilter={onFilter}
      />
    );
  return null;
};

const SearchFilterField = (props: {
  label: string;
  onFilter: (values: any, onlyDelete: boolean) => void;
}) => {
  const [search, setSearch] = useState("");
  const { label, onFilter } = props;

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilter({ search }, !search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, onFilter]);

  return (
    <div className="FilterField">
      <label>{label}</label>
      <input className="SearchField" value={search} onChange={(e) => setSearch(e.target.value)} />
    </div>
  );
};

const SelectFilterField = (props: {
  label: string;
  options: SelectOption[];
  defaultSelect: (string | number | boolean | Date)[];
  onFilter: (values: any, onlyDelete: boolean) => void;
}) => {
  const { label, options, defaultSelect, onFilter } = props;
  const [select, setSelect] = useState<(string | number | boolean | Date)[]>(defaultSelect || []);

  function selectOption(value: string | number | boolean | Date, selected: boolean) {
    const newSelect = selected ? select.filter((v) => v !== value) : [...select, value];
    setSelect(newSelect);
    onFilter({ select: newSelect }, !newSelect.length);
  }

  return (
    <div className="FilterField">
      <label>{label}</label>
      <div className={`SelectField ${!select?.length ? "Disabled" : ""}`}>
        {options.map((option, i) => {
          const { value, label } = option;
          const selected = select.includes(value);
          return (
            <div
              key={String(value) + i}
              className={`SelectOption ${selected ? "Selected" : ""}`}
              onClick={() => selectOption(value, selected)}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FilterQueryMenu;
