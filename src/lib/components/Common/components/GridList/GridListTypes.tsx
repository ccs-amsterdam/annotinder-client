import { ReactElement, RefObject } from "react";

export type DataPointValue = string | number | Date | undefined;

export interface DataPoint {
  id: string;
  [key: string]: DataPointValue;
}

export interface SortQuery {
  variable: string;
  label: string;
  order: "asc" | "desc";
}

export interface SortQueryOption {
  variable: string;
  label: string;
  default?: "asc" | "desc";
}

export interface DataPointWithRef {
  ref: RefObject<HTMLDivElement>;
  datapoint: DataPoint;
}

export interface SelectedDataPoint {
  ref: RefObject<HTMLDivElement>;
  datapoint: DataPoint;
  detailElement?: ReactElement;
}

export interface DataMeta {
  offset: number;
  total: number;
}

export interface GridListData {
  data: DataPoint[];
  meta: DataMeta;
}

export interface FilterQuery {
  variable: string;
  label: string;
  type: "search" | "select";
  from?: string | number | Date;
  to?: string | number | Date;
  select?: (string | number | boolean | Date)[];
  search?: string;
}

export interface FilterQueryOption {
  variable: string;
  label: string;
  type: "search" | "select";
  selectOptions?: SelectOption[];
  defaultSelect?: (string | boolean | number | Date)[];
  defaultFrom?: number | Date;
  defaultTo?: number | Date;
}

export interface SelectOption {
  label: string | ReactElement;
  value: string | boolean | number;
}

export interface DataQuery {
  n: number;
  offset: number;
  sort?: SortQuery[];
  filter?: FilterQuery[];
  direction?: "up" | "down";
}

export interface GridItemTemplate {
  label?: string;
  style?: React.CSSProperties;
  value?: string | createValue;
  prefix?: string;
  suffix?: string;
}

export type createValue = (datapoint: DataPoint) => string | number | ReactElement;
