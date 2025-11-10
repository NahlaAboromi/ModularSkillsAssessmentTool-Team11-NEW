import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

/**
 * SimulationChart
 *
 * This component renders a bar chart visualization of SEL competencies for a single simulation attempt.
 * It uses the Recharts library, which provides declarative, composable chart components for React[1][4][5].
 * Features:
 * - Shows a header with simulation number and overall score.
 * - Displays a responsive bar chart for five SEL competencies.
 * - Custom tooltip shows score details on hover.
 * - Adapts grid and text colors for dark/light mode.
 */
const SimulationChart = ({ simulation, index, isDark }) => {
  // Define color palette for bars (cycle through if more than 5)
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
  // Chart grid and text colors based on theme
  const gridColor = isDark ? '#64748b' : '#e2e8f0';
  const textColor = isDark ? '#e2e8f0' : '#475569';

  /**
   * CustomTooltip
   * Renders a styled tooltip with competency name and score when hovering over a bar.
   */
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg border shadow-none ${
          isDark 
            ? 'bg-slate-700 border-slate-600 text-white' 
            : 'bg-white border-gray-200 text-gray-800'
        }`}>
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}/5
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Prepare data for the chart: array of objects with competency name and score
  const simCompetencies = simulation.analysisResult?.competencies || simulation.analysisResult || {};
  const simChartData = [
    { name: 'Self-Awareness', score: simCompetencies.selfAwareness?.score || 0 },
    { name: 'Self-Management', score: simCompetencies.selfManagement?.score || 0 },
    { name: 'Social Awareness', score: simCompetencies.socialAwareness?.score || 0 },
    { name: 'Relationship Skills', score: simCompetencies.relationshipSkills?.score || 0 },
    { name: 'Decision-Making', score: simCompetencies.responsibleDecisionMaking?.score || 0 }
  ];

  return (
    <div className="mb-6">
      {/* Simulation Header: shows which simulation and overall score */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          📈 Simulation {index + 1} Analysis
        </h3>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            isDark 
              ? 'bg-gradient-to-r from-slate-600 to-slate-500 text-slate-200' 
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-slate-700'
          }`}>
            ⭐ {simulation.analysisResult?.overallScore || 'N/A'}/5
          </span>
        </div>
      </div>
      
      {/* Bar chart for SEL competencies using Recharts */}
      <div className="h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={simChartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            {/* Grid lines */}
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            {/* X axis with competency names */}
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, fill: textColor }} 
              axisLine={{ stroke: textColor }}
              tickLine={{ stroke: textColor }}
            />
            {/* Y axis with scores (0-5) */}
            <YAxis 
              domain={[0, 5]} 
              tick={{ fontSize: 10, fill: textColor }}
              axisLine={{ stroke: textColor }}
              tickLine={{ stroke: textColor }}
            />
            {/* Tooltip on hover, using custom renderer */}
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: 'transparent' }} // No hover background
            />
            {/* Bar for each competency, colored by simulation index */}
            <Bar 
              dataKey="score" 
              fill={colors[index % colors.length]} 
              activeBar={false} // Disable default highlight
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SimulationChart;
