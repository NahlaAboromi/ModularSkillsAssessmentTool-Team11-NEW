import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 *  THis component Renders a link that opens a modal with information about SEL (Social and Emotional Learning).
 * The modal explains the five core SEL competencies, supports dark/light themes, and can be closed by the user.*
 */

const AboutModal = () => {
   // State to control modal visibility
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
       {/* Link to open the modal */}
      <Link
        to="#"
        onClick={(e) => {
          e.preventDefault();
          setShowModal(true);
        }}
        className="hover:text-blue-500"
      >
        About SEL
      </Link>
      {/* Modal overlay and content */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl w-11/12 max-w-md text-slate-800 dark:text-white">
            <h2 className="text-xl font-bold mb-4"> About SEL</h2>
            <p className="text-sm leading-6">
              Social and Emotional Learning (SEL) is the process through which individuals develop
              self-awareness, self-control, interpersonal skills, and decision-making abilities.
              SEL is essential for success in school, work, and life.
            </p>
               {/* List of SEL competencies */}
            <ul className="pl-5 mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-100">
            <li className="flex items-center gap-2">
              🌟 <span>Self-awareness</span>
            </li>
            <li className="flex items-center gap-2">
              👥 <span>Social-awareness</span>
            </li>
            <li className="flex items-center gap-2">
              🧘 <span>Self-management</span>
            </li>
            <li className="flex items-center gap-2">
              🤝 <span>Relationship Skills</span>
            </li>
            <li className="flex items-center gap-2">
              🧠 <span>Responsible decision-making</span>
            </li>
          </ul>
            <div className="mt-6 text-right">
               {/* Close button */}
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

export default AboutModal;
