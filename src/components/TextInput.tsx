import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';

import { Spinner } from './Spinner';

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'size' | 'prefix'> {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  clearable?: boolean;
  loading?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { value, onChange, invalid = false, clearable = false, loading = false, prefix, suffix, disabled, ...rest },
  ref,
) {
  return (
    <div
      className={[
        'control',
        invalid ? 'control--invalid' : '',
        disabled ? 'control--disabled' : '',
      ].join(' ')}
    >
      {prefix && <span className="control__icon">{prefix}</span>}

      <input
        ref={ref}
        className="control__input"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        {...rest}
      />

      {loading && <Spinner />}
      {clearable && value && !disabled && (
        <button type="button" className="control__clear" aria-label="Очистить" onClick={() => onChange('')}>
          ×
        </button>
      )}
      {suffix && <span className="control__icon">{suffix}</span>}
    </div>
  );
});
