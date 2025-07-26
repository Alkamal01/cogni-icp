import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FAQSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // FAQ data
  const faqs = [
    {
      question: "How does CogniEdufy's AI tutoring work?",
      answer: "Our AI tutors use advanced machine learning to understand your learning style, strengths, and areas for improvement. They adapt in real-time to provide personalized explanations, practice questions, and feedback tailored specifically to your needs."
    },
    {
      question: "Can I access CogniEdufy on any device?",
      answer: "Yes! CogniEdufy is available on desktops, laptops, tablets, and smartphones. Our responsive platform ensures a seamless experience across all your devices, allowing you to continue your learning journey wherever you are."
    },
    {
      question: "What subjects and topics are covered?",
      answer: "We cover a wide range of subjects including mathematics, sciences, programming, languages, and humanities. Our content is regularly updated and expanded based on user needs and educational standards."
    },
    {
      question: "How does collaborative learning work?",
      answer: "Our platform connects you with peers studying similar topics. You can form study groups, work on projects together, share resources, and participate in group discussions. Our AI facilitates these interactions to ensure they're productive and insightful."
    },
    {
      question: "Is my data secure and private?",
      answer: "Absolutely. We take data privacy extremely seriously. Your personal information and learning data are encrypted and stored securely. We never share your information with third parties without your explicit consent, and you maintain ownership of your data."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Find answers to common questions about CogniEdufy
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="mb-6"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="flex justify-between items-center w-full text-left px-6 py-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <span className="text-lg font-medium text-gray-900 dark:text-white">{faq.question}</span>
                <svg 
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 transform transition-transform duration-300 ${activeIndex === index ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeIndex === index && (
                <div className="mt-2 px-6 py-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Have more questions? We're here to help.
          </p>
          <Link 
            to="/contact" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-300"
          >
            Contact Us
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
