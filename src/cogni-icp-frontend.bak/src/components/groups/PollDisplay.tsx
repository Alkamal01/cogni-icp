import React, { useState } from 'react';
import { Poll } from '../../services/studyGroupService';
import { Button } from '../shared';
import { Check, ChevronDown, AlertCircle, Clock, X, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Custom Vote icon with props interface
interface VoteIconProps {
  className?: string;
}

const VoteIcon: React.FC<VoteIconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 12 2 2 4-4"></path>
    <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"></path>
    <path d="M22 19H2"></path>
  </svg>
);

interface PollDisplayProps {
  poll: Poll;
  onVote: (pollId: number, optionId: number) => Promise<void>;
  onClose?: (pollId: number) => Promise<void>;
  onDelete?: (pollId: number) => Promise<void>;
  isAdmin?: boolean;
  isCreator?: boolean;
}

const PollDisplay: React.FC<PollDisplayProps> = ({
  poll,
  onVote,
  onClose,
  onDelete,
  isAdmin = false,
  isCreator = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(poll.user_vote_id || null);
  const [isVoting, setIsVoting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const calculatePercentage = (voteCount: number): number => {
    if (poll.total_votes === 0) return 0;
    return Math.round((voteCount / poll.total_votes) * 100);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isPollExpired = (): boolean => {
    if (!poll.expires_at) return false;
    return new Date(poll.expires_at) < new Date();
  };

  const canVote = (): boolean => {
    return poll.is_active && !isPollExpired() && poll.user_vote_id === null;
  };
  
  const handleVote = async () => {
    if (!selectedOption || isVoting) return;
    
    try {
      setIsVoting(true);
      await onVote(poll.id, selectedOption);
      // No need to reset selectedOption as the poll will re-render with user_vote_id
    } catch (error) {
      console.error('Error voting on poll:', error);
    } finally {
      setIsVoting(false);
    }
  };
  
  const handleClose = async () => {
    if (!onClose || isClosing) return;
    
    try {
      setIsClosing(true);
      await onClose(poll.id);
    } catch (error) {
      console.error('Error closing poll:', error);
    } finally {
      setIsClosing(false);
    }
  };
  
  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    
    try {
      setIsDeleting(true);
      await onDelete(poll.id);
    } catch (error) {
      console.error('Error deleting poll:', error);
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
              <VoteIcon className="w-4 h-4 text-primary-500 mr-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Poll
              </h3>
            </div>
            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-1">
              {poll.question}
            </h4>
            
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span className="mr-3">{poll.total_votes} vote{poll.total_votes !== 1 ? 's' : ''}</span>
              
              {poll.expires_at && (
                <div className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  <span>
                    {isPollExpired() 
                      ? 'Ended on ' 
                      : 'Ends on '}{formatDate(poll.expires_at)}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {(isAdmin || isCreator) && poll.is_active && (
              <Button
                variant="outline"
                size="xs"
                onClick={handleClose}
                disabled={isClosing}
              >
                {isClosing ? 'Closing...' : 'Close Poll'}
              </Button>
            )}
            
            {(isAdmin || isCreator) && (
              <Button
                variant="ghost"
                size="xs"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <X className="w-4 h-4 text-red-500" />
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
        {!poll.is_active && (
          <div className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full mb-2">
            Closed
          </div>
        )}
        
        {isPollExpired() && poll.is_active && (
          <div className="inline-flex items-center px-2 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs rounded-full mb-2">
            <Clock className="w-3 h-3 mr-1" />
            Expired
          </div>
        )}
        
        {/* Vote options */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 mt-3">
                {poll.options.map(option => (
                  <div key={option.id} className="relative">
                    {/* Option selection for users who haven't voted yet */}
                    {canVote() ? (
                      <div 
                        className={`flex items-center p-3 border ${
                          selectedOption === option.id 
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                            : 'border-gray-200 dark:border-gray-700'
                        } rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors`}
                        onClick={() => setSelectedOption(option.id)}
                      >
                        <div className={`w-5 h-5 mr-3 rounded-full border-2 flex items-center justify-center ${
                          selectedOption === option.id 
                            ? 'border-primary-500' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {selectedOption === option.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                          )}
                        </div>
                        <span className="text-gray-800 dark:text-gray-200">{option.text}</span>
                      </div>
                    ) : (
                      // Results view for users who have voted or when poll is closed/expired
                      <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg mb-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center">
                            {poll.user_vote_id === option.id && (
                              <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center mr-2">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                            <span className={`${poll.user_vote_id === option.id ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                              {option.text}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {calculatePercentage(option.vote_count)}%
                          </span>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${poll.user_vote_id === option.id ? 'bg-primary-500' : 'bg-gray-400 dark:bg-gray-500'}`}
                            style={{ width: `${calculatePercentage(option.vote_count)}%` }}
                          />
                        </div>
                        
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {option.vote_count} vote{option.vote_count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Vote button */}
                {canVote() && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleVote}
                    disabled={!selectedOption || isVoting}
                    className="mt-2 w-full"
                  >
                    {isVoting ? 'Voting...' : 'Submit Vote'}
                  </Button>
                )}
                
                {/* Messages */}
                {!poll.is_active && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                    <AlertCircle className="w-4 h-4 mr-1.5" />
                    This poll has been closed by the organizer.
                  </div>
                )}
                
                {isPollExpired() && poll.is_active && (
                  <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                    <Clock className="w-4 h-4 mr-1.5" />
                    This poll has expired and no longer accepts new votes.
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

export default PollDisplay; 