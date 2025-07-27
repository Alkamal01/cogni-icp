import React, { useState } from 'react';
import { X, Lock, Users, Plus } from 'lucide-react';
import { Button } from '../shared';
import { motion, AnimatePresence } from 'framer-motion';
const StudyGroupForm = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        topic: '',
        skill_level: 'intermediate',
        max_members: 10,
        privacy: 'public',
        tags: []
    });
    const [currentTag, setCurrentTag] = useState('');
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleAddTag = () => {
        if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, currentTag.trim()]
            }));
            setCurrentTag('');
        }
    };
    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };
    if (!isOpen)
        return null;
    return (<AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 z-10 px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Study Group</h2>
            <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400"/>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Group Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="name">
                Group Name*
              </label>
              <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400" placeholder="E.g. Machine Learning Study Circle"/>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="description">
                Description*
              </label>
              <textarea id="description" name="description" required value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400" placeholder="Describe what your group is about and what you'll be studying together"/>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="topic">
                Topic*
              </label>
              <input id="topic" name="topic" type="text" required value={formData.topic} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400" placeholder="E.g. Calculus, Machine Learning, Web Development"/>
            </div>

            {/* Privacy and Skill Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Skill Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="skill_level">
                  Skill Level
                </label>
                <select id="skill_level" name="skill_level" value={formData.skill_level} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Maximum Members */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="max_members">
                  Maximum Members
                </label>
                <input id="max_members" name="max_members" type="number" min="2" max="50" value={formData.max_members} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"/>
              </div>
            </div>

            {/* Privacy Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Privacy Settings
              </label>
              <div className="flex space-x-4">
                <div onClick={() => setFormData(prev => ({ ...prev, privacy: 'public' }))} className={`flex-1 p-4 border rounded-lg flex flex-col items-center cursor-pointer transition-all ${formData.privacy === 'public'
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <Users className={`h-6 w-6 mb-2 ${formData.privacy === 'public' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}/>
                  <h3 className="font-medium text-gray-900 dark:text-white">Public</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                    Anyone can join without approval
                  </p>
                </div>
                
                <div onClick={() => setFormData(prev => ({ ...prev, privacy: 'private' }))} className={`flex-1 p-4 border rounded-lg flex flex-col items-center cursor-pointer transition-all ${formData.privacy === 'private'
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <Lock className={`h-6 w-6 mb-2 ${formData.privacy === 'private' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}/>
                  <h3 className="font-medium text-gray-900 dark:text-white">Private</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                    Requires access key to join
                  </p>
                </div>
              </div>
            </div>

            {/* Access Key (for private groups) */}
            {formData.privacy === 'private' && (<div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="access_key">
                  Access Key*
                </label>
                <input id="access_key" name="access_key" type="text" required value={formData.access_key || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400" placeholder="Create an access key for your group"/>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Share this key with people you want to invite to your group.
                </p>
              </div>)}

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags
              </label>
              <div className="flex items-center space-x-2">
                <input type="text" value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())} className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400" placeholder="E.g. Python, Data Science, Algorithms"/>
                <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                  <Plus className="h-4 w-4"/>
                </Button>
              </div>
              
              {formData.tags.length > 0 && (<div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag) => (<span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200">
                        <X className="h-3 w-3"/>
                      </button>
                    </span>))}
                </div>)}
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create Group
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>);
};
export default StudyGroupForm;
