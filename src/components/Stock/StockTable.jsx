import { useMemo } from 'react';
import { useTable, useSortBy, usePagination } from 'react-table';
import { format, isWithinInterval, subDays } from 'date-fns';

export default function StockTable({ data }) {
  const columns = useMemo(() => [
    { Header: 'Product', accessor: 'product.name' },
    { Header: 'Batch', accessor: 'batchNumber' },
    { Header: 'Quantity', accessor: 'quantity' },
    {
      Header: 'Expiry Date',
      accessor: 'expiryDate',
      Cell: ({ value }) => {
        const expiry = new Date(value);
        const today = new Date();
        const nearExpiry = isWithinInterval(expiry, { start: today, end: subDays(today, -7) });
        return (
          <span className={nearExpiry ? 'text-red-600 font-bold' : ''}>
            {format(expiry, 'dd/MM/yyyy')}
          </span>
        );
      }
    },
    { Header: 'Status', accessor: 'status' },
    { Header: 'Location', accessor: 'location?.name' },
    { Header: 'Shop', accessor: 'shop?.name' },
  ], []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    previousPage,
    state: { pageIndex },
  } = useTable({ columns, data }, useSortBy, usePagination);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.render('Header')}
                  <span>
                    {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
          {page.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} className="hover:bg-gray-50">
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="px-6 py-3 flex items-center justify-between border-t">
        <div>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>
        </div>
        <div className="space-x-2">
          <button onClick={() => previousPage()} disabled={!canPreviousPage} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
            Previous
          </button>
          <button onClick={() => nextPage()} disabled={!canNextPage} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}