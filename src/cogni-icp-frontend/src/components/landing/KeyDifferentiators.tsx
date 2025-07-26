import React from 'react';
import { motion } from 'framer-motion';
import { Brain, BookOpen, Zap } from 'lucide-react';

const KeyDifferentiators: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-gray-800 dark:to-gray-900" id="differentiators">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            What Makes Us <span className="text-primary-600 dark:text-primary-400">Unique</span>
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our platform is built on two groundbreaking technologies that set us apart
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Agentic AI Differentiator */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8 border border-gray-100 dark:border-gray-700 relative overflow-hidden group"
          >
            <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-r from-transparent to-primary-50 dark:from-transparent dark:to-primary-900/10 group-hover:opacity-100 opacity-0 transition-opacity duration-300" />
            
            <div className="flex items-start space-x-4 md:space-x-5">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 md:h-16 md:w-16 rounded-md bg-primary-600 dark:bg-primary-700 text-white">
                  <Brain className="h-6 w-6 md:h-8 md:w-8" />
                </div>
              </div>
              <div className="relative">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">Adaptive Intelligence That Grows With You</h3>
                <p className="text-base md:text-lg text-gray-600 dark:text-gray-300">
                  CogniEdufy uses cutting-edge AI to create a learning experience that evolves with each learner. The system doesn't just deliver content — it observes how you learn, identifies when you need help, and adjusts the journey to suit your unique pace and style. It's like having a smart tutor that learns you.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start">
                    <Zap className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">Real-time personalization</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">Timely, tailored learning support</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">Smart adjustments to learning pace and content</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
          
          {/* Localization Differentiator */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8 border border-gray-100 dark:border-gray-700 relative overflow-hidden group"
          >
            <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-r from-transparent to-primary-50 dark:from-transparent dark:to-primary-900/10 group-hover:opacity-100 opacity-0 transition-opacity duration-300" />
            
            <div className="flex items-start space-x-4 md:space-x-5">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 md:h-16 md:w-16 rounded-md bg-primary-600 dark:bg-primary-700 text-white">
                  <BookOpen className="h-6 w-6 md:h-8 md:w-8" />
                </div>
              </div>
              <div className="relative">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">Built for Every Learner, Everywhere</h3>
                <p className="text-base md:text-lg text-gray-600 dark:text-gray-300">
                  CogniEdufy isn't one-size-fits-all. Our platform deeply understands the cultural and educational context of different regions. From localized learning materials to region-specific strategies, we make high-quality education feel relevant and accessible — whether you're in Lagos, Nairobi, or Accra.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start">
                    <Zap className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">Aligned with local curricula</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">Culturally relevant content delivery</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">40+ supported languages and dialects</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default KeyDifferentiators; 