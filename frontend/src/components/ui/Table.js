export default function Table({ columns, data, onRowClick }) {
  return (
    <div className="overflow-auto rounded shadow bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-200 text-left">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-2 font-medium">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className={`border-t hover:bg-gray-100 transition ${onRowClick ? 'cursor-pointer hover:text-blue-700' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {Object.values(row).map((value, j) => (
                <td key={j} className='px-4 py-2'>
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
