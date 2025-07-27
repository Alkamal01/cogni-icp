import React, { useState } from 'react';
import { X, CheckCircle, BookOpen, Users } from 'lucide-react';
import { Button } from '../shared';
import { motion, AnimatePresence } from 'framer-motion';
const GroupRulesModal = ({ isOpen, onClose, onAccept, groupName, groupRules = [
    "Be respectful and inclusive to all group members.",
    "Stay on topic during discussions and sessions.",
    "Share resources only if you have the right to distribute them.",
    "Respect confidentiality within the group.",
    "Actively participate and contribute to group activities.",
    "Complete assigned tasks and collaborate with peers.",
    "Notify the group in advance if you cannot attend scheduled sessions."
] }) => {
    const [agreed, setAgreed] = useState(false);
    const handleCheckboxChange = () => {
        setAgreed(!agreed);
    };
    if (!isOpen)
        return null;
    return (<AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 z-10 px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400"/>
              Group Rules and Guidelines
            </h2>
            <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400"/>
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                Before joining <span className="font-bold">{groupName}</span>, please read and agree to the following rules and guidelines.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Community Rules
              </h3>
              
              <ul className="space-y-2 pl-2">
                {groupRules.map((rule, index) => (<li key={index} className="flex items-start space-x-2 text-gray-700 dark:text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0"/>
                    <span>{rule}</span>
                  </li>))}
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-2 mb-4">
                <input type="checkbox" id="agree-rules" checked={agreed} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"/>
                <label htmlFor="agree-rules" className="text-sm text-gray-700 dark:text-gray-300">
                  I have read and agree to follow the group rules and guidelines
                </label>
              </div>

              <div className="flex justify-between items-center">
                <a href="#" className="text-sm text-primary-600 dark:text-primary-400 flex items-center" onClick={(e) => e.preventDefault()}>
                  <Users className="h-4 w-4 mr-1"/>
                  Full Terms & Policies
                </a>
                <div className="space-x-3">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="button" variant="primary" disabled={!agreed} onClick={onAccept}>
                    Join Group
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>);
};
export default GroupRulesModal;
