import { useId } from "react";

export interface ChoiceOption<T extends string | number> {
  value: T;
  label: string;
  hint?: string;
}

interface Props<T extends string | number> {
  label: string;
  options: ChoiceOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Accessible single-choice chip group (radiogroup semantics). */
export function ChoiceGroup<T extends string | number>({ label, options, value, onChange }: Props<T>) {
  const id = useId();
  const selected = options.find((o) => o.value === value);
  return (
    <div role="radiogroup" aria-labelledby={id}>
      <div id={id} className="mb-2 text-sm font-medium text-slate-300">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={o.value === value}
            className="chip"
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
      {selected?.hint && <p className="mt-2 text-sm text-slate-400">{selected.hint}</p>}
    </div>
  );
}
