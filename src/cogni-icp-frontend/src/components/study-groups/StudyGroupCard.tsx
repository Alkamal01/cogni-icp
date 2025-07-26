import React from 'react';
import { Users, Award, Lock } from 'lucide-react';
import { Button } from '../shared';
import { StudyGroup } from '../../services/studyGroupService';

interface StudyGroupCardProps {
  group: StudyGroup;
  onJoin: () => void;
  onViewDetails: () => void;
}

const StudyGroupCard: React.FC<StudyGroupCardProps> = ({ 
  group, 
  onJoin, 
  onViewDetails 
}) => {
  const levelColorMap = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  };

  const levelColor = levelColorMap[group.learning_level] || levelColorMap.beginner;
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {group.name}
          </h3>
          <div className="flex items-center space-x-1">
            {group.is_private ? (
              <Lock className="h-4 w-4 text-gray-400" />
            ) : (
              <span className="text-xs text-gray-400">Public</span>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {group.description || "No description provided."}
        </p>
        
        <div className="flex flex-wrap mb-4 gap-2">
          {group.topic_name && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              {group.topic_name}
            </span>
          )}
          
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelColor}`}>
            {group.learning_level.charAt(0).toUpperCase() + group.learning_level.slice(1)}
          </span>
        </div>
        
        <div className="flex flex-col space-y-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            <span>{group.member_count} / {group.max_members} members</span>
          </div>
          
          {group.meeting_frequency && (
            <div className="flex items-center">
              <span className="text-xs mr-2">📅</span>
              <span>{group.meeting_frequency}</span>
            </div>
          )}
          
          {group.learning_level && (
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-2" />
              <span>{group.learning_level.charAt(0).toUpperCase() + group.learning_level.slice(1)} level</span>
            </div>
          )}
        </div>
        </div>
        
      <div className="flex space-x-2 p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <Button 
            variant="secondary" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onViewDetails();
            }}
            className="flex-1"
          >
            <span className="flex items-center justify-center">
              View Details
            </span>
          </Button>
          
          {!group.is_member && (
            <Button 
              variant="primary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onJoin();
              }}
              disabled={group.member_count >= group.max_members}
              className="flex-1"
            >
              <span className="flex items-center justify-center">
                Join Group
              </span>
            </Button>
          )}
      </div>
    </div>
  );
};

export default StudyGroupCard; 