'use client';

import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { Icon } from './icons';

/* ============================ Utilities ============================ */

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/* ============================== Panel ============================== */

export function Panel({
  children, className, padded = true, as: Tag = 'section',
}: { children: ReactNode; className?: string; padded?: boolean; as?: 'section' | 'div' | 'article' | 'aside' }) {
  return <Tag className={cx('panel', padded && 'p-4', className)}>{children}</Tag>;
}

export function PanelHeader({
  title, subtitle, actions, dense = false,
}: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; dense?: boolean }) {
  return (
    <div className={cx('flex items-start justify-between gap-3', dense ? 'mb-2' : 'mb-3')}>
      <div className="min-w-0">
        <h3 className="text-md font-semibold text-ink truncate">{title}</h3>
        {subtitle ? <p className="text-xs text-ink-3 mt-0.5">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-1.5 shrink-0">{actions}</div> : null}
    </div>
  );
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('label mb-2', className)}>{children}</div>;
}

/* ============================== Button ============================== */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle';
type ButtonSize = 'xs' | 'sm' | 'md';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:brightness-110 border border-transparent',
  secondary: 'bg-raised text-ink border border-line hover:border-line-strong hover:bg-sunken',
  ghost: 'bg-transparent text-ink-2 border border-transparent hover:bg-raised hover:text-ink',
  subtle: 'bg-sunken text-ink-2 border border-transparent hover:text-ink hover:bg-raised',
  danger: 'bg-neg text-white hover:brightness-110 border border-transparent',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  xs: 'h-6 px-2 text-2xs gap-1 rounded-sm',
  sm: 'h-7 px-2.5 text-xs gap-1.5 rounded',
  md: 'h-8 px-3 text-sm gap-1.5 rounded',
};

export function Button({
  children, variant = 'secondary', size = 'sm', icon, iconRight, className,
  loading = false, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant; size?: ButtonSize; icon?: ReactNode; iconRight?: ReactNode; loading?: boolean;
}) {
  return (
    <button
      type="button"
      className={cx(
        'inline-flex items-center justify-center font-medium transition select-none focus-ring',
        'disabled:opacity-45 disabled:pointer-events-none whitespace-nowrap',
        BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className,
      )}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? <Spinner size={size === 'xs' ? 10 : 12} /> : icon}
      {children}
      {iconRight}
    </button>
  );
}

export function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className="animate-spin" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.25" fill="none" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function IconButton({
  label, children, className, size = 'sm', ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; size?: ButtonSize }) {
  return (
    <button
      type="button" title={label} aria-label={label}
      className={cx(
        'inline-flex items-center justify-center rounded text-ink-3 hover:text-ink hover:bg-raised transition focus-ring',
        size === 'xs' ? 'h-6 w-6' : size === 'md' ? 'h-8 w-8' : 'h-7 w-7',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ============================== Badge =============================== */

export type BadgeTone = 'neutral' | 'accent' | 'pos' | 'neg' | 'warn' | 'brass' | 'outline';

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'bg-sunken text-ink-2 border-transparent',
  accent: 'bg-accent/12 text-accent border-accent/25',
  pos: 'bg-pos/12 text-pos border-pos/25',
  neg: 'bg-neg/12 text-neg border-neg/25',
  warn: 'bg-warn/12 text-warn border-warn/25',
  brass: 'bg-brass/12 text-brass border-brass/25',
  outline: 'bg-transparent text-ink-3 border-line',
};

export function Badge({
  children, tone = 'neutral', className, title,
}: { children: ReactNode; tone?: BadgeTone; className?: string; title?: string }) {
  return (
    <span
      title={title}
      className={cx(
        'inline-flex items-center gap-1 rounded-sm border px-1.5 h-[18px] text-2xs font-semibold uppercase tracking-wider',
        BADGE_TONES[tone], className,
      )}
    >
      {children}
    </span>
  );
}

/* ============================== Inputs =============================== */

const FIELD_BASE =
  'w-full bg-panel border border-line rounded px-2.5 text-base text-ink placeholder:text-ink-4 ' +
  'transition focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:opacity-50';

export function Field({
  label, hint, error, children, className, required,
}: { label?: ReactNode; hint?: ReactNode; error?: string | null; children: ReactNode; className?: string; required?: boolean }) {
  return (
    <label className={cx('block', className)}>
      {label ? (
        <span className="label mb-1 flex items-center gap-1">
          {label}{required ? <span className="text-neg">*</span> : null}
        </span>
      ) : null}
      {children}
      {error ? <span className="mt-1 block text-xs text-neg">{error}</span> : hint ? <span className="mt-1 block text-xs text-ink-3">{hint}</span> : null}
    </label>
  );
}

export function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(FIELD_BASE, 'h-8', className)} {...rest} />;
}

export function NumberInput({
  className, value, onValueChange, suffix, step = 'any', ...rest
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  value: number | string; onValueChange: (v: number) => void; suffix?: string;
}) {
  return (
    <div className="relative">
      <input
        type="number" step={step} value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onValueChange(n);
          else if (e.target.value === '' || e.target.value === '-') onValueChange(0);
        }}
        className={cx(FIELD_BASE, 'h-7 num text-right', suffix && 'pr-6', className)}
        {...rest}
      />
      {suffix ? <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-2xs text-ink-4">{suffix}</span> : null}
    </div>
  );
}

/**
 * A rate entered the way an analyst says it: 14.25 for 14.25%. The value passed
 * in and handed back is the ratio the engine works in, so no caller has to
 * remember which side of the hundred it is on.
 */
export function PercentInput({
  value, onValueChange, decimals = 2, step = 0.25, className, ...rest
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'step'> & {
  value: number | null;
  onValueChange: (v: number) => void;
  decimals?: number;
  step?: number;
}) {
  const asPercent = value === null || !Number.isFinite(value) ? '' : (value * 100).toFixed(decimals);
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <div className="relative">
      <input
        type="number"
        step={step}
        value={draft ?? asPercent}
        onChange={(e) => {
          setDraft(e.target.value);
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onValueChange(n / 100);
          else if (e.target.value === '' || e.target.value === '-') onValueChange(0);
        }}
        onBlur={() => setDraft(null)}
        className={cx(FIELD_BASE, 'h-7 num pr-6 text-right', className)}
        {...rest}
      />
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-2xs text-ink-4">%</span>
    </div>
  );
}

export function Textarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(FIELD_BASE, 'py-2 leading-relaxed resize-y min-h-[80px]', className)} {...rest} />;
}

export function Select({
  className, children, ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cx(FIELD_BASE, 'h-8 appearance-none pr-7 cursor-pointer', className)} {...rest}>
        {children}
      </select>
      <Icon.Chevron className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-4" size={13} />
    </div>
  );
}

export function Checkbox({
  checked, onChange, label, disabled,
}: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode; disabled?: boolean }) {
  return (
    <label className={cx('inline-flex items-center gap-2 select-none', disabled ? 'opacity-50' : 'cursor-pointer')}>
      <span
        role="checkbox" aria-checked={checked} tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && onChange(!checked)}
        onKeyDown={(e) => { if (!disabled && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); onChange(!checked); } }}
        className={cx(
          'inline-flex h-[15px] w-[15px] items-center justify-center rounded-xs border transition focus-ring',
          checked ? 'bg-accent border-accent text-white' : 'bg-panel border-line-strong',
        )}
      >
        {checked ? <Icon.Check size={11} strokeWidth={2.4} /> : null}
      </span>
      {label ? <span className="text-base text-ink-2">{label}</span> : null}
    </label>
  );
}

export function Toggle({
  checked, onChange, label, disabled,
}: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode; disabled?: boolean }) {
  return (
    <label className={cx('inline-flex items-center gap-2 select-none', disabled ? 'opacity-50' : 'cursor-pointer')}>
      <button
        type="button" role="switch" aria-checked={checked} disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cx(
          'relative h-[18px] w-[32px] rounded-full transition focus-ring',
          checked ? 'bg-accent' : 'bg-line-strong',
        )}
      >
        <span className={cx(
          'absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white transition-all',
          checked ? 'left-[16px]' : 'left-[2px]',
        )} />
      </button>
      {label ? <span className="text-base text-ink-2">{label}</span> : null}
    </label>
  );
}

export function Segmented<T extends string>({
  options, value, onChange, size = 'sm', className,
}: {
  options: { value: T; label: ReactNode; title?: string }[];
  value: T; onChange: (v: T) => void; size?: 'xs' | 'sm'; className?: string;
}) {
  return (
    <div className={cx('inline-flex items-center rounded border border-line bg-sunken p-[2px]', className)}>
      {options.map((o) => (
        <button
          key={o.value} type="button" title={o.title}
          onClick={() => onChange(o.value)}
          className={cx(
            'rounded-sm font-medium transition focus-ring whitespace-nowrap',
            size === 'xs' ? 'h-[20px] px-1.5 text-2xs' : 'h-[24px] px-2.5 text-xs',
            value === o.value ? 'bg-panel text-ink shadow-sm' : 'text-ink-3 hover:text-ink-2',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* =============================== Tabs =============================== */

export function Tabs({
  tabs, value, onChange, className,
}: {
  tabs: { value: string; label: ReactNode; count?: number | null }[];
  value: string; onChange: (v: string) => void; className?: string;
}) {
  return (
    <div className={cx('flex items-end gap-0.5 border-b border-line overflow-x-auto', className)}>
      {tabs.map((t) => (
        <button
          key={t.value} type="button" onClick={() => onChange(t.value)}
          className={cx(
            'relative px-3 h-8 text-xs font-medium transition whitespace-nowrap focus-ring',
            value === t.value ? 'text-ink' : 'text-ink-3 hover:text-ink-2',
          )}
        >
          {t.label}
          {typeof t.count === 'number' ? <span className="ml-1.5 text-ink-4 num">{t.count}</span> : null}
          {value === t.value ? <span className="absolute inset-x-0 -bottom-px h-[2px] bg-accent" /> : null}
        </button>
      ))}
    </div>
  );
}

/* ============================= Tooltip ============================== */

export function Tooltip({
  content, children, side = 'top', className,
}: { content: ReactNode; children: ReactNode; side?: 'top' | 'bottom' | 'left' | 'right'; className?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const pos = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  }[side];
  return (
    <span
      className={cx('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
      aria-describedby={open ? id : undefined}
    >
      {children}
      {open ? (
        <span
          id={id} role="tooltip"
          className={cx(
            'absolute z-50 max-w-[300px] rounded border border-line-strong bg-panel px-2 py-1.5',
            'text-xs leading-snug text-ink-2 shadow-pop pointer-events-none animate-fade-in whitespace-normal',
            pos,
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}

/** A formula shown on hover — used across the model surfaces. */
export function FormulaHint({ formula, children }: { formula: string; children: ReactNode }) {
  return (
    <Tooltip content={<span className="num text-ink">{formula}</span>}>
      <span className="border-b border-dotted border-ink-4 cursor-help">{children}</span>
    </Tooltip>
  );
}

/* ============================== Modal =============================== */

export function Modal({
  open, onClose, title, subtitle, children, footer, width = 'md',
}: {
  open: boolean; onClose: () => void; title: ReactNode; subtitle?: ReactNode;
  children: ReactNode; footer?: ReactNode; width?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = previous; };
  }, [open, onClose]);

  if (!open) return null;
  const widths = { sm: 'max-w-[420px]', md: 'max-w-[560px]', lg: 'max-w-[760px]', xl: 'max-w-[1040px]' };
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 sm:p-8 no-print">
      <div className="fixed inset-0 bg-black/45 animate-fade-in" onClick={onClose} />
      <div className={cx('relative w-full panel shadow-pop animate-slide-up my-auto', widths[width])} role="dialog" aria-modal="true">
        <div className="flex items-start justify-between gap-4 border-b border-line p-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-xs text-ink-3">{subtitle}</p> : null}
          </div>
          <IconButton label="Close" onClick={onClose}><Icon.Close size={15} /></IconButton>
        </div>
        <div className="p-4 max-h-[65vh] overflow-y-auto">{children}</div>
        {footer ? <div className="flex items-center justify-end gap-2 border-t border-line p-3">{footer}</div> : null}
      </div>
    </div>
  );
}

/* ============================ Empty / states ============================ */

export function EmptyState({
  title, description, action, icon,
}: { title: string; description?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
      {icon ? <div className="mb-3 text-ink-4">{icon}</div> : null}
      <p className="text-md font-medium text-ink-2">{title}</p>
      {description ? <p className="mt-1 max-w-[440px] text-base text-ink-3 leading-relaxed">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('skeleton animate-shimmer rounded', className)} />;
}

export function InlineNote({
  tone = 'info', children,
}: { tone?: 'info' | 'warn' | 'neg' | 'pos'; children: ReactNode }) {
  const tones = {
    info: 'border-accent/25 bg-accent/[0.06] text-ink-2',
    warn: 'border-warn/30 bg-warn/[0.07] text-ink-2',
    neg: 'border-neg/30 bg-neg/[0.07] text-ink-2',
    pos: 'border-pos/30 bg-pos/[0.07] text-ink-2',
  };
  const icons = { info: <Icon.Info size={13} />, warn: <Icon.Warning size={13} />, neg: <Icon.Warning size={13} />, pos: <Icon.Check size={13} /> };
  const iconColor = { info: 'text-accent', warn: 'text-warn', neg: 'text-neg', pos: 'text-pos' };
  return (
    <div className={cx('flex items-start gap-2 rounded border px-2.5 py-2 text-xs leading-relaxed', tones[tone])}>
      <span className={cx('mt-[1px] shrink-0', iconColor[tone])}>{icons[tone]}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/* ============================== Toasts ============================== */

interface Toast { id: number; title: string; description?: string; tone: 'info' | 'pos' | 'neg' | 'warn' }
interface ToastApi { push: (t: Omit<Toast, 'id'>) => void }

const ToastContext = createContext<ToastApi>({ push: () => {} });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);
  const api = useMemo<ToastApi>(() => ({
    push: (t) => {
      const id = ++counter.current;
      setToasts((prev) => [...prev, { ...t, id }]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 5000);
    },
  }), []);

  const tones = {
    info: 'border-line-strong', pos: 'border-pos/40', neg: 'border-neg/40', warn: 'border-warn/40',
  };
  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex w-[330px] flex-col gap-2 no-print">
        {toasts.map((t) => (
          <div key={t.id} className={cx('panel shadow-pop p-3 animate-slide-up', tones[t.tone])}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-medium text-ink">{t.title}</p>
                {t.description ? <p className="mt-0.5 text-xs text-ink-3 leading-relaxed">{t.description}</p> : null}
              </div>
              <IconButton label="Dismiss" size="xs" onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}>
                <Icon.Close size={12} />
              </IconButton>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ========================= Layout helpers ========================= */

export function PageHeader({
  title, subtitle, actions, breadcrumb, children,
}: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; breadcrumb?: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-4">
      {breadcrumb ? <div className="mb-1.5 text-xs text-ink-3">{breadcrumb}</div> : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
          {subtitle ? <p className="mt-1 max-w-[70ch] text-base text-ink-3 leading-relaxed">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </header>
  );
}

export function Grid({ cols = 3, gap = 3, className, children }: { cols?: 1 | 2 | 3 | 4 | 5 | 6; gap?: 2 | 3 | 4; className?: string; children: ReactNode }) {
  const colClass = {
    1: 'grid-cols-1', 2: 'grid-cols-1 md:grid-cols-2', 3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4', 5: 'grid-cols-2 lg:grid-cols-5', 6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  }[cols];
  const gapClass = { 2: 'gap-2', 3: 'gap-3', 4: 'gap-4' }[gap];
  return <div className={cx('grid', colClass, gapClass, className)}>{children}</div>;
}
