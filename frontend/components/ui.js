'use client';

const joinClasses = (...values) => values.filter(Boolean).join(' ');

export function GlassPanel({ className = '', children }) {
  return <div className={joinClasses('glass-panel', className)}>{children}</div>;
}

export function SectionEyebrow({ className = '', children }) {
  return (
    <p className={joinClasses('text-xs font-semibold uppercase tracking-[0.3em] text-slate-500', className)}>
      {children}
    </p>
  );
}

export function PrimaryButton({ className = '', children, ...props }) {
  return (
    <button
      className={joinClasses(
        'rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryLink({ className = '', children, ...props }) {
  return (
    <a
      className={joinClasses(
        'rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900',
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export function AccentPill({ tone = 'slate', className = '', children }) {
  const tones = {
    slate: 'bg-slate-900 text-white',
    blue: 'bg-blue-100 text-blue-700',
    violet: 'bg-violet-100 text-violet-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700'
  };

  return (
    <span className={joinClasses('inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]', tones[tone] || tones.slate, className)}>
      {children}
    </span>
  );
}

export function IconTile({ tone = 'slate', className = '', children }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-blue-100 text-blue-600',
    violet: 'bg-violet-100 text-violet-600',
    cyan: 'bg-cyan-100 text-cyan-700',
    white: 'bg-white text-slate-700'
  };

  return (
    <div className={joinClasses('rounded-2xl p-3', tones[tone] || tones.slate, className)}>
      {children}
    </div>
  );
}

export function Notice({ tone = 'slate', className = '', children }) {
  const tones = {
    slate: 'border border-slate-200 bg-slate-50 text-slate-700',
    blue: 'border border-blue-200 bg-blue-50 text-blue-700',
    violet: 'border border-violet-200 bg-violet-50 text-violet-700',
    emerald: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
    red: 'border border-red-200 bg-red-50 text-red-700'
  };

  return (
    <div className={joinClasses('rounded-2xl px-4 py-3', tones[tone] || tones.slate, className)}>
      {children}
    </div>
  );
}
