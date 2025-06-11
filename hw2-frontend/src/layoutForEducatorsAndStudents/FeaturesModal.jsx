import React, { useState } from 'react';
import { Link } from 'react-router-dom';
/**
 * FeaturesModal
 * Renders a link that opens a modal with a list of the platform's key features.
 * */
const FeaturesModal = () => {
    // State to control modal visibility
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      {/* Link to open modal */}
      <Link 
        to="#"
        onClick={(e) => {
          e.preventDefault();
          setShowModal(true);
        }}
        className="hover:text-blue-500"
      >
        Features
      </Link>

        {/* Modal overlay and content */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl w-11/12 max-w-md text-slate-800 dark:text-white">
            <h2 className="text-xl font-bold mb-4">📋 Key Features</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Educator and student management</li>
              <li>Export progress reports as PDF</li>
              <li>Interactive performance charts</li>
              <li>Per-class statistics and summaries</li>
              <li>Dark mode support 🌙</li>
            </ul>
                {/* Close button */}
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturesModal;
