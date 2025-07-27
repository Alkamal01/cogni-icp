import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Users, Target, Zap, ArrowRight, CheckCircle, BarChart2, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

interface StepCardProps {
  number: number;
  title: string;
  description: string;
}

// Feature Card Component
const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl dark:shadow-gray-900/30 transition-all duration-300 hover:translate-y-[-5px] border border-gray-100 dark:border-gray-700"
    >
      <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-5 text-white transform rotate-3">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </motion.div>
  );
};

// Step Card Component
const StepCard: React.FC<StepCardProps> = ({ number, title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: number % 2 === 0 ? 30 : -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-primary-500/30">
          {number}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          {title}
        </h3>
        <p className="text-center text-gray-600 dark:text-gray-300 max-w-xs">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

const FeatureSection: React.FC = () => {
  // Define features array
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Personalized AI Tutoring",
      description: "Experience intelligent, one-on-one guidance through AI-powered tutors that adapt in real time to your learning pace, preferences, and performance."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Adaptive Learning Paths",
      description: "Your journey is never static. Our system evolves with your progress — adjusting lessons, content difficulty, and support based on what you know and where you need to grow."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Real-Time Collaborative Learning",
      description: "Learn in global study groups and real-time sessions that promote active peer engagement, shared problem-solving, and diverse perspectives."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Smart Learning Insights",
      description: "We provide deep, actionable analytics on your learning habits — offering nudges, reminders, and recommendations that help you stay on track and get better results."
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Global-Ready Localization",
      description: "We don't just translate — we transform. Lessons are adapted to your region's culture, curriculum, and language, making learning more relatable and effective."
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Verified Progress Tracking",
      description: "Earn verifiable digital badges and reports that reflect your true skills and growth — perfect for showcasing your progress without relying on formal certificates alone."
    }
  ];

  // Define steps array
  const steps = [
    {
      number: 1,
      title: "Sign Up and Create Your Profile",
      description: "Start by creating a free account. Tell us about your learning goals, subjects of interest, preferred learning style, and schedule."
    },
    {
      number: 2,
      title: "Meet Your AI Tutor",
      description: "Generate a personalized AI tutor with a unique name, personality, and teaching style tailored to your needs. You can customize it as you grow."
    },
    {
      number: 3,
      title: "Get Your Personalized Learning Plan",
      description: "Based on your input, your AI tutor will create a learning roadmap—complete with courses, topics, quizzes, and suggested study times."
    },
    {
      number: 4,
      title: "Learn the Way That Works for You",
      description: "Access interactive lessons in text, audio, video, and visual formats. Engage with voice-based learning, quizzes, AI-generated videos, and more."
    },
    {
      number: 5,
      title: "Collaborate and Connect",
      description: "Join study groups or create your own. Collaborate on a shared whiteboard, chat with peers, and use the integrated AI assistant during group sessions."
    },
    {
      number: 6,
      title: "Track Progress and Earn Achievements",
      description: "Monitor your growth with dashboards, badges, and learning streaks. Complete challenges and unlock certifications as you go."
    }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase"
            >
              Features
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
            >
              Designed for Optimal Learning
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300"
            >
              Our platform combines cutting-edge AI with researched learning methodologies to deliver an unparalleled educational experience.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase"
            >
              How It Works
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
            >
              Your Learning Journey in 6 Simple Steps
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300"
            >
              We've streamlined the process to get you learning as quickly and effectively as possible.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <StepCard
                  number={step.number}
                  title={step.title}
                  description={step.description}
                />
                {index !== steps.length - 1 && (
                  <div className="flex justify-center items-center">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="text-primary-500 dark:text-primary-400"
                    >
                      <span className="block lg:hidden text-3xl animate-bounce">↓</span>
                      <span className="hidden lg:block text-3xl animate-bounce">→</span>
                    </motion.div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* AI Tutor Chat Interface Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="order-2 lg:order-1"
            >
              <span className="text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase">
                Personalized AI Tutoring
              </span>
              <h2 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Learn Directly from Your Personal AI Tutor
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                Experience interactive learning sessions with our adaptive AI tutors that respond to your questions, provide detailed explanations, and guide you through complex topics.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Ask questions in natural language",
                  "Receive personalized explanations",
                  "Practice with adaptive exercises",
                  "Get immediate feedback on your work",
                  "Track your progress with Agentic AI",
                  "Access content in multiple languages",
                  "Earn blockchain-verified certificates"
                ].map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="flex items-start"
                  >
                    <span className="flex-shrink-0 h-6 w-6 text-primary-500 dark:text-primary-400">
                      <CheckCircle className="h-6 w-6" />
                    </span>
                    <span className="ml-3 text-gray-600 dark:text-gray-300">{feature}</span>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-10">
                <Link to="/register" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors">
                  Try it yourself <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="order-1 lg:order-2"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mr-3">
                      <Brain className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Math Tutor</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Online now</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    I need help understanding the quadratic formula.
                  </p>
                </div>
                
                <div className="bg-primary-50 dark:bg-primary-900/30 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    The quadratic formula is used to solve quadratic equations of the form ax² + bx + c = 0. The formula is:
                  </p>
                  <div className="my-3 text-center text-gray-800 dark:text-gray-200 font-medium">
                    x = (-b ± √(b² - 4ac)) / 2a
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    Let me walk you through a simple example. Would you like me to solve a specific problem for you?
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    Yes, can you solve 2x² - 5x + 2 = 0?
                  </p>
                </div>
                
                <div className="mt-4">
                  <div className="flex rounded-md shadow-sm">
                    <input
                      type="text"
                      className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-gray-400"
                      placeholder="Type your question..."
                    />
                    <button className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeatureSection;
