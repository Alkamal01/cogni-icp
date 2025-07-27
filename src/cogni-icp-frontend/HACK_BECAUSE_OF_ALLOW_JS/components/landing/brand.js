import React from 'react';
import { motion } from 'framer-motion';
// Define the stats array for use in the component
const stats = [
    { label: 'Users', value: '0+' },
    { label: 'Tutoring Sessions', value: '0+' },
    { label: 'Subjects Covered', value: '0+' },
    { label: 'Success Rate', value: '94%' }
];
const BrandSection = () => {
    return (<section className="py-12 md:py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trusted by Brands Section */}
        <div className="text-center mb-16">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by Leading Educational Institutions
          </motion.h2>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 mt-10">
            <div className="flex items-center justify-center">
              <div className="h-16 text-gray-400 dark:text-gray-500 font-bold text-xl">ABU</div>
            </div>
            <div className="flex items-center justify-center">
              <div className="h-16 text-gray-400 dark:text-gray-500 font-bold text-xl">BUK</div>
            </div>
            <div className="flex items-center justify-center">
              <div className="h-16 text-gray-400 dark:text-gray-500 font-bold text-xl">UNILAG</div>
            </div>
            <div className="flex items-center justify-center">
              <div className="h-16 text-gray-400 dark:text-gray-500 font-bold text-xl">FUDMA</div>
            </div>
          </motion.div>
        </div>
        
        {/* Stats Section */}
        <div className="mt-20">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-16">
            Empowering Students Worldwide
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (<motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-lg">{stat.label}</p>
              </motion.div>))}
          </div>
        </div>
      </div>
    </section>);
};
export default BrandSection;
