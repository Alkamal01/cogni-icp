import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Brain, Target, CheckCircle } from 'lucide-react';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleLearnMore = () => {
    // Scroll to features section or navigate to about page
    const featuresSection = document.getElementById('differentiators');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/95 min-h-screen flex flex-col justify-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center text-center lg:text-left"
          >
            {/* Main Heading */}
            <div className="mb-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
                <span className="text-blue-600 dark:text-blue-400">Building Knowledge</span>
                <br />
                <span>Through Smart Learning</span>
              </h1>
            </div>
            
            {/* Description */}
            <div className="mb-8">
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                We're revolutionizing education with AI-powered solutions. Join us in 
                creating personalized learning experiences and achieving academic excellence.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.button
                onClick={handleGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 flex items-center justify-center group shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
              
              <motion.button
                onClick={handleLearnMore}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>

          {/* Right Column - Visual Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center lg:justify-center mt-12 lg:mt-0"
          >
            {/* Main Circle */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-[28rem] lg:h-[28rem]">
              {/* Background circles with pulsing animation */}
              <motion.div
                className="absolute inset-0"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/50 dark:to-green-900/50 rounded-full opacity-80"></div>
              </motion.div>
              
              <motion.div
                className="absolute inset-6"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <div className="w-full h-full bg-gradient-to-br from-blue-200 to-green-200 dark:from-blue-800/50 dark:to-green-800/50 rounded-full opacity-60"></div>
              </motion.div>
              
              <motion.div
                className="absolute inset-12"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              >
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-700/50 dark:to-green-700/50 rounded-full"></div>
              </motion.div>
              
              {/* Center logo/icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-36 lg:h-36 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
                  <Brain className="w-12 h-12 sm:w-14 sm:h-14 lg:w-18 lg:h-18 text-white" />
                </div>
              </div>
              
              {/* Floating feature icons */}
              
              {/* AI Tutors */}
              <motion.div 
                className="absolute top-4 right-0 sm:top-6 sm:-right-4 flex items-center space-x-2"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-gray-800 rounded-full shadow-xl flex items-center justify-center border border-gray-100 dark:border-gray-700">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="hidden sm:block bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-200">AI Tutors</p>
                </div>
              </motion.div>

              {/* Study Groups */}
              <motion.div 
                className="absolute bottom-4 left-0 sm:bottom-6 sm:-left-4 flex items-center space-x-2"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-gray-800 rounded-full shadow-xl flex items-center justify-center border border-gray-100 dark:border-gray-700">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                </div>
                <div className="hidden sm:block bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-200">Study Groups</p>
                </div>
              </motion.div>
              
              {/* Gamified Learning */}
              <motion.div 
                className="absolute top-8 left-0 sm:top-12 sm:-left-10 flex items-center space-x-2"
                animate={{ y: [0, -6, 0], x: [0, 4, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-gray-800 rounded-full shadow-xl flex items-center justify-center border border-gray-100 dark:border-gray-700">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                </div>
                <div className="hidden sm:block bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-200">Gamified Learning</p>
                </div>
              </motion.div>

              {/* Learning Paths */}
              <motion.div 
                className="absolute bottom-8 right-0 sm:bottom-12 sm:-right-10 flex items-center space-x-2"
                animate={{ y: [0, 6, 0], x: [0, -4, 0] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.35 }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-gray-800 rounded-full shadow-xl flex items-center justify-center border border-gray-100 dark:border-gray-700">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                </div>
                <div className="hidden sm:block bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-200">Learning Paths</p>
                </div>
              </motion.div>

            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        onClick={handleLearnMore}
      >
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;

