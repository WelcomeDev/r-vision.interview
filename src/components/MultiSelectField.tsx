import { Field } from './Field';
import { MultiSelect, MultiSelectProps } from './MultiSelect';

export interface MultiSelectFieldProps<V extends string | number = string>
  extends Omit<MultiSelectProps<V>, 'invalid' | 'id' | 'aria-invalid' | 'aria-describedby'> {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
}

/** Field + MultiSelect. */
export function MultiSelectField<V extends string | number = string>({
  label,
  required,
  hint,
  error,
  ...control
}: MultiSelectFieldProps<V>) {
  return (
    <Field label={label} required={required} hint={hint} error={error}>
      {(fieldProps) => <MultiSelect {...fieldProps} {...control} invalid={Boolean(error)} />}
    </Field>
  );
}
