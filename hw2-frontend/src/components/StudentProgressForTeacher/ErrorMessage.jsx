import React from 'react';
/**
 * Displays an error message in a styled alert box.
 * Uses Tailwind CSS classes for consistent styling in both light and dark modes.
 */
const ErrorMessage = ({ error }) => {
  return (
    <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
      {error}
    </div>
  );
};

export default ErrorMessage;
