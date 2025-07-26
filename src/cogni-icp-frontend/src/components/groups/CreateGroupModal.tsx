import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../shared';
import { collaborationService } from '../../services/collaborationService';

interface CreateGroupModalProps {
  onClose: () => void;
  onCreated: (group: any) => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    topic_id: 0,
    skill_level: 'beginner',
    max_members: 5
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newGroup = await collaborationService.createGroup(formData);
      onCreated(newGroup);
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white dark:bg-dark-card rounded-lg w-full max-w-md shadow-xl z-[101]">
        <div className="flex justify-between items-center p-6 border-b dark:border-dark-border">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Create Study Group
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Group Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border
                dark:bg-dark-hover dark:text-gray-100 focus:border-primary-500 
                focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Topic
            </label>
            <select
              value={formData.topic_id.toString()}
              onChange={(e) => setFormData(prev => ({ ...prev, topic_id: parseInt(e.target.value, 10) }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border
                dark:bg-dark-hover dark:text-gray-100"
              required
            >
              <option value="">Select a topic</option>
              {/* Add topic options */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Skill Level
            </label>
            <select
              value={formData.skill_level}
              onChange={(e) => setFormData(prev => ({ ...prev, skill_level: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border
                dark:bg-dark-hover dark:text-gray-100"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Maximum Members
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={formData.max_members}
              onChange={(e) => setFormData(prev => ({ ...prev, max_members: +e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border
                dark:bg-dark-hover dark:text-gray-100"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
            >
              Create Group
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal; 