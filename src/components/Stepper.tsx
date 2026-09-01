export interface StepDescriptor {
  id: string;
  title: string;
  description?: string;
}

export interface StepperProps {
  steps: StepDescriptor[];
  current: number;
  /** Индексы шагов, пройденных валидацией. */
  completed?: number[];
  /** Индексы шагов с ошибками. */
  invalid?: number[];
  onStepClick?: (index: number) => void;
  /** Разрешает клик по шагу (по умолчанию — только по пройденным и текущему). */
  isStepEnabled?: (index: number) => boolean;
}

export function Stepper({ steps, current, completed = [], invalid = [], onStepClick, isStepEnabled }: StepperProps) {
  return (
    <nav className="stepper" aria-label="Шаги мастера">
      {steps.map((step, index) => {
        const isCurrent = index === current;
        const isDone = completed.includes(index) && !isCurrent;
        const isInvalid = invalid.includes(index);
        const enabled = isStepEnabled ? isStepEnabled(index) : isDone || isCurrent;

        return (
          <button
            key={step.id}
            type="button"
            className={[
              'step',
              isCurrent ? 'step--current' : '',
              isDone ? 'step--done' : '',
              isInvalid ? 'step--error' : '',
            ].join(' ')}
            aria-current={isCurrent ? 'step' : undefined}
            disabled={!enabled || !onStepClick}
            onClick={() => onStepClick?.(index)}
          >
            <span className="step__badge">{isInvalid ? '!' : isDone ? '✓' : index + 1}</span>
            <span>
              <span className="step__title">{step.title}</span>
              {step.description && <span className="step__desc"> · {step.description}</span>}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
