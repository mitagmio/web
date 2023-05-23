export interface ColumnProps<T> {
  [id: string]: T;
}

export type ColumnsType<T> = ColumnProps<T>;
