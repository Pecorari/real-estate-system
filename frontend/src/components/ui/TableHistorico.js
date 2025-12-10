export default function TableHistorico({ columns, data }) {
  return (
    <div className="overflow-auto rounded shadow bg-white max-h-[50vh] overflow-y-auto">
      <table className="min-w-full text-sm">
        
        <thead className="bg-gray-200 text-left sticky top-0 z-10">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-3 py-2 font-medium whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className={`border-t bg-gray-50 hover:bg-gray-100 transition`}
            >
              {Object.entries(row).map(([key, value], j) => (
                <td key={j} className="px-3 whitespace-nowrap">
                  {key.toLowerCase() === "acao" ? (
                    <span className={`font-medium flex items-center gap-2 before:content-['•'] before:text-lg text-gray-700 before:text-gray-400`}>
                      {value}
                    </span>
                  ) : (
                    <span className="text-gray-700">{value}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
