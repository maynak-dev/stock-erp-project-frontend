import { useMemo, useState } from 'react';
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getPaginationRowModel, flexRender,
} from '@tanstack/react-table';
import { format, isWithinInterval, subDays } from 'date-fns';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

// ─── Inline design tokens ──────────────────────────────────────────────────
const T = {
  tableCard: { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'14px', overflow:'hidden' },
  th:        { padding:'12px 18px', fontSize:'10px', fontWeight:600, color:'var(--t3)', letterSpacing:'.08em',
               textTransform:'uppercase', textAlign:'left', background:'var(--bg-surface)',
               borderBottom:'1px solid var(--border)', cursor:'pointer', userSelect:'none', whiteSpace:'nowrap' },
  td:        { padding:'13px 18px', fontSize:'13px', color:'var(--t2)', whiteSpace:'nowrap' },
  stateBox:  { padding:'48px', textAlign:'center', fontSize:'13px', color:'var(--t3)' },
  badge: (color, bg, border) => ({
    display:'inline-flex', alignItems:'center', padding:'3px 9px', borderRadius:'20px',
    fontSize:'11px', fontWeight:600, color, background:bg, border:`1px solid ${border}`,
  }),
};

const STATUS_STYLE = {
  IN_COMPANY:  { color:'var(--accent-soft)', bg:'var(--accent-d)',       border:'rgba(108,99,255,.2)'  },
  IN_LOCATION: { color:'var(--teal)',         bg:'rgba(15,207,176,.1)',   border:'rgba(15,207,176,.2)'  },
  IN_SHOP:     { color:'var(--amber)',        bg:'rgba(245,166,35,.1)',   border:'rgba(245,166,35,.2)'  },
  EXPIRED:     { color:'var(--rose)',         bg:'rgba(255,90,126,.1)',   border:'rgba(255,90,126,.2)'  },
  RETURNED:    { color:'var(--t2)',           bg:'var(--bg-elevated)',    border:'var(--border2)'       },
};

export default function StockTable({ data }) {
  const [sorting, setSorting] = useState([]);

  const columns = useMemo(() => [
    {
      header: 'Product',
      // FIX: use accessorFn for nested objects — accessorKey with dots only works
      // for simple nesting; optional chaining (?.) is not supported as an accessorKey
      accessorFn: row => row.product?.name ?? '—',
      id: 'productName',
      cell: ({ getValue }) => (
        <span style={{ fontWeight:600, color:'var(--t1)' }}>{getValue()}</span>
      ),
    },
    {
      header: 'Batch',
      accessorKey: 'batchNumber',
      cell: ({ getValue }) => (
        <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'11px', color:'var(--t3)' }}>
          {getValue()}
        </span>
      ),
    },
    {
      header: 'Qty',
      accessorKey: 'quantity',
      cell: ({ getValue }) => (
        <span style={{ fontWeight:700, color:'var(--teal)' }}>{getValue()}</span>
      ),
    },
    {
      header: 'Expiry Date',
      accessorKey: 'expiryDate',
      cell: ({ getValue }) => {
        const expiry = new Date(getValue());
        const nearExpiry = isWithinInterval(expiry, { start: new Date(), end: subDays(new Date(), -7) });
        return (
          <span style={{ color: nearExpiry ? 'var(--rose)' : 'var(--t2)', fontWeight: nearExpiry ? 600 : 400,
                         fontFamily:'JetBrains Mono,monospace', fontSize:'12px' }}>
            {format(expiry, 'dd/MM/yyyy')}
            {nearExpiry && (
              <span style={{ marginLeft:'6px', fontSize:'10px', background:'rgba(255,90,126,.1)',
                             border:'1px solid rgba(255,90,126,.2)', color:'var(--rose)',
                             padding:'1px 5px', borderRadius:'4px' }}>Near</span>
            )}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const st = STATUS_STYLE[getValue()] || { color:'var(--t2)', bg:'var(--bg-elevated)', border:'var(--border2)' };
        return (
          <span style={T.badge(st.color, st.bg, st.border)}>
            {(getValue() || '').replace(/_/g, ' ')}
          </span>
        );
      },
    },
    {
      header: 'Location',
      // FIX: accessorFn instead of accessorKey:'location?.name'
      accessorFn: row => row.location?.name ?? null,
      id: 'locationName',
      cell: ({ getValue }) => (
        <span style={{ color:'var(--t3)', fontSize:'12px' }}>{getValue() || '—'}</span>
      ),
    },
    {
      header: 'Shop',
      // FIX: accessorFn instead of accessorKey:'shop?.name'
      accessorFn: row => row.shop?.name ?? null,
      id: 'shopName',
      cell: ({ getValue }) => (
        <span style={{ color:'var(--t3)', fontSize:'12px' }}>{getValue() || '—'}</span>
      ),
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div>
      <div style={T.tableCard}>
        <div className="table-scroll"><table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th key={h.id} style={T.th} onClick={h.column.getToggleSortingHandler()}>
                    <div style={{ display:'inline-flex', alignItems:'center', gap:'4px' }}>
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {h.column.getIsSorted() === 'asc'  && <ChevronUpIcon   style={{ width:11, height:11, color:'var(--accent-soft)' }}/>}
                      {h.column.getIsSorted() === 'desc' && <ChevronDownIcon style={{ width:11, height:11, color:'var(--accent-soft)' }}/>}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}
                style={{ borderBottom:'1px solid var(--border)', transition:'background .12s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} style={T.td}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table></div>
        {data.length === 0 && <div style={T.stateBox}>No stock items found</div>}
      </div>

      {/* Pagination */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                    marginTop:'14px', fontSize:'12px', color:'var(--t3)' }}>
        <span>
          Page <span style={{ color:'var(--t1)', fontWeight:600 }}>
            {table.getState().pagination.pageIndex + 1}
          </span> of {table.getPageCount()} · {data.length} items
        </span>
        <div style={{ display:'flex', gap:'8px' }}>
          {[['← Prev', 'previousPage', !table.getCanPreviousPage()],
            ['Next →', 'nextPage',     !table.getCanNextPage()]].map(([label, fn, disabled]) => (
            <button key={label} onClick={() => table[fn]()} disabled={disabled}
              style={{ padding:'6px 14px', borderRadius:'7px', border:'1px solid var(--border2)',
                       background: disabled ? 'transparent' : 'var(--bg-elevated)',
                       color: disabled ? 'var(--t3)' : 'var(--t2)',
                       cursor: disabled ? 'not-allowed' : 'pointer',
                       fontSize:'12px', fontFamily:'Sora,sans-serif', transition:'all .15s' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
