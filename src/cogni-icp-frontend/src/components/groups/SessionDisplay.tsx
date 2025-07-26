import React, { useState } from 'react';
import { StudySession } from '../../services/studyGroupService';
import { Button } from '../shared';
import { Clock as ClockIcon, Users as UsersIcon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionDisplayProps {
  session: StudySession;
  onJoin: (sessionId: number) => Promise<void>;
  onLeave: (sessionId: number) => Promise<void>;
  onDelete?: (sessionId: number) => Promise<void>;
  isAdmin?: boolean;
  isCreator?: boolean;
}

const SessionDisplay: React.FC<SessionDisplayProps> = ({
  session,
  onJoin,
  onLeave,
  onDelete,
  isAdmin = false,
  isCreator = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Calculate participant count or default to 0 if undefined
  const participantCount = session.participant_count || 0;

  // Format date from YYYY-MM-DD to more readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    
    // Get day of week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[date.getDay()];
    
    // Format date
    return `${dayOfWeek}, ${date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric'
    })}`;
  };
  
  // Format time from HH:MM to more readable format with AM/PM
  const formatTime = (timeString: string): string => {
    const [hour, minute] = timeString.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
  };
  
  // Format duration from minutes to hours and minutes
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    
    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  };
  
  // Check if session is in the past
  const isSessionInPast = (): boolean => {
    const sessionDateTime = new Date(`${session.date}T${session.time}`);
    return sessionDateTime < new Date();
  };
  
  // Handle joining a session
  const handleJoin = async () => {
    if (isJoining) return;
    
    try {
      setIsJoining(true);
      await onJoin(session.id);
    } catch (error) {
      console.error('Error joining session:', error);
    } finally {
      setIsJoining(false);
    }
  };
  
  // Handle leaving a session
  const handleLeave = async () => {
    if (isLeaving) return;
    
    try {
      setIsLeaving(true);
      await onLeave(session.id);
    } catch (error) {
      console.error('Error leaving session:', error);
    } finally {
      setIsLeaving(false);
    }
  };
  
  // Handle deleting a session
  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    
    try {
      setIsDeleting(true);
      await onDelete(session.id);
    } catch (error) {
      console.error('Error deleting session:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-white dark:bg-gray-800 p-4">
        <div className="flex items-start">
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-2">
                <ClockIcon className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Study Session
              </h3>
            </div>
            
            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-1">
              {session.title}
            </h4>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <ClockIcon className="w-3.5 h-3.5 mr-1.5" />
                {formatDate(session.date)}
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <ClockIcon className="w-3.5 h-3.5 mr-1.5" />
                {formatTime(session.time)}
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <ClockIcon className="w-3.5 h-3.5 mr-1.5" />
                {formatDuration(session.duration)}
              </div>
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <UsersIcon className="w-3.5 h-3.5 mr-1.5" />
                {participantCount} / {session.max_participants} participants
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {(isAdmin || isCreator) && !isSessionInPast() && (
              <Button
                variant="outline"
                size="xs"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Cancel Session'}
              </Button>
            )}
            
            <button
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Status indicators */}
        {isSessionInPast() && (
          <div className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full mb-2">
            Completed
          </div>
        )}
        
        {/* Session details when expanded */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-3">
                {/* Description */}
                {session.description && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {session.description}
                    </p>
                  </div>
                )}
                
                {/* Topics */}
                {session.topics && session.topics.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Topics
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {session.topics.map((topic, index) => (
                        <span 
                          key={index}
                          className="px-2 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Action buttons */}
                {!isSessionInPast() && (
                  <div className="pt-2 flex justify-end">
                    {session.is_participant ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLeave}
                        disabled={isLeaving}
                      >
                        {isLeaving ? 'Leaving...' : 'Leave Session'}
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleJoin}
                        disabled={isJoining || participantCount >= session.max_participants}
                      >
                        {participantCount >= session.max_participants
                          ? 'Session Full'
                          : 'Join Session'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SessionDisplay; 