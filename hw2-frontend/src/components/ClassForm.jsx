import React, { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { useNotifications } from '../hooks/NotificationsContext';

/**
 * ClassForm Component
 * This component implements a multi-step form for teachers to create a new class.
 */
// Main component for creating a class
const ClassForm = () => {
  const { user } = useContext(UserContext); // Get current user from context
  const { fetchNotifications } = useNotifications(); // Get notifications fetcher

  // State for all form fields
  const [formData, setFormData] = useState({
    classCode: '', // Class code input
    className: '', // Class name input
    topic: '', // Selected topic from list
    customTopic: '', // Custom topic input
    useCustomTopic: false // Whether to use a custom topic
  });

  // State for validation errors
  const [errors, setErrors] = useState({
    classCode: false, // Error for class code
    className: false, // Error for class name
    topic: false // Error for topic
  });

  // State for step management and loading
  const [step, setStep] = useState(1); // Step in the process (1: details, 2: AI, 3: approval)
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [loadingAction, setLoadingAction] = useState(''); // Which action is loading
  const [situation, setSituation] = useState(''); // AI-generated situation
  const [question, setQuestion] = useState(''); // AI-generated question
  const [generatedSituations, setGeneratedSituations] = useState(0); // Number of generated situations
  const [isTransitioning, setIsTransitioning] = useState(false); // For step transitions

  // List of CASEL topics (empty as per requirements)
  const caselTopics = [];

  // List of additional topics for selection
  const additionalTopics = [
    { value: 'teamwork', label: 'Teamwork' },
    { value: 'conflict-resolution', label: 'Conflict Resolution' },
    { value: 'empathy', label: 'Empathy' },
    { value: 'emotional-intelligence', label: 'Emotional Intelligence' },
    { value: 'communication', label: 'Communication Skills' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'stress-management', label: 'Stress Management' },
    { value: 'cultural-awareness', label: 'Cultural Awareness' }
  ];

  // Show a green toast for success
  const showSuccessToast = (message) => {
    const toast = document.createElement('div'); // Create a div for the toast
    toast.className = 'fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg animate-bounce z-50'; // Style the toast
    toast.innerText = message; // Set the message
    document.body.appendChild(toast); // Add to DOM
    setTimeout(() => { toast.remove(); }, 3000); // Remove after 3 seconds
  };

  // Show a red toast for errors
  const showErrorToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-5 right-5 bg-red-500 text-white px-4 py-2 rounded shadow-lg animate-bounce z-50';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
  };

  // Handle changes in text input fields
  const handleInputChange = (e) => {
    const { id, value } = e.target; // Get field id and value
    setFormData({ ...formData, [id]: value }); // Update the field in formData
    if (errors[id]) setErrors({ ...errors, [id]: false }); // Clear error if present
  };

  // Handle changes in the topic dropdown
  const handleTopicChange = (e) => {
    const { value } = e.target; // Get selected value
    setFormData({ ...formData, topic: value }); // Update topic in formData
    if (errors.topic) setErrors({ ...errors, topic: false }); // Clear topic error if present
  };

  // Validate required fields in the first step
  const validateFirstStep = () => {
    const classCode = formData.classCode.trim(); // Remove whitespace
    const className = formData.className.trim();
    // Use either custom topic or selected topic
    const selectedTopic = formData.useCustomTopic 
      ? formData.customTopic.trim() 
      : formData.topic;

    // Build errors object
    const newErrors = {
      classCode: !classCode,
      className: !className,
      topic: !selectedTopic
    };

    setErrors(newErrors); // Update errors

    // If any error, show toast and return false
    if (Object.values(newErrors).some(error => error)) {
      showErrorToast('Please fill in all required fields.');
      return false;
    }
    return true; // All fields valid
  };

  // Generate an AI situation and question
  const generateSituation = async () => {
    if (step === 1 && !validateFirstStep()) return; // Validate before proceeding

    setIsLoading(true); // Set loading
    setLoadingAction('generating'); // Set action
    // Determine which topic to use
    const selectedTopic = formData.useCustomTopic 
      ? formData.customTopic.trim() 
      : formData.topic;

    try {
      // Call backend to generate situation
      const response = await fetch('/api/claude/generate-situation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          maxWords: 50, // Limit to 50 words
          previousSituations: generatedSituations // For variety
        }),
      });

      const data = await response.json(); // Parse response

      if (!response.ok) {
        throw new Error(data.message || 'Error generating situation');
      }

      setSituation(data.situation); // Set the generated situation
      setQuestion(data.question); // Set the generated question
      setGeneratedSituations(prev => prev + 1); // Increment counter
      
      // If on step 1, go to step 2
      if (step === 1) {
        setIsTransitioning(true); // Start transition
        setTimeout(() => {
          setStep(2); // Move to next step
          setIsTransitioning(false); // End transition
        }, 500); // 0.5s delay
      }
    } catch (error) {
      console.error('❌ Error generating situation:', error); // Log error
      showErrorToast(`Failed to generate situation: ${error.message}`); // Show error toast
    } finally {
      setIsLoading(false); // End loading
      setLoadingAction(''); // Clear action
    }
  };

  // Create the class in the backend
  const createClass = async () => {
    setIsLoading(true); // Set loading
    setLoadingAction('creating'); // Set action

    try {
      const classCode = formData.classCode.trim();
      const className = formData.className.trim();
      const selectedTopic = formData.useCustomTopic 
        ? formData.customTopic.trim() 
        : formData.topic;

      // Send class creation request
      const classResponse = await fetch('/api/classes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classCode,
          className,
          subject: selectedTopic,
          situation,
          question,
          createdBy: user.id
        }),
      });

      const classData = await classResponse.json(); // Parse response

      if (!classResponse.ok) {
        throw new Error(classData.message || 'Error creating class');
      }

      // Notify instructor of success
      await fetch('/api/notifications/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: user.id,
          type: 'success',
          title: `Class ${formData.classCode} created successfully`,
          content: `A situational question about "${selectedTopic}" is ready for students.`,
          time: new Date().toLocaleString(),
          read: false
        }),
      });
      
      await fetchNotifications(); // Refresh notifications
      showSuccessToast('Class created successfully!'); // Show success toast
      resetForm(); // Reset form
    } catch (error) {
      console.error('❌ Error creating class:', error); // Log error
      
      // Notify instructor of failure
      await fetch('/api/notifications/create',  {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: user.id,
          type: 'warning',
          title: `Failed to create class: ${error.message}`,
          time: new Date().toLocaleString(),
          read: false
        }),
      });
      
      await fetchNotifications(); // Refresh notifications
      showErrorToast(`Error: ${error.message}`); // Show error toast
    } finally {
      setIsLoading(false); // End loading
      setLoadingAction(''); // Clear action
    }
  };

  // Reset all form fields and state
  const resetForm = () => {
    setFormData({
      classCode: '',
      className: '',
      topic: '',
      customTopic: '',
      useCustomTopic: false
    });
    setErrors({
      classCode: false,
      className: false,
      topic: false
    });
    setStep(1);
    setSituation('');
    setQuestion('');
    setGeneratedSituations(0);
    setLoadingAction('');
  };

  // Spinner component for loading indication
  const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  // Render the form UI
  return (
    <div className={`w-full transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          {/* Step 1 indicator */}
          <div className={`text-sm font-medium ${step >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
            1. Class Details
          </div>
          {/* Progress bar */}
          <div className="flex-1 h-0.5 mx-4 bg-gray-200 dark:bg-gray-700">
            <div 
              className="h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300" 
              style={{width: step === 1 ? '50%' : '100%'}}
            ></div>
          </div>
          {/* Step 2 indicator */}
          <div className={`text-sm font-medium ${step >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
            2. Review & Create
          </div>
        </div>
      </div>

      {/* Step 1 - Class details and topic form */}
      {step === 1 && (
        <form id="classForm" className="w-full space-y-4">
          <div className="mb-4">
            {/* Class code input */}
            <label className="block mb-1 font-medium">Class Code:</label>
            <input
              type="text"
              id="classCode"
              className={`w-full p-2 border rounded dark:bg-slate-700 dark:text-white ${
                errors.classCode ? 'border-red-500 bg-red-50 dark:bg-red-900' : ''
              }`}
              placeholder="e.g. SEL2025-A"
              value={formData.classCode}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div>
            {/* Class name input */}
            <label className="block mb-1 font-medium">Class Name:</label>
            <input
              type="text"
              id="className"
              className={`w-full p-2 border rounded dark:bg-slate-700 dark:text-white ${
                errors.className ? 'border-red-500 bg-red-50 dark:bg-red-900' : ''
              }`}
              placeholder="e.g. Social Emotional Learning 101"
              value={formData.className}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div>
            {/* Topic selection */}
            <label className="block mb-1 font-medium">Select Topic:</label>
            <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              Choose from our topic list or create your own custom topic
            </div>
            
            {/* Topic selection tabs */}
            <div className="flex mb-4 border-b">
              {/* Tab for topic list */}
              <button
                type="button"
                onClick={() => setFormData({...formData, useCustomTopic: false})}
                className={`py-2 px-4 ${!formData.useCustomTopic 
                  ? 'border-b-2 border-blue-500 font-medium text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'}`}
                disabled={isLoading}
              >
                Select from List
              </button>
              {/* Tab for custom topic */}
              <button
                type="button"
                onClick={() => setFormData({...formData, useCustomTopic: true})}
                className={`py-2 px-4 ${formData.useCustomTopic 
                  ? 'border-b-2 border-blue-500 font-medium text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'}`}
                disabled={isLoading}
              >
                Enter Custom Topic
              </button>
            </div>
            
            {/* Topic dropdown or custom input */}
            {!formData.useCustomTopic ? (
              <select
                id="topic"
                className={`w-full p-2 border rounded dark:bg-slate-700 dark:text-white ${
                  errors.topic ? 'border-red-500 bg-red-50 dark:bg-red-900' : ''
                }`}
                value={formData.topic}
                onChange={handleTopicChange}
                disabled={isLoading}
              >
                <option value="">-- Select a topic --</option>
                {/* Additional topics group */}
                <optgroup label="Topics">
                  {additionalTopics.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              </select>
            ) : (
              <div>
                {/* Custom topic input */}
                <input
                  type="text"
                  id="customTopic"
                  className={`w-full p-2 border rounded dark:bg-slate-700 dark:text-white ${
                    errors.topic ? 'border-red-500 bg-red-50 dark:bg-red-900' : ''
                  }`}
                  placeholder="Enter any topic (e.g., 'Public Speaking Anxiety', 'Cross-cultural Communication')"
                  value={formData.customTopic}
                  onChange={(e) => {
                    setFormData({...formData, customTopic: e.target.value});
                    if (errors.topic) setErrors({...errors, topic: false});
                  }}
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Enter any social-emotional topic you'd like the AI to create a situation about
                </p>
              </div>
            )}
          </div>

          {/* How it works explanation */}
          <div className="mt-6 bg-blue-50 dark:bg-slate-600 p-4 rounded border border-blue-200 dark:border-slate-500">
            <h3 className="font-medium text-blue-800 dark:text-blue-300">How it works:</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              After entering class details, our AI will generate a short scenario with a question.
              You'll be able to review and regenerate if needed before creating the class.
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-1">
              <li>AI generates a short situational scenario (about 50 words)</li>
              <li>It creates an open-ended question for students</li>
              <li>Student responses will be analyzed using the CASEL 5 framework</li>
              <li>You'll receive detailed reports on each student's social-emotional competencies</li>
            </ul>
          </div>

          {/* Generate situation button */}
          <button
            type="button"
            onClick={generateSituation}
            className={`mt-6 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full flex justify-center items-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading && loadingAction === 'generating' ? (
              <>
                <LoadingSpinner />
                <span>Generating Situation...</span>
              </>
            ) : (
              'Generate Situation'
            )}
          </button>
        </form>
      )}

      {/* Step 2 - Review situation and approve */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Review header */}
          <h3 className="text-lg font-semibold mb-2">Review Situation</h3>
          
          {/* Situation and question display */}
          <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow border border-gray-200 dark:border-slate-600">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Situation:</h4>
            <div className="min-h-24">
              {situation ? (
                <p className="text-gray-800 dark:text-white mb-4">{situation}</p>
              ) : (
                <p className="text-gray-400">No situation generated yet.</p>
              )}
            </div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Question:</h4>
            <div className="min-h-12">
              {question ? (
                <p className="text-gray-800 dark:text-white">{question}</p>
              ) : (
                <p className="text-gray-400">No question generated yet.</p>
              )}
            </div>
          </div>

          {/* Regenerate situation button */}
          <button
            type="button"
            onClick={generateSituation}
            className={`bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 flex items-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading && loadingAction === 'generating' ? (
              <>
                <LoadingSpinner />
                <span>Regenerating...</span>
              </>
            ) : (
              'Regenerate Situation'
            )}
          </button>

          {/* Approve and create class button */}
          <button
            type="button"
            onClick={createClass}
            className={`bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 w-full flex justify-center items-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading && loadingAction === 'creating' ? (
              <>
                <LoadingSpinner />
                <span>Creating Class...</span>
              </>
            ) : (
              'Approve & Create Class'
            )}
          </button>

          {/* Back button */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-blue-600 hover:underline mt-2"
            disabled={isLoading}
          >
            Back to Edit Details
          </button>
        </div>
      )}
    </div>
  );
};

export default ClassForm;
