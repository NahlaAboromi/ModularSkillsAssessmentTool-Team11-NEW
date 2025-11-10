import React from 'react';

/**
 * a component that renders a button for exporting content (typically as PDF).
 * It receives its state and behavior via props and does not manage any internal logic.
 */
const ExportButton = ({ onExport, isExporting, isDark }) => {
  return (
    <button
      // Calls the export handler when clicked
      onClick={onExport}
      // Disables the button during export to prevent repeated actions
      disabled={isExporting}
      className={`absolute top-2 right-2 z-10 px-3 py-1 text-xs rounded-md transition-colors ${
        isDark 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      } ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
      // Tooltip for accessibility
      title="Export to PDF"
    >
      {/* Button label changes based on export state */}
      {isExporting ? '📄 Exporting...' : '📄 Export PDF'}
    </button>
  );
};

export default ExportButton;
