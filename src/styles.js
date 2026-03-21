// Shared design tokens & style helpers — import from any component

export const S = {
  // Page wrapper
  page: { padding: 0 },

  // Page header
  pageHead: { marginBottom: '24px' },
  pageTitle: { fontSize: '20px', fontWeight: 700, color: 'var(--t1)', letterSpacing: '-.02em', margin: 0 },
  pageSub: { fontSize: '12px', color: 'var(--t3)', marginTop: '4px' },

  // Top bar with title + button
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },

  // Primary button — pink gradient matching app theme
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '9px 16px',
    background: 'linear-gradient(135deg, var(--accent), #FF72B2)',
    border: 'none', borderRadius: '9px',
    fontSize: '13px', fontWeight: 600, color: '#fff',
    cursor: 'pointer', fontFamily: 'Sora, sans-serif',
    boxShadow: '0 4px 16px var(--accent-g)',
    transition: 'opacity .15s, transform .1s',
  },

  // Ghost button
  btnGhost: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '8px 14px',
    background: 'var(--bg-elevated)', border: '1px solid var(--border2)',
    borderRadius: '9px', fontSize: '13px', fontWeight: 500,
    color: 'var(--t2)', cursor: 'pointer', fontFamily: 'Sora, sans-serif',
    transition: 'all .15s',
  },

  // Icon action buttons (edit / delete)
  iconBtn: (color) => ({
    width: '30px', height: '30px', borderRadius: '7px',
    border: `1px solid ${color}22`,
    background: `${color}10`,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all .15s', color,
  }),

  // Table card
  tableCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px', overflow: 'hidden',
  },

  // Table header cell
  th: {
    padding: '12px 18px',
    fontSize: '10px', fontWeight: 600,
    color: 'var(--t3)', letterSpacing: '.08em', textTransform: 'uppercase',
    textAlign: 'left', background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border)',
  },
  thRight: {
    padding: '12px 18px',
    fontSize: '10px', fontWeight: 600,
    color: 'var(--t3)', letterSpacing: '.08em', textTransform: 'uppercase',
    textAlign: 'right', background: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border)',
  },

  // Table row
  tr: { borderBottom: '1px solid var(--border)', transition: 'background .12s', cursor: 'default' },

  // Table data cells
  td: { padding: '13px 18px', fontSize: '13px', color: 'var(--t2)', whiteSpace: 'nowrap' },
  tdBold: { padding: '13px 18px', fontSize: '13px', fontWeight: 600, color: 'var(--t1)', whiteSpace: 'nowrap' },
  tdRight: { padding: '13px 18px', fontSize: '13px', color: 'var(--t2)', textAlign: 'right', whiteSpace: 'nowrap' },

  // Status badge base
  badge: (color, bg, border) => ({
    display: 'inline-flex', alignItems: 'center',
    padding: '3px 9px', borderRadius: '20px',
    fontSize: '11px', fontWeight: 600,
    color, background: bg, border: `1px solid ${border}`,
  }),

  // Loading / error state
  stateBox: {
    padding: '48px', textAlign: 'center',
    fontSize: '13px', color: 'var(--t3)',
  },

  // Mono text (batch numbers, SKUs, etc.)
  mono: { fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--t3)' },
};

// Modal overlay + panel styles
export const modalStyles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(13,26,46,0.50)', backdropFilter: 'blur(4px)',
    zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
  },
  panel: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border2)',
    borderRadius: '16px',
    padding: '28px',
    width: '100%', maxWidth: '460px',
    boxShadow: '0 32px 80px rgba(13,26,46,0.25)',
    position: 'relative', zIndex: 51,
  },
  title: { fontSize: '16px', fontWeight: 700, color: 'var(--t1)', marginBottom: '20px' },
  formGroup: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--t3)', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: '6px' },
  input: {
    width: '100%', padding: '10px 13px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border2)',
    borderRadius: '9px',
    fontSize: '13px', color: 'var(--t1)',
    fontFamily: 'Sora, sans-serif', outline: 'none',
    transition: 'border-color .15s, box-shadow .15s',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '10px 13px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border2)',
    borderRadius: '9px',
    fontSize: '13px', color: 'var(--t1)',
    fontFamily: 'Sora, sans-serif', outline: 'none',
    appearance: 'none',
    transition: 'border-color .15s',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', padding: '10px 13px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border2)',
    borderRadius: '9px',
    fontSize: '13px', color: 'var(--t1)',
    fontFamily: 'Sora, sans-serif', outline: 'none',
    resize: 'vertical', minHeight: '80px',
    transition: 'border-color .15s',
    boxSizing: 'border-box',
  },
  error: { fontSize: '11px', color: 'var(--rose)', marginTop: '4px' },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '22px' },
  btnCancel: {
    padding: '9px 18px', borderRadius: '9px',
    background: 'var(--bg-elevated)', border: '1px solid var(--border2)',
    fontSize: '13px', fontWeight: 500, color: 'var(--t2)',
    cursor: 'pointer', fontFamily: 'Sora, sans-serif',
  },
  btnSubmit: {
    padding: '9px 20px', borderRadius: '9px',
    background: 'linear-gradient(135deg, var(--accent), #FF72B2)',
    border: 'none', fontSize: '13px', fontWeight: 600, color: '#fff',
    cursor: 'pointer', fontFamily: 'Sora, sans-serif',
    boxShadow: '0 4px 14px var(--accent-g)',
  },
};

// Focus handler for inputs/selects
export const onFocus = (e) => {
  e.target.style.borderColor = 'var(--accent)';
  e.target.style.boxShadow = '0 0 0 3px var(--accent-d)';
};
export const onBlur = (e) => {
  e.target.style.borderColor = 'var(--border2)';
  e.target.style.boxShadow = 'none';
};

export default S;