import React, { useState, useRef, useEffect, useContext } from 'react';
import { ThemeContext } from '../DarkLightMood/ThemeContext';
/**
 * AIChat component provides an AI-powered chat interface for teachers.
 * It supports dark/light themes and allows sending messages to an AI backend.
 */
const AIChat = ({ teacherId }) => {
  // State to control visibility of the chat box
 const [showBox, setShowBox] = useState(false);
  // State for the current input text
  const [input, setInput] = useState('');
  // Get current theme from context ('dark' or 'light')
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  // Reference to the messages container for scrolling
  const chatRef = useRef(null);
  // Initial AI greeting message shown on chat open
  const initialMessage = {
    role: 'ai',
    content: `👋 Hi! I'm your AI assistant. You can ask me anything about your students, classes — or general education topics!

Examples:
- "What’s the summary for Class B?"
- "Which students are struggling?"
- "What is SEL and why is it important?"`
  };
  // State holding the list of chat messages
  const [messages, setMessages] = useState([initialMessage]);
  const [loading, setLoading] = useState(false);

  const toggleChatBox = () => setShowBox(!showBox);
  // Close chat and reset messages to initial state
  const closeChat = () => {
    setShowBox(false);
    setMessages([initialMessage]);
  };
  // Scroll chat to the bottom to show latest messages
  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };
   // Scroll to bottom whenever messages or loading state changes

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);
  
  /**
   * Handles sending user input to the AI backend and updating messages.
   * - Prevents sending empty messages.
   * - Updates state with user message and AI response.
   * - Handles errors gracefully.
   */
  const handleSend = async () => {
    if (!input.trim()) return;
    // Append user's message to the chat
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
        // Send messages to AI backend API
        const res = await fetch('/api/claude/chat-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId,
          messages: newMessages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          }))
        })
      });

      const data = await res.json();
      // Use AI response or fallback error message
      const aiReply = data.success ? data.response : 'Something went wrong.';
      setMessages([...newMessages, { role: 'ai', content: aiReply }]);
    } catch {
      setMessages([...newMessages, { role: 'ai', content: 'Error contacting AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Typing dots animation styles */}
      <style>{`
        .dot {
          width: 6px;
          height: 6px;
          margin-right: 4px;
          background-color: currentColor;
          border-radius: 50%;
          display: inline-block;
          animation: jump 1.4s infinite ease-in-out both;
        }
        .dot1 { animation-delay: -0.32s; }
        .dot2 { animation-delay: -0.16s; }
        .dot3 { animation-delay: 0; }

        @keyframes jump {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>

           {/* Floating button to open/close chat */}
      <button
        onClick={toggleChatBox}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        title="Ask the AI"
      >
        💬
      </button>

      {/* Chat box container */}
      {showBox && (
        <div className={`fixed bottom-24 right-6 w-96 max-h-[80vh] flex flex-col border rounded-lg shadow-lg z-50 ${isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-gray-900 border-gray-300'}`}>
          
         {/* Header with title and close button */}
          <div className={`flex items-center justify-between px-4 py-2 border-b ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
            <h4 className="text-lg font-semibold">Ask the AI</h4>
            <button
              onClick={closeChat}
              className={`text-lg font-bold rounded-full w-8 h-8 flex items-center justify-center transition-colors ${
                isDark
                  ? 'text-pink-400 hover:text-pink-500 bg-slate-700 hover:bg-slate-600'
                  : 'text-red-500 hover:text-red-600 bg-white hover:bg-gray-100'
              }`}
            >
              &times;
            </button>


          </div>

          {/* Messages area with auto-scroll */}
          <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
            {messages.map((msg, index) => (
              <div key={index} className={`p-2 rounded-md text-sm whitespace-pre-wrap max-w-[85%] ${msg.role === 'user' ? 'bg-blue-600 text-white self-end ml-auto' : isDark ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.content}
              </div>
            ))}

            {/* Typing indicator shown while waiting for AI */}
            {loading && (
              <div className={`p-2 rounded-md text-sm max-w-[85%] inline-flex items-center gap-1 ${isDark ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <strong>AI:</strong>
                <div className="flex ml-2">
                  <span className="dot dot1" />
                  <span className="dot dot2" />
                  <span className="dot dot3" />
                </div>
              </div>
            )}
          </div>

         {/* Input field and send button */}
          <div className={`flex items-center p-3 border-t ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className={`flex-1 border rounded p-2 text-sm mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '...' : 'Ask'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;
