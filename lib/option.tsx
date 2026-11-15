import { createContext, useContext, useState, type ReactNode } from 'react';

/**
 * The site had two options for review: a = black ground, b = white ground. The owner chose
 * light only, so it is fixed to b and the switch is gone. (The dark tokens remain in the CSS.)
 */
export type LayoutOption = 'a' | 'b';

const FIXED: LayoutOption = 'b';

export const SHOW_PICKER = false;

function initial(): LayoutOption {
  if (FIXED) return FIXED;
  if (!SHOW_PICKER || typeof document === 'undefined') return 'a';
  return document.documentElement.dataset.option === 'b' ? 'b' : 'a';
}

const Ctx = createContext<{ option: LayoutOption; setOption: (o: LayoutOption) => void }>({
  option: 'b',
  setOption: () => {},
});

export function OptionProvider({ children }: { children: ReactNode }) {
  const [option, set] = useState<LayoutOption>(initial);
  const setOption = (o: LayoutOption) => {
    set(o);
    document.documentElement.dataset.option = o;
    try {
      localStorage.setItem('layoutOption', o);
    } catch {
      /* storage can be unavailable; the choice still applies for this visit */
    }
  };
  return <Ctx.Provider value={{ option, setOption }}>{children}</Ctx.Provider>;
}

export const useOption = () => useContext(Ctx);

/** Floating switch between the two options. Preview build only. */
export function OptionPicker() {
  const { option, setOption } = useOption();
  if (!SHOW_PICKER) return null;
  return (
    <div className="option-picker" role="group" aria-label="Compare layout options">
      <span className="label hidden px-3 text-muted md:inline">Layout</span>
      <div className="seg">
        {(
          [
            ['a', 'Option A', 'Index'],
            ['b', 'Option B', 'Grid'],
          ] as const
        ).map(([v, name, sub]) => (
          <button key={v} type="button" aria-pressed={option === v} onClick={() => setOption(v)} className="press">
            {name}
            <span className="ml-2 opacity-60">{sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
