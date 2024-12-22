import React from 'react';

function Dropdown({ label, options, value, onChange }) {
  return (
    <div>
      <label>{label}: </label>
      <select value={value} onChange={onChange}>
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Dropdown;