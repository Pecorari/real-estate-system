export default function Table({ columns, data }) {
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
            <tr key={i} className="border-t">
              {Object.values(row).map((value, j) => (
                <td key={j} className="px-4 py-2">
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
