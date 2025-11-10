import React, { useState } from 'react';
/**
 * SimulationBox component displays the simulation situation and question,
 * and provides a button to request an overall AI class insight.
 * Shows a loading spinner and disables the button while loading.
 * 
 */
const SimulationBox = ({ simulationText, situation, onGetClassInsight }) => {
  // State to track loading status when requesting insight
  const [loading, setLoading] = useState(false);

  // Handles click on the "Get Overall Class Insight" button
  const handleInsightClick = async () => {
    setLoading(true);
    await onGetClassInsight();
    setLoading(false);
  };

  return (
    <div className="mb-6 p-6 rounded bg-white dark:bg-slate-700 shadow">
      {/* Display the situation/scenario */}
      <h2 className="text-xl font-semibold mb-2">🧪 Situation</h2>
      <p className="mb-4">{situation}</p>

      {/* Display the main simulation question */}
      <h2 className="text-xl font-semibold mb-2">❓ Question</h2>
      <p className="mb-6">{simulationText}</p>

      {/* Button to fetch AI class insight */}
      <div className="flex gap-4 items-center">
        <button
          onClick={handleInsightClick}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded text-white transition 
            ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {/* Loading spinner while fetching insight */}
          {loading && (
            <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
          )}
          {loading ? 'Loading Insight...' : 'Get Overall Class Insight'}
        </button>
      </div>
    </div>
  );
};

export default SimulationBox;
