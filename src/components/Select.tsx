import { KeyboardEvent, useMemo, useRef, useState } from 'react';

import { Spinner } from './Spinner';
import { SelectOption } from './types';
import { useDismiss } from './hooks';

export interface SelectProps<V extends string | number = string> {
  options: SelectOption<V>[];
  value: V | null;
  onChange: (value: V | null) => void;
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  emptyText?: string;
  id?: string;
  onBlur?: () => void;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

export function Select<V extends string | number = string>({
  options,
  value,
  onChange,
  placeholder = 'Выберите значение',
  searchable = false,
  clearable = false,
  loading = false,
  disabled = false,
  invalid = false,
  emptyText = 'Ничего не найдено',
  id,
  onBlur,
  ...aria
}: SelectProps<V>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = () => {
    setOpen(false);
    setQuery('');
    onBlur?.();
  };

  useDismiss(rootRef, open, close);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((option) => option.label.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const selected = options.find((option) => option.value === value) ?? null;

  const commit = (option: SelectOption<V>) => {
    if (option.disabled) return;
    onChange(option.value);
    close();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (disabled) return;

    if (!open && (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown')) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(Math.max(0, filtered.findIndex((option) => option.value === value)));
      return;
    }
    if (!open) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Home') {
      setActiveIndex(0);
    } else if (event.key === 'End') {
      setActiveIndex(filtered.length - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) commit(option);
    }
  };

  return (
    <div className="popover-anchor" ref={rootRef}>
      <div
        id={id}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-invalid={aria['aria-invalid'] ?? invalid}
        aria-describedby={aria['aria-describedby']}
        className={[
          'control',
          'control--button',
          invalid ? 'control--invalid' : '',
          disabled ? 'control--disabled' : '',
        ].join(' ')}
        onClick={() => !disabled && (open ? close() : setOpen(true))}
        onKeyDown={onKeyDown}
      >
        {selected ? (
          <span className="control__value">{selected.label}</span>
        ) : (
          <span className="control__placeholder">{placeholder}</span>
        )}

        {loading && <Spinner />}
        {clearable && selected && !disabled && (
          <button
            type="button"
            className="control__clear"
            aria-label="Очистить"
            onClick={(event) => {
              event.stopPropagation();
              onChange(null);
            }}
          >
            ×
          </button>
        )}
        <span className="control__icon">▾</span>
      </div>

      {open && (
        <div className="popover" role="listbox">
          {searchable && (
            <div className="popover__search">
              <input
                autoFocus
                value={query}
                placeholder="Поиск…"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onKeyDown}
              />
            </div>
          )}

          {loading && <div className="popover__empty">Загрузка…</div>}

          {!loading && filtered.length === 0 && <div className="popover__empty">{emptyText}</div>}

          {!loading &&
            filtered.map((option, index) => (
              <div
                key={String(option.value)}
                role="option"
                aria-selected={option.value === value}
                className={[
                  'option',
                  index === activeIndex ? 'option--active' : '',
                  option.value === value ? 'option--selected' : '',
                  option.disabled ? 'option--disabled' : '',
                ].join(' ')}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => commit(option)}
              >
                <span>{option.label}</span>
                {option.description && <span className="option__desc">{option.description}</span>}
                {option.value === value && <span className="option__check">✓</span>}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
