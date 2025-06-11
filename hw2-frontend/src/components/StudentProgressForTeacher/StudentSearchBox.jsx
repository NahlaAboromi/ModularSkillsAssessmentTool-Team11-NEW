// StudentSearchBox.jsx
import React from 'react';
/**
 * A presentational component that renders a styled search input for filtering students
 * by name or ID. Includes a search icon and supports dark/light mode styling.
 */
const StudentSearchBox = ({ value, onChange, isDark }) => {
  return (
    <div className="bg-white dark:bg-slate-600 p-4 rounded shadow mb-6">
      <div className="relative">
        {/* Search input field */}
        <input
          type="text"
          placeholder="Search students by ID or name..."
          className="w-full py-2 px-4 pr-10 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={value}
          onChange={onChange}
        />
        {/* Search icon (SVG) positioned inside the input */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 absolute right-3 top-2.5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
};

export default StudentSearchBox;
