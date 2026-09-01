export interface ChipProps {
  label: string;
  onRemove?: () => void;
  title?: string;
}

export function Chip({ label, onRemove, title }: ChipProps) {
  return (
    <span className="chip" title={title ?? label}>
      <span className="chip__label">{label}</span>
      {onRemove && (
        <button
          type="button"
          className="chip__remove"
          aria-label={`Удалить ${label}`}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
        >
          ×
        </button>
      )}
    </span>
  );
}
