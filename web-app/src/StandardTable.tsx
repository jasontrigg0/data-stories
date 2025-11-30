export const StandardTable = ({headers, data}) => {
  return (<div>
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
	<tr>
	  {headers.map((column, j) => (
	    <th key={j} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">{column.label}</th>
	  ))}
	</tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
	{data.map((row, i) => (
	  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
	    {headers.map((column, j) => (
	       <td key={j} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{row[column.key]}</td>
	    ))}
	  </tr>
	))}
      </tbody>
    </table>
  </div>);
}

