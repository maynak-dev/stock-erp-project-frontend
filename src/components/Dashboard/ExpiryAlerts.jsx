import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { format, differenceInDays } from 'date-fns';
import { ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function ExpiryAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api.get('/expiry?days=7')
      .then(res => setAlerts(res.data))
      .catch(console.error);
  }, []);

  const getUrgency = (dateStr) => {
    const days = differenceInDays(new Date(dateStr), new Date());
    if (days <= 1) return { label: 'Critical', color: 'var(--rose)',  bg: 'rgba(255,90,126,0.1)'  };
    if (days <= 3) return { label: 'Urgent',   color: 'var(--amber)', bg: 'rgba(245,166,35,0.1)'  };
    return               { label: 'Warning',   color: 'var(--teal)',  bg: 'rgba(15,207,176,0.1)'  };
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '18px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ClockIcon style={{ width: '16px', height: '16px', color: 'var(--amber)' }} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Expiry Alerts</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Next 7 days</div>
          </div>
        </div>
        {alerts.length > 0 && (
          <div style={{
            padding: '3px 10px', borderRadius: '20px',
            background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.25)',
            fontSize: '12px', fontWeight: 700, color: 'var(--amber)',
          }}>
            {alerts.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '8px 12px' }}>
        {alerts.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>✓</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No items expiring soon</div>
          </div>
        ) : (
          alerts.map((item) => {
            const urgency = getUrgency(item.expiryDate);
            return (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 8px',
                borderRadius: '8px',
                marginBottom: '2px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: urgency.color, flexShrink: 0,
                    boxShadow: `0 0 6px ${urgency.color}`,
                  }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{item.product?.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                      Batch: {item.batchNumber}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    padding: '3px 8px', borderRadius: '6px',
                    background: urgency.bg, border: `1px solid ${urgency.color}33`,
                    fontSize: '11px', fontWeight: 600, color: urgency.color,
                  }}>
                    {urgency.label}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {format(new Date(item.expiryDate), 'dd/MM/yy')}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
        <Link to="/expiry" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '12px', fontWeight: 600, color: 'var(--accent-soft)',
          textDecoration: 'none', transition: 'gap 0.15s',
        }}>
          View all expiry alerts
          <ArrowRightIcon style={{ width: '12px', height: '12px' }} />
        </Link>
      </div>
    </div>
  );
}