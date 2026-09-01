import { Field } from './Field';
import { TextInput, TextInputProps } from './TextInput';

export interface TextFieldProps extends Omit<TextInputProps, 'invalid' | 'id' | 'aria-invalid' | 'aria-describedby'> {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
}

/** Field + TextInput: обычный случай без ручной сборки. */
export function TextField({ label, required, hint, error, ...control }: TextFieldProps) {
  return (
    <Field label={label} required={required} hint={hint} error={error}>
      {(fieldProps) => <TextInput {...fieldProps} {...control} invalid={Boolean(error)} />}
    </Field>
  );
}
