import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { ButtonComponentProps, Column, RowObj } from "../../../types";
import PaginationTable from "./PaginationTable";

const PAGESIZE = 10;
interface FullData {
  [key: string]: any;
}

interface FullDataTableProps {
  /** array with objects */
  fullData: FullData;
  /** // if table needs to update fulldata state */
  setFullData?: Dispatch<SetStateAction<FullData>>;
  /** array with objects specifying what data to show in the columns */
  columns?: Column[];
  /**  Optional. If given, clicking row calls the function with the row object as argument */
  onClick?: (rowobj: object) => void;
  /**Optional, Component or Array with Components that render buttons. Will be put in a buttongroup in first column.
               The component will be given the props "row" (the row object), "backend" (see backend property), and "setData" (for setFullData). */
  buttons?: React.FC<ButtonComponentProps> | React.FC<ButtonComponentProps>[];
  //* If buttons is used, backend can be passed along, so that it can be given to the button rendering component */
  backend?: any;
  //* isActive A function that takes a row as input, and returns a boolean for whether the row is displayed as active */
  isActive?: (rowObj: any) => boolean;
}

/**
 * PaginationTable wrapper for if the full data is already in memory
 */
export default function FullDataTable({
  fullData,
  setFullData,
  columns,
  onClick,
  buttons,
  backend,
  isActive,
}: FullDataTableProps) {
  const [data, setData] = useState<RowObj[]>([]);
  const [pages, setPages] = useState(1);
  const [filteredData, setFilteredData] = useState<FullData>([]);
  const [search, setSearch] = useState("");

  const pageChange = (activePage: number) => {
    const offset = (activePage - 1) * PAGESIZE;
    const newdata = filteredData.slice(offset, offset + PAGESIZE);
    setData(newdata);
  };

  useEffect(() => {
    if (!search) {
      setFilteredData(fullData);
      return;
    }
    const lsearch = search.toLowerCase();
    const fdata = fullData.filter((row: RowObj) => {
      for (let value of Object.values(row)) {
        if (typeof value === "object") continue;
        if (String(value).toLowerCase().includes(lsearch)) return true;
      }
      return false;
    });
    setFilteredData(fdata);
  }, [fullData, search]);

  useEffect(() => {
    if (!filteredData) {
      setData([]);
      return null;
    }
    const n = filteredData.length;
    setPages(Math.ceil(n / PAGESIZE));
    let newdata = [];
    if (n > 0) newdata = filteredData.slice(0, PAGESIZE);
    setData(newdata);
  }, [filteredData]);

  //if (!data) return;

  return (
    <PaginationTable
      data={data}
      setFullData={setFullData}
      pages={pages}
      columns={columns}
      pageChange={pageChange}
      onClick={onClick}
      buttons={buttons}
      backend={backend}
      isActive={isActive}
      setSearch={setSearch}
    />
  );
}
