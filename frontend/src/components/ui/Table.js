export default function Table({ columns, data, onRowClick }) {

  const observacoesIndex = columns.findIndex(
    (col) => col.toLowerCase() === "observações" || col.toLowerCase() === "observacoes"
  );

  return (
    <div className="overflow-auto rounded shadow bg-white max-h-[65vh] overflow-y-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-200 text-left sticky top-0 z-10">
          <tr>
            {columns.map((col, index) => (
              <th key={col} className={`px-4 py-2 font-medium whitespace-nowrap ${ index === observacoesIndex ? "hidden md:table-cell" : "" }`}>
                {col}
              </th>
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
                <td key={j} className={`px-4 py-2 whitespace-nowrap ${ j === observacoesIndex ? "hidden md:table-cell" : "" }`}>
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
