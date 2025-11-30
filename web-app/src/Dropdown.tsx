import { useState } from 'react';

export const Dropdown = ({options, callback, placeholder, defaultOption, center, title}) => {
  const [selectedNumber, setSelectedNumber] = useState(defaultOption);

  const handleChange = (e) => {
    console.log(e.target.value);
    setSelectedNumber(e.target.value);
    if (e.target.value != "") {
	callback(e.target.value);
    }
  };

  return (
    <div className={`p-2 ${center ? "max-w-md" : ""} mx-auto`}>
      <span className="p-2">{title}</span>
      <div className="inline-flex bg-gray-100 rounded-lg p-1">
	<select
	  id="number-select"
	  value={selectedNumber}
	  onChange={handleChange}
	  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
	>
	  <option value="">{placeholder}</option>
	  {options.map((num) => (
	    <option key={num} value={num}>
	      {num}
	    </option>
	  ))}
        </select>
      </div>
    </div>
  )
}

