import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const Survey = () => {
  const [responses, setResponses] = useState({
    'How do you prefer to read text-based content?': [],
    'What type of text content do you find most engaging?': [],
    'How do you prefer to see complex ideas presented in text?': [],
    'Do you prefer content that includes questions or quizzes to test your understanding?': [],
    'How often do you prefer visual aids (charts, images) when learning?': [],
    'Do you prefer video explanations along with text-based content?': [],
  });

  const [otherResponses, setOtherResponses] = useState({}); // State to track 'Other' responses
  const [loading, setLoading] = useState(false); // State to manage loading

  const handleOptionChange = (question, option) => {
    setResponses((prevResponses) => {
      const currentResponse = prevResponses[question];
      if (currentResponse.includes(option)) {
        return { ...prevResponses, [question]: currentResponse.filter((item) => item !== option) };
      } else {
        return { ...prevResponses, [question]: [...currentResponse, option] };
      }
    });
  };

  const handleOtherChange = (question, value) => {
    setOtherResponses((prev) => ({ ...prev, [question]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    const title = "Personalisation";

    try {
      const token = Cookies.get('access_token');

      // Include other responses in the main responses object if 'Other' is selected
      const finalResponses = {};
      Object.keys(responses).forEach((question) => {
        const response = responses[question];
        if (response.includes('Other')) {
          response.splice(response.indexOf('Other'), 1); 
          if (otherResponses[question]) {
            response.push(otherResponses[question]); 
          }
        }
        finalResponses[question] = response;
      });

      const response = await axios.post(
        '/api/surveys',
        { title, responses: finalResponses },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data.message);
      window.location.href = '/chat';
    } catch (err) {
      console.error('Error submitting survey:', err.response?.data?.message);
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="relative flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 w-full max-w-4xl bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-200">Personalisation</h2>
          <p className="text-center text-gray-500">Help us understand your preferences for content learning</p>
          <form className="space-y-8" onSubmit={handleSubmit}>
            {Object.keys(responses).map((question) => (
              <div key={question} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{question}</h3>
                <div className="space-y-2">
                  {/* Options for each question */}
                  {question === 'How do you prefer to read text-based content?' && (
                    ['In long articles', 'Summarized points', 'Step-by-step guides', 'Other'].map((option) => (
                      <label className="flex items-center" key={option}>
                        <input
                          type="checkbox"
                          name={question}
                          value={option}
                          checked={responses[question].includes(option)}
                          onChange={() => handleOptionChange(question, option)}
                          className="form-checkbox h-4 w-4 text-blue-500"
                        />
                        <span className="ml-2 text-gray-800 dark:text-gray-200">{option}</span>
                        {option === 'Other' && responses[question].includes(option) && (
                          <input
                            type="text"
                            placeholder="Please specify"
                            value={otherResponses[question] || ''}
                            onChange={(e) => handleOtherChange(question, e.target.value)}
                            className="ml-4 border border-gray-300 dark:border-gray-700 rounded p-2 text-gray-800 dark:text-gray-200 shadow-md focus:outline-none focus:ring focus:ring-blue-500"
                          />
                        )}
                      </label>
                    ))
                  )}

                  {question === 'What type of text content do you find most engaging?' && (
                    ['Informative articles', 'Narrative storytelling', 'Case studies', 'Interactive content', 'Other'].map((option) => (
                      <label className="flex items-center" key={option}>
                        <input
                          type="checkbox"
                          name={question}
                          value={option}
                          checked={responses[question].includes(option)}
                          onChange={() => handleOptionChange(question, option)}
                          className="form-checkbox h-4 w-4 text-blue-500"
                        />
                        <span className="ml-2 text-gray-800 dark:text-gray-200">{option}</span>
                        {option === 'Other' && responses[question].includes(option) && (
                          <input
                            type="text"
                            placeholder="Please specify"
                            value={otherResponses[question] || ''}
                            onChange={(e) => handleOtherChange(question, e.target.value)}
                            className="ml-4 border border-gray-300 dark:border-gray-700 rounded p-2 text-gray-800 dark:text-gray-200 shadow-md focus:outline-none focus:ring focus:ring-blue-500"
                          />
                        )}
                      </label>
                    ))
                  )}

                  {question === 'How do you prefer to see complex ideas presented in text?' && (
                    ['Through examples', 'With visual aids', 'Using metaphors or analogies', 'Detailed breakdown', 'Other'].map((option) => (
                      <label className="flex items-center" key={option}>
                        <input
                          type="checkbox"
                          name={question}
                          value={option}
                          checked={responses[question].includes(option)}
                          onChange={() => handleOptionChange(question, option)}
                          className="form-checkbox h-4 w-4 text-blue-500"
                        />
                        <span className="ml-2 text-gray-800 dark:text-gray-200">{option}</span>
                        {option === 'Other' && responses[question].includes(option) && (
                          <input
                            type="text"
                            placeholder="Please specify"
                            value={otherResponses[question] || ''}
                            onChange={(e) => handleOtherChange(question, e.target.value)}
                            className="ml-4 border border-gray-300 dark:border-gray-700 rounded p-2 text-gray-800 dark:text-gray-200 shadow-md focus:outline-none focus:ring focus:ring-blue-500"
                          />
                        )}
                      </label>
                    ))
                  )}

                  {question === 'Do you prefer content that includes questions or quizzes to test your understanding?' && (
                    ['Yes, frequently', 'Sometimes', 'Rarely', 'Not at all', 'Other'].map((option) => (
                      <label className="flex items-center" key={option}>
                        <input
                          type="checkbox"
                          name={question}
                          value={option}
                          checked={responses[question].includes(option)}
                          onChange={() => handleOptionChange(question, option)}
                          className="form-checkbox h-4 w-4 text-blue-500"
                        />
                        <span className="ml-2 text-gray-800 dark:text-gray-200">{option}</span>
                        {option === 'Other' && responses[question].includes(option) && (
                          <input
                            type="text"
                            placeholder="Please specify"
                            value={otherResponses[question] || ''}
                            onChange={(e) => handleOtherChange(question, e.target.value)}
                            className="ml-4 border border-gray-300 dark:border-gray-700 rounded p-2 text-gray-800 dark:text-gray-200 shadow-md focus:outline-none focus:ring focus:ring-blue-500"
                          />
                        )}
                      </label>
                    ))
                  )}

                  {question === 'How often do you prefer visual aids (charts, images) when learning?' && (
                    ['Frequently', 'Sometimes', 'Rarely', 'Never', 'Other'].map((option) => (
                      <label className="flex items-center" key={option}>
                        <input
                          type="checkbox"
                          name={question}
                          value={option}
                          checked={responses[question].includes(option)}
                          onChange={() => handleOptionChange(question, option)}
                          className="form-checkbox h-4 w-4 text-blue-500"
                        />
                        <span className="ml-2 text-gray-800 dark:text-gray-200">{option}</span>
                        {option === 'Other' && responses[question].includes(option) && (
                          <input
                            type="text"
                            placeholder="Please specify"
                            value={otherResponses[question] || ''}
                            onChange={(e) => handleOtherChange(question, e.target.value)}
                            className="ml-4 border border-gray-300 dark:border-gray-700 rounded p-2 text-gray-800 dark:text-gray-200 shadow-md focus:outline-none focus:ring focus:ring-blue-500"
                          />
                        )}
                      </label>
                    ))
                  )}

                  {question === 'Do you prefer video explanations along with text-based content?' && (
                    ['Yes', 'No', 'Sometimes', 'Other'].map((option) => (
                      <label className="flex items-center" key={option}>
                        <input
                          type="checkbox"
                          name={question}
                          value={option}
                          checked={responses[question].includes(option)}
                          onChange={() => handleOptionChange(question, option)}
                          className="form-checkbox h-4 w-4 text-blue-500"
                        />
                        <span className="ml-2 text-gray-800 dark:text-gray-200">{option}</span>
                        {option === 'Other' && responses[question].includes(option) && (
                          <input
                            type="text"
                            placeholder="Please specify"
                            value={otherResponses[question] || ''}
                            onChange={(e) => handleOtherChange(question, e.target.value)}
                            className="ml-4 border border-gray-300 dark:border-gray-700 rounded p-2 text-gray-800 dark:text-gray-200 shadow-md focus:outline-none focus:ring focus:ring-blue-500"
                          />
                        )}
                      </label>
                    ))
                  )}
                </div>
              </div>
            ))}
            <button
              type="submit"
              className="w-full py-3 text-white bg-blue-500 rounded-md hover:bg-blue-600"
              disabled={loading} // Disable button while loading
            >
              {loading ? 'Loading...' : 'Submit Survey'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Survey;