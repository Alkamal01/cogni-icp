// Quiz.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
const Quiz = ({ topicId }) => {
    const [quizData, setQuizData] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    useEffect(() => {
        // Fetch the quiz data for the topic
        const fetchQuizData = async () => {
            try {
                const response = await axios.post(`/topics/${topicId}/generate_quiz`);
                setQuizData(response.data.quiz);
                setLoading(false);
            }
            catch (error) {
                console.error("Error fetching quiz data:", error);
                setLoading(false);
            }
        };
        fetchQuizData();
    }, [topicId]);
    const handleAnswerSelect = (questionIndex, answer) => {
        setUserAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionIndex]: answer,
        }));
    };
    const handleSubmit = async () => {
        try {
            const response = await axios.post(`/topics/${topicId}/submit_quiz`, {
                answers: userAnswers,
            });
            setFeedback(response.data.feedback);
            setSubmitted(true);
        }
        catch (error) {
            console.error("Error submitting quiz:", error);
        }
    };
    return (<div className="p-8 bg-[#fff] text-[#000053] w-full h-full rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-4 text-center">Quiz</h2>
      {loading ? (<p className="text-center">Loading quiz...</p>) : (<>
          {submitted ? (<div className="mt-8 text-center">
              <h3 className="text-2xl font-semibold mb-4">Quiz Feedback</h3>
              <p className="mb-4">{feedback}</p>
              <p className="text-lg font-medium">Points Awarded: {feedback.points}</p>
              <p className="text-lg font-medium">Badges Earned: {feedback.badges?.join(', ') || 'None'}</p>
            </div>) : (<div>
              <h3 className="text-2xl font-semibold mb-4">Answer the Questions</h3>
              {quizData.map((question, index) => (<div key={index} className="mb-6 p-4 bg-[#1a1a5e] rounded-lg shadow-md">
                  <p className="text-lg font-medium">{question.question}</p>
                  <div className="mt-2">
                    {question.options.map((option, optionIndex) => (<label key={optionIndex} className="block mt-1 p-2 bg-[#2a2a6e] rounded cursor-pointer hover:bg-gray-700 transition">
                        <input type="radio" name={`question-${index}`} value={option} checked={userAnswers[index] === option} onChange={() => handleAnswerSelect(index, option)} className="mr-2"/>
                        {option}
                      </label>))}
                  </div>
                </div>))}
              <button onClick={handleSubmit} className="bg-gray-500 hover:bg-gray-400 text-white py-2 px-6 rounded-lg shadow-lg transition mt-4">
                Submit Answers
              </button>
            </div>)}
        </>)}
    </div>);
};
export default Quiz;
