import { ReactNode, useMemo, useState } from 'react';

import { Checkbox } from './Checkbox';

export interface Column<T> {
  key: string;
  title: ReactNode;
  render: (row: T) => ReactNode;
  /** Значение для сортировки. Если не задано — колонка не сортируется. */
  sortValue?: (row: T) => string | number;
  width?: number | string;
}

export interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyText?: string;
  /** Включает колонку с чекбоксами. */
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  isRowDisabled?: (row: T) => boolean;
  /** Подсветка строки с ошибкой валидации. */
  isRowInvalid?: (row: T) => boolean;
  toolbar?: ReactNode;
}

type SortState = { key: string; dir: 'asc' | 'desc' } | null;

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  loading = false,
  emptyText = 'Нет данных',
  selectedKeys,
  onSelectionChange,
  isRowDisabled,
  isRowInvalid,
  toolbar,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState>(null);
  const selectable = Boolean(selectedKeys && onSelectionChange);
  const selected = useMemo(() => new Set(selectedKeys ?? []), [selectedKeys]);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sortValue) return rows;

    const factor = sort.dir === 'asc' ? 1 : -1;

    return [...rows].sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
      return String(av).localeCompare(String(bv), 'ru') * factor;
    });
  }, [rows, columns, sort]);

  const selectableRows = rows.filter((row) => !isRowDisabled?.(row));
  const allSelected = selectableRows.length > 0 && selectableRows.every((row) => selected.has(rowKey(row)));
  const someSelected = selectableRows.some((row) => selected.has(rowKey(row)));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    const keys = selectableRows.map(rowKey);
    onSelectionChange(allSelected ? (selectedKeys ?? []).filter((key) => !keys.includes(key)) : Array.from(new Set([...(selectedKeys ?? []), ...keys])));
  };

  const toggleRow = (key: string) => {
    if (!onSelectionChange) return;
    onSelectionChange(selected.has(key) ? (selectedKeys ?? []).filter((k) => k !== key) : [...(selectedKeys ?? []), key]);
  };

  const toggleSort = (column: Column<T>) => {
    if (!column.sortValue) return;
    setSort((prev) => {
      if (prev?.key !== column.key) return { key: column.key, dir: 'asc' };
      if (prev.dir === 'asc') return { key: column.key, dir: 'desc' };
      return null;
    });
  };

  return (
    <div>
      {toolbar && <div className="table__toolbar">{toolbar}</div>}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              {selectable && (
                <th className="table__col-checkbox">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                    aria-label="Выбрать все"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={column.width ? { width: column.width } : undefined}
                  className={column.sortValue ? 'is-sortable' : ''}
                  onClick={() => toggleSort(column)}
                >
                  {column.title}
                  {sort?.key === column.key && (
                    <span className="table__sort">{sort.dir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td className="table__state" colSpan={columns.length + (selectable ? 1 : 0)}>
                  Загрузка…
                </td>
              </tr>
            )}

            {!loading && sortedRows.length === 0 && (
              <tr>
                <td className="table__state" colSpan={columns.length + (selectable ? 1 : 0)}>
                  {emptyText}
                </td>
              </tr>
            )}

            {!loading &&
              sortedRows.map((row) => {
                const key = rowKey(row);
                const disabled = isRowDisabled?.(row) ?? false;

                return (
                  <tr
                    key={key}
                    className={[
                      selected.has(key) ? 'is-selected' : '',
                      isRowInvalid?.(row) ? 'is-invalid' : '',
                    ].join(' ')}
                  >
                    {selectable && (
                      <td className="table__col-checkbox">
                        <Checkbox
                          checked={selected.has(key)}
                          disabled={disabled}
                          onChange={() => toggleRow(key)}
                          aria-label={`Выбрать строку ${key}`}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key}>{column.render(row)}</td>
                    ))}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export interface TableCellInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

/** Инпут для редактирования значения прямо в ячейке таблицы. */
export function TableCellInput({ value, onChange, error, placeholder, disabled, ...aria }: TableCellInputProps) {
  return (
    <>
      <input
        className={`table__cell-input ${error ? 'is-invalid' : ''}`}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-label={aria['aria-label']}
        onChange={(event) => onChange(event.target.value)}
        onClick={(event) => event.stopPropagation()}
      />
      {error && <span className="table__cell-error">{error}</span>}
    </>
  );
}
