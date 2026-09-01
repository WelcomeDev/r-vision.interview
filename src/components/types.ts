export interface SelectOption<V extends string | number = string> {
  value: V;
  label: string;
  /** Второстепенный текст справа/снизу в списке. */
  description?: string;
  disabled?: boolean;
}
