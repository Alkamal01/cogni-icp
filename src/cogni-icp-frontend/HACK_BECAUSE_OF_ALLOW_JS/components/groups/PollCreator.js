import React, { useState } from 'react';
import { Button, Input, Textarea } from '../shared';
import { IoAdd, IoTrash, IoCalendar, IoHelpCircle, IoCheckmark } from 'react-icons/io5';
const PollCreator = ({ onSubmit, onCancel, isLoading = false }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [expiresAt, setExpiresAt] = useState('');
    const [errors, setErrors] = useState({});
    const handleAddOption = () => {
        setOptions([...options, '']);
    };
    const handleRemoveOption = (index) => {
        if (options.length <= 2) {
            setErrors(prev => ({
                ...prev,
                options: ['At least 2 options are required']
            }));
            return;
        }
        setOptions(options.filter((_, i) => i !== index));
        // Clear option errors if we have enough options now
        if (errors.options && options.length > 2) {
            const newErrors = { ...errors };
            delete newErrors.options;
            setErrors(newErrors);
        }
    };
    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
        // Clear option-specific errors
        if (errors.options) {
            const newErrors = { ...errors };
            delete newErrors.options;
            setErrors(newErrors);
        }
    };
    const validateForm = () => {
        const newErrors = {};
        if (!question.trim()) {
            newErrors.question = 'Poll question is required';
        }
        const validOptions = options.filter(option => option.trim() !== '');
        if (validOptions.length < 2) {
            newErrors.options = ['At least 2 non-empty options are required'];
        }
        if (expiresAt) {
            const expiryDate = new Date(expiresAt);
            const now = new Date();
            if (expiryDate <= now) {
                newErrors.expiresAt = 'Expiry date must be in the future';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        try {
            const validOptions = options.filter(option => option.trim() !== '');
            const pollData = {
                question: question.trim(),
                options: validOptions,
            };
            if (expiresAt) {
                pollData.expires_at = new Date(expiresAt).toISOString();
            }
            await onSubmit(pollData);
        }
        catch (error) {
            console.error('Error creating poll:', error);
        }
    };
    return (<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
        <IoHelpCircle className="w-5 h-5 mr-2 text-primary-500"/>
        Create Group Poll
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Poll Question
          </label>
          <Textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What would you like to ask the group?" error={errors.question} className="w-full" rows={2}/>
        </div>
        
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Poll Options
          </label>
          
          {errors.options && (<div className="text-sm text-red-500 mb-2">
              {errors.options.map((error, i) => (<div key={i}>{error}</div>))}
            </div>)}
          
          {options.map((option, index) => (<div key={index} className="flex items-center space-x-2">
              <Input value={option} onChange={(e) => handleOptionChange(index, e.target.value)} placeholder={`Option ${index + 1}`} className="flex-1"/>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveOption(index)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">
                <IoTrash size={18}/>
              </Button>
            </div>))}
          
          <Button type="button" variant="outline" size="sm" onClick={handleAddOption} className="mt-2">
            <IoAdd size={16} className="mr-1"/>
            Add Option
          </Button>
        </div>
        
        <div>
          <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <span className="flex items-center">
              <IoCalendar className="w-4 h-4 mr-1"/>
              Poll Expiry (optional)
            </span>
          </label>
          <Input id="expiresAt" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} min={new Date().toISOString().slice(0, 16)} // Current datetime in format required by datetime-local
     error={errors.expiresAt} className="w-full"/>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            If set, voting will be disabled after this time. Otherwise, the poll stays open until manually closed.
          </p>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            <IoCheckmark size={18} className="mr-1"/>
            Create Poll
          </Button>
        </div>
      </form>
    </div>);
};
export default PollCreator;
