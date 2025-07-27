import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
// import { useTheme } from '../contexts/ThemeContext'; // May not be needed
import LandingHeader from '../components/landing/LandingHeader'; // Import LandingHeader
import Footer from '../components/shared/Footer';
const PricingTier = ({ name, price, description, features, cta, popular = false, delay = 0 }) => (<motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }} className={`relative flex flex-col rounded-2xl border ${popular
        ? 'border-primary-500 shadow-lg shadow-primary-100 dark:shadow-primary-900/20'
        : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 p-8`}>
    {popular && (<div className="absolute -top-5 left-0 right-0 flex justify-center">
        <span className="inline-block px-4 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium">
          Most Popular
        </span>
      </div>)}
    
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{name}</h3>
    <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>
    
    <div className="mb-8">
      <span className="text-4xl font-bold text-gray-900 dark:text-white">{price}</span>
      {price !== 'Free' && <span className="text-gray-500 dark:text-gray-400">/month</span>}
    </div>
    
    <ul className="space-y-4 mb-8 flex-grow">
      {features.map((feature, index) => (<li key={index} className="flex items-start">
          <Check className="h-5 w-5 text-primary-500 dark:text-primary-400 mr-3 flex-shrink-0 mt-0.5"/>
          <span className="text-gray-600 dark:text-gray-300">{feature}</span>
        </li>))}
    </ul>
    
    <Link to="/register" className={`inline-flex justify-center items-center px-6 py-3 rounded-md text-base font-medium shadow-sm ${popular
        ? 'bg-primary-600 hover:bg-primary-700 text-white'
        : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600'} transition-colors duration-200`}>
      {cta}
    </Link>
  </motion.div>);
const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (<div className="border-b border-gray-200 dark:border-gray-700 py-6">
      <button className="flex w-full justify-between items-center text-left" onClick={() => setIsOpen(!isOpen)}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{question}</h3>
        <span className="ml-6 flex-shrink-0">
          {isOpen ? (<XCircle className="h-5 w-5 text-gray-500 dark:text-gray-400"/>) : (<Info className="h-5 w-5 text-gray-500 dark:text-gray-400"/>)}
        </span>
      </button>
      
      {isOpen && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="mt-4">
          <p className="text-gray-600 dark:text-gray-300">{answer}</p>
        </motion.div>)}
    </div>);
};
const Pricing = () => {
    // const { theme } = useTheme(); // Removed
    const [billingPeriod, setBillingPeriod] = useState('monthly');
    // Logo images based on theme - removed as LandingHeader handles it
    // Pricing data
    const pricingTiers = [
        {
            name: 'Free',
            price: 'Free',
            description: 'For individuals starting their learning journey.',
            features: [
                '5 AI tutor sessions per month',
                'Basic personalized learning paths',
                'Access to public study groups',
                'Standard analytics',
            ],
            cta: 'Get Started',
            popular: false,
        },
        {
            name: 'Pro',
            price: '₦20,000',
            description: 'For dedicated learners who want to accelerate their growth.',
            features: [
                'Unlimited AI tutor sessions',
                'Advanced personalized learning paths',
                'Create and join study groups',
                'Detailed performance analytics',
                'Priority support',
            ],
            cta: 'Upgrade to Pro',
            popular: true,
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            description: 'For organizations and educational institutions.',
            features: [
                'Custom-branded AI tutors',
                'Team management and reporting',
                'API access for integrations',
                'Dedicated account manager',
                'SLA and premium support',
            ],
            cta: 'Contact Sales',
            popular: false,
        },
    ];
    // FAQ data
    const faqItems = [
        {
            question: "How does the free plan work?",
            answer: "The free plan gives you limited access to CogniEdufy's core features, including 5 AI tutoring sessions per month, basic learning path creation, and the ability to join one study group. It's perfect for trying out the platform or for casual learners."
        },
        {
            question: "Can I upgrade or downgrade my plan later?",
            answer: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll immediately get access to additional features. If you downgrade, you'll continue to have access to your current plan until the end of your billing period."
        },
        {
            question: "Is there a discount for students?",
            answer: "Yes, we offer a 50% discount on our Pro plan for verified students. Contact our support team with your student ID to apply for the discount."
        },
        {
            question: "Can I get a refund if I'm not satisfied?",
            answer: "We offer a 14-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team within 14 days of purchase for a full refund."
        },
        {
            question: "What kind of support is included?",
            answer: "Free users get community support, Pro users receive priority email support with 24-hour response times, and Enterprise customers get dedicated account managers and phone support."
        }
    ];
    return (<div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"> {/* Ensure text color is set */}
      <LandingHeader />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
              Choose the plan that's right for you and start your learning journey today. No hidden fees.
            </p>
          </motion.div>
          
          {/* Main pricing grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {pricingTiers.map((tier, index) => (<PricingTier key={tier.name} name={tier.name} price={tier.price} description={tier.description} features={tier.features} cta={tier.cta} popular={tier.popular} delay={index * 0.1}/>))}
          </div>
        </div>
      </section>

      {/* Feature comparison section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Compare Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Choose the plan with the features you need for your learning journey.
            </p>
          </motion.div>

          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="py-5 px-6 text-sm font-semibold text-gray-900 dark:text-white">Feature</th>
                    <th className="py-5 px-6 text-sm font-semibold text-gray-900 dark:text-white text-center">Free</th>
                    <th className="py-5 px-6 text-sm font-semibold text-gray-900 dark:text-white text-center border-x border-gray-200 dark:border-gray-600">Pro</th>
                    <th className="py-5 px-6 text-sm font-semibold text-gray-900 dark:text-white text-center">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {/* AI Tutoring */}
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">AI Tutor</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center">3</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center border-x border-gray-200 dark:border-gray-600">Unlimited</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center">Unlimited & Custom</td>
                  </tr>
                  {/* Learning Paths */}
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">Personalized Learning Paths</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center">Basic</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center border-x border-gray-200 dark:border-gray-600">Advanced</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center">Advanced</td>
                  </tr>
                  {/* Study Groups */}
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">Study Groups</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center">Join 3 public groups</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center border-x border-gray-200 dark:border-gray-600">Create & Join</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center">Team-based groups</td>
                  </tr>
                  {/* Analytics */}
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">Analytics</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center">Standard</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center border-x border-gray-200 dark:border-gray-600">Detailed</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center">Advanced Reporting</td>
                  </tr>
                  {/* Support */}
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">Support</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center">Community</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center border-x border-gray-200 dark:border-gray-600">Priority</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center">Dedicated Manager</td>
                  </tr>
                  {/* API Access */}
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">API Access</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center"><XCircle className="h-5 w-5 mx-auto text-red-400"/></td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center border-x border-gray-200 dark:border-gray-600"><XCircle className="h-5 w-5 mx-auto text-red-400"/></td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-500"/></td>
                  </tr>
                  {/* Custom Branding */}
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">Custom Branding</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center"><XCircle className="h-5 w-5 mx-auto text-red-400"/></td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center border-x border-gray-200 dark:border-gray-600"><XCircle className="h-5 w-5 mx-auto text-red-400"/></td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center"><CheckCircle className="h-5 w-5 mx-auto text-green-500"/></td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white text-center">
                      Storage
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center">5GB</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center">50GB</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-center">Unlimited</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Got questions? We've got answers.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
            {faqItems.map((item, index) => (<FAQItem key={index} question={item.question} answer={item.answer || ""}/>))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary-600 dark:bg-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">
              Still have questions?
            </h2>
            <p className="text-xl text-primary-100 mb-10">
              Our friendly team is here to help. Reach out to us anytime and we'll get back to you as soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/contact" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-600 bg-white hover:bg-gray-50">
                Contact Support
              </Link>
              <Link to="/register" className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-primary-700">
                Get Started Free
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>);
};
export default Pricing;
