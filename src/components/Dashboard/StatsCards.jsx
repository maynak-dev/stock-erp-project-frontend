import { CurrencyDollarIcon, CubeIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const defaultStats = [
  { name: 'Total Stock Value', value: '$0', icon: CurrencyDollarIcon },
  { name: 'Total Items',       value: '0',  icon: CubeIcon },
  { name: 'Expiring Soon',     value: '0',  icon: ClockIcon },
  { name: 'Pending Returns',   value: '0',  icon: ArrowPathIcon },
];

const cardAccents = [
  { color: 'var(--accent)',  glow: 'var(--accent-glow)',  bg: 'var(--accent-dim)' },
  { color: 'var(--teal)',    glow: 'var(--teal-glow)',    bg: 'rgba(15,207,176,0.08)' },
  { color: 'var(--amber)',   glow: 'var(--amber-glow)',   bg: 'rgba(245,166,35,0.08)' },
  { color: 'var(--rose)',    glow: 'var(--rose-glow)',    bg: 'rgba(255,90,126,0.08)' },
];

export default function StatsCards({ stats: customStats }) {
  const displayStats = customStats || defaultStats;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
      {displayStats.map((item, i) => {
        const accent = cardAccents[i % cardAccents.length];
        const Icon = item.icon;
        return (
          <div
            key={item.name}
            className={`fade-up fade-up-${i + 1}`}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '20px',
              transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = accent.color;
              e.currentTarget.style.boxShadow = `0 0 24px ${accent.glow}`;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'none';
            }}
          >
            {/* Icon */}
            <div style={{
              width: '40px', height: '40px',
              borderRadius: '10px',
              background: accent.bg,
              border: `1px solid ${accent.color}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
            }}>
              {Icon && <Icon style={{ width: '20px', height: '20px', color: accent.color }} />}
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '6px' }}>
              {item.name}
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {item.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}