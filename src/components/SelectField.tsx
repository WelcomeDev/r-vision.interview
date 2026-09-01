import { Field } from './Field';
import { Select, SelectProps } from './Select';

export interface SelectFieldProps<V extends string | number = string>
  extends Omit<SelectProps<V>, 'invalid' | 'id' | 'aria-invalid' | 'aria-describedby'> {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
}

/** Field + Select. */
export function SelectField<V extends string | number = string>({
  label,
  required,
  hint,
  error,
  ...control
}: SelectFieldProps<V>) {
  return (
    <Field label={label} required={required} hint={hint} error={error}>
      {(fieldProps) => <Select {...fieldProps} {...control} invalid={Boolean(error)} />}
    </Field>
  );
}
