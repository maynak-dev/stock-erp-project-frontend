import { CurrencyDollarIcon, CubeIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const defaultStats = [
  { name: 'Total Stock Value', value: '$0', icon: CurrencyDollarIcon },
  { name: 'Total Items',       value: '0',  icon: CubeIcon },
  { name: 'Expiring Soon',     value: '0',  icon: ClockIcon },
  { name: 'Pending Returns',   value: '0',  icon: ArrowPathIcon },
];

const cardAccents = [
  { color: 'var(--accent)', glow: 'var(--accent-g)', bg: 'var(--accent-d)' },
  { color: 'var(--teal)',   glow: 'rgba(15,207,176,.2)',  bg: 'rgba(15,207,176,.08)'  },
  { color: 'var(--amber)',  glow: 'rgba(245,166,35,.2)',  bg: 'rgba(245,166,35,.08)'  },
  { color: 'var(--rose)',   glow: 'rgba(255,90,126,.2)',  bg: 'rgba(255,90,126,.08)'  },
];

export default function StatsCards({ stats: customStats }) {
  const displayStats = customStats || defaultStats;

  return (
    // Use CSS class for responsive grid (4→2→2 cols)
    <div className="stats-grid">
      {displayStats.map((item, i) => {
        const accent = cardAccents[i % cardAccents.length];
        const Icon   = item.icon;
        return (
          <div key={item.name}
            className={`fade-up fade-up-${i + 1}`}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '18px',
              transition: 'border-color .2s, box-shadow .2s, transform .2s',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = accent.color;
              e.currentTarget.style.boxShadow   = `0 0 24px ${accent.glow}`;
              e.currentTarget.style.transform   = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow   = 'none';
              e.currentTarget.style.transform   = 'none';
            }}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '9px',
              background: accent.bg, border: `1px solid ${accent.color}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '14px',
            }}>
              {Icon && <Icon style={{ width: '18px', height: '18px', color: accent.color }} />}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--t3)', fontWeight: 500, letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: '5px' }}>
              {item.name}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--t1)', letterSpacing: '-.02em' }}>
              {item.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
