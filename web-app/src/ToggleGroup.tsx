import { useState } from 'react';

export const ToggleGroup = ({title, options, defaultOption, callback, small, center}) => {
  const [selected, setSelected] = useState(defaultOption);
  
  return (
    <div className={`p-2 ${center ? 'max-w-lg' : ''} mx-auto`}>
      {small? <span className="p-2">{title}:</span> : <h2 className="text-xl font-semibold mb-4">{title}</h2> }
      
      <div className="inline-flex bg-gray-100 rounded-lg p-1">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => { setSelected(option.id); callback(option.id) }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              selected === option.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
