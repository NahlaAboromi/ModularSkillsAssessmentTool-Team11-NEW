import React from 'react';

/**
 * ConfirmModal component displays a modal dialog for confirming critical actions,
 * such as deleting an item. It supports a title, description, customizable button texts,
 * a loading state, and cancel/confirm handlers.
 */
const ConfirmModal = ({
  title = 'Are you sure?',
  description = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isOpen,
  isProcessing = false,
  onConfirm,
  onCancel
}) => {
  // Do not render anything if modal is not open
  if (!isOpen) return null;

  return (
    // Modal overlay
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Modal content */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{title}</h2>
        {/* Optional description */}
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{description}</p>
        )}
        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:text-white"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-4 py-2 text-sm rounded text-white ${
              isProcessing
                ? 'bg-red-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isProcessing ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
