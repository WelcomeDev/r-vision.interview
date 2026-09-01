import { KeyboardEvent, useMemo, useRef, useState } from 'react';

import { Checkbox } from './Checkbox';
import { Chip } from './Chip';
import { Spinner } from './Spinner';
import { SelectOption } from './types';
import { useDismiss } from './hooks';

export interface MultiSelectProps<V extends string | number = string> {
  options: SelectOption<V>[];
  value: V[];
  onChange: (value: V[]) => void;
  placeholder?: string;
  searchable?: boolean;
  loading?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  /** Сколько чипов показывать до схлопывания в «+N». */
  maxVisibleChips?: number;
  emptyText?: string;
  id?: string;
  onBlur?: () => void;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

export function MultiSelect<V extends string | number = string>({
  options,
  value,
  onChange,
  placeholder = 'Выберите значения',
  searchable = true,
  loading = false,
  disabled = false,
  invalid = false,
  maxVisibleChips = 3,
  emptyText = 'Ничего не найдено',
  id,
  onBlur,
  ...aria
}: MultiSelectProps<V>) {
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

  const selectedOptions = useMemo(
    () => value.map((v) => options.find((option) => option.value === v) ?? ({ value: v, label: String(v) } as SelectOption<V>)),
    [value, options],
  );

  const toggle = (option: SelectOption<V>) => {
    if (option.disabled) return;
    onChange(
      value.includes(option.value) ? value.filter((v) => v !== option.value) : [...value, option.value],
    );
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (disabled) return;

    if (!open && (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown')) {
      event.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) toggle(option);
    }
  };

  const visible = selectedOptions.slice(0, maxVisibleChips);
  const restCount = selectedOptions.length - visible.length;

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
        {selectedOptions.length === 0 ? (
          <span className="control__placeholder">{placeholder}</span>
        ) : (
          <span className="chips">
            {visible.map((option) => (
              <Chip
                key={String(option.value)}
                label={option.label}
                onRemove={disabled ? undefined : () => onChange(value.filter((v) => v !== option.value))}
              />
            ))}
            {restCount > 0 && <Chip label={`+${restCount}`} title={selectedOptions.map((o) => o.label).join(', ')} />}
          </span>
        )}

        {loading && <Spinner />}
        {selectedOptions.length > 0 && !disabled && (
          <button
            type="button"
            className="control__clear"
            aria-label="Очистить всё"
            onClick={(event) => {
              event.stopPropagation();
              onChange([]);
            }}
          >
            ×
          </button>
        )}
        <span className="control__icon">▾</span>
      </div>

      {open && (
        <div className="popover" role="listbox" aria-multiselectable>
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
                aria-selected={value.includes(option.value)}
                className={[
                  'option',
                  index === activeIndex ? 'option--active' : '',
                  option.disabled ? 'option--disabled' : '',
                ].join(' ')}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => toggle(option)}
              >
                <Checkbox
                  checked={value.includes(option.value)}
                  disabled={option.disabled}
                  aria-label={option.label}
                  onChange={() => toggle(option)}
                />
                <span>{option.label}</span>
                {option.description && <span className="option__desc">{option.description}</span>}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
