import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/apiClient';
const StudyGroupFormModal = ({ isOpen, onClose, onSubmit, topics, initialData, }) => {
    const [formData, setFormData] = React.useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        topic_id: initialData?.topic_id,
        is_private: initialData?.is_private || false,
        max_members: initialData?.max_members || 10,
        learning_level: initialData?.learning_level || 'intermediate',
        meeting_frequency: initialData?.meeting_frequency || '',
        goals: initialData?.goals || '',
    });
    // Additional state for topic name if user is entering it as text
    const [topicName, setTopicName] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState(null);
    React.useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                topic_id: initialData.topic_id,
                is_private: initialData.is_private || false,
                max_members: initialData.max_members || 10,
                learning_level: initialData.learning_level || 'intermediate',
                meeting_frequency: initialData.meeting_frequency || '',
                goals: initialData.goals || '',
            });
            // If we're editing a group, try to find the topic name
            if (initialData.topic_id) {
                const topic = topics.find(t => t.id === initialData.topic_id);
                if (topic) {
                    setTopicName(topic.name);
                }
            }
        }
    }, [initialData, topics]);
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value,
        }));
    };
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            // Prepare data for submission
            const submitData = { ...formData };
            // Handle the topic - first check if it's an existing one
            if (topicName && !formData.topic_id) {
                const existingTopic = topics.find(t => t.name.toLowerCase() === topicName.toLowerCase());
                if (existingTopic) {
                    // Use existing topic ID
                    submitData.topic_id = existingTopic.id;
                }
                else {
                    // Create a new topic first
                    try {
                        const response = await api.post('/api/study-groups/topics', {
                            name: topicName,
                            description: `Topic for ${formData.name}`,
                        });
                        // Use the new topic ID
                        if (response.data && response.data.id) {
                            submitData.topic_id = response.data.id;
                        }
                    }
                    catch (topicError) {
                        console.error('Error creating topic:', topicError);
                        setError('Failed to create topic. Please try again or select an existing one.');
                        setIsSubmitting(false);
                        return;
                    }
                }
            }
            // Clear topic_name as we're using topic_id
            if (submitData.topic_name) {
                delete submitData.topic_name;
            }
            // Submit the group data
            onSubmit(submitData);
        }
        catch (error) {
            console.error('Error in form submission:', error);
            setError('An unexpected error occurred. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (!isOpen)
        return null;
    return (<AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-[151]">
          <div className="sticky top-0 z-10 px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {initialData?.name ? 'Edit Study Group' : 'Create Study Group'}
            </h2>
            <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400"/>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error message */}
            {error && (<div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>)}
            
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
                Description
              </label>
              <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400" placeholder="Describe what your group is about and what you'll be studying together"/>
            </div>

            {/* Topic as Text Input Instead of Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="topic_name">
                Topic*
              </label>
              <input id="topic_name" type="text" required value={topicName} onChange={(e) => setTopicName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400" placeholder="E.g. Machine Learning, Python, Mathematics" list="topic-suggestions"/>
              {/* Optional datalist for topic suggestions */}
              <datalist id="topic-suggestions">
                {topics.map((topic) => (<option key={topic.id} value={topic.name}/>))}
              </datalist>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter a topic or select from suggestions
              </p>
            </div>

            {/* Learning Level and Max Members */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Learning Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="learning_level">
                  Learning Level
                </label>
                <select id="learning_level" name="learning_level" value={formData.learning_level} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400">
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

            {/* Meeting Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="meeting_frequency">
                Meeting Frequency
              </label>
              <input id="meeting_frequency" name="meeting_frequency" type="text" value={formData.meeting_frequency || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400" placeholder="E.g. Weekly on Thursdays"/>
            </div>

            {/* Group Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="goals">
                Group Goals
              </label>
              <textarea id="goals" name="goals" value={formData.goals || ''} onChange={handleChange} rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400" placeholder="What does this group aim to achieve?"/>
            </div>

            {/* Privacy Setting */}
            <div className="flex items-center">
              <input id="is_private" name="is_private" type="checkbox" checked={formData.is_private} onChange={handleCheckboxChange} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"/>
              <label htmlFor="is_private" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Make this group private
              </label>
            </div>

            {/* Submit button */}
            <div className="flex justify-end mt-6 space-x-3">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-600 dark:hover:bg-primary-700">
                {isSubmitting ? 'Creating...' : initialData?.name ? 'Update Group' : 'Create Group'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>);
};
export default StudyGroupFormModal;
