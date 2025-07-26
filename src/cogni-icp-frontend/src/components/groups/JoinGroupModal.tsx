import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { Button } from '../shared';
import { motion, AnimatePresence } from 'framer-motion';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (accessKey: string) => void;
  groupName: string;
}

const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  groupName
}) => {
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessKey.trim()) {
      setError('Please enter the access key');
      return;
    }
    
    setError('');
    onSubmit(accessKey);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Join Private Group</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="flex items-center justify-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg mb-6">
              <Lock className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-bold">{groupName}</span> is a private group. You need an access key to join.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="access_key">
                Access Key
              </label>
              <input
                id="access_key"
                type="text"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 ${
                  error ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
                placeholder="Enter the group access key"
              />
              {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Join Group
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default JoinGroupModal; 