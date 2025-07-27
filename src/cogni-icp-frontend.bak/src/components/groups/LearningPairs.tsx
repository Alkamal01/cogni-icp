import React, { useState } from 'react';
import { X, Users, Brain, Target, Award, ArrowRight, Clock, Check, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../shared';

interface LearningPairsProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string | number;
  groupName: string;
}

interface PairMember {
  id: string;
  name: string;
  avatar?: string;
  skills: string[];
  learningStyle: string;
  strengths: string[];
  interests: string[];
  compatibilityScore: number;
  lastActive: string;
}

const LearningPairs: React.FC<LearningPairsProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName
}) => {
  // Mock data for potential learning pairs
  const [potentialPairs, setPotentialPairs] = useState<PairMember[]>([
    {
      id: 'user1',
      name: 'Emily Chen',
      avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
      skills: ['Machine Learning', 'Python', 'Data Visualization'],
      learningStyle: 'Visual learner',
      strengths: ['Explaining complex concepts', 'Problem-solving'],
      interests: ['AI Ethics', 'Computer Vision', 'Neural Networks'],
      compatibilityScore: 92,
      lastActive: '2 hours ago'
    },
    {
      id: 'user2',
      name: 'Marcus Johnson',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      skills: ['Neural Networks', 'TensorFlow', 'Research'],
      learningStyle: 'Hands-on learner',
      strengths: ['Implementing algorithms', 'Debugging code'],
      interests: ['Reinforcement Learning', 'NLP', 'Deep Learning'],
      compatibilityScore: 87,
      lastActive: '4 hours ago'
    },
    {
      id: 'user3',
      name: 'Sophia Rodriguez',
      avatar: 'https://randomuser.me/api/portraits/women/57.jpg',
      skills: ['Statistical Analysis', 'R', 'Research Methods'],
      learningStyle: 'Reading/writing learner',
      strengths: ['Data analysis', 'Technical writing'],
      interests: ['Bayesian Methods', 'Experimental Design', 'Data Ethics'],
      compatibilityScore: 83,
      lastActive: 'Yesterday'
    },
    {
      id: 'user4',
      name: 'David Park',
      skills: ['Web Development', 'UI/UX', 'Frontend Frameworks'],
      learningStyle: 'Auditory learner',
      strengths: ['Creative solutions', 'Rapid prototyping'],
      interests: ['Responsive Design', 'Accessibility', 'Design Systems'],
      compatibilityScore: 75,
      lastActive: '3 days ago'
    }
  ]);

  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Track connection requests that have been sent
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  
  // Track connection status messages
  const [connectionMessages, setConnectionMessages] = useState<{[key: string]: string}>({});

  const availableFilters = [
    'Visual learners',
    'Hands-on learners',
    'Reading/writing learners',
    'Auditory learners',
    'Similar interests',
    'Complementary skills',
    'High compatibility',
    'Recently active'
  ];

  const toggleFilter = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter(f => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  const filteredPairs = potentialPairs.filter(pair => {
    // Apply search term filtering
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        pair.name.toLowerCase().includes(searchLower) ||
        pair.skills.some(skill => skill.toLowerCase().includes(searchLower)) ||
        pair.interests.some(interest => interest.toLowerCase().includes(searchLower))
      );
    }
    return true;
  }).sort((a, b) => {
    // Sort by compatibility score by default
    return b.compatibilityScore - a.compatibilityScore;
  });

  const handleSendRequest = (pairId: string) => {
    // Check if request has already been sent
    if (sentRequests.includes(pairId)) {
      return;
    }
    
    // In a real application, this would send a pairing request to an API
    console.log(`Sending pair request to user with ID: ${pairId}`);
    
    // Add to sent requests
    setSentRequests([...sentRequests, pairId]);
    
    // Show pending message
    setConnectionMessages({
      ...connectionMessages,
      [pairId]: 'pending'
    });
    
    // Simulate API response with timeout
    setTimeout(() => {
      setConnectionMessages({
        ...connectionMessages,
        [pairId]: 'success'
      });
      
      // For the demo, show a success message after "processing"
      const pairName = potentialPairs.find(p => p.id === pairId)?.name;
      alert(`Connection request sent to ${pairName}! You'll be notified when they respond.`);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/30">
                <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Find Learning Partners</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{groupName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Search by name, skills, or interests..."
                />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedFilters.includes(filter)
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPairs.map((pair) => (
                <div
                  key={pair.id}
                  className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {pair.avatar ? (
                          <img
                            src={pair.avatar}
                            alt={pair.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 dark:from-primary-600 dark:to-primary-800 flex items-center justify-center text-white text-lg font-semibold">
                            {pair.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{pair.name}</h3>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>Active {pair.lastActive}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-50 dark:bg-primary-900/20">
                        <div className="text-primary-600 dark:text-primary-400 font-bold text-sm">
                          {pair.compatibilityScore}%
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center mb-1">
                          <Brain className="h-4 w-4 text-primary-500 dark:text-primary-400 mr-2" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Learning Style</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{pair.learningStyle}</p>
                      </div>

                      <div>
                        <div className="flex items-center mb-1">
                          <Target className="h-4 w-4 text-primary-500 dark:text-primary-400 mr-2" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Skills</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {pair.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center mb-1">
                          <Award className="h-4 w-4 text-primary-500 dark:text-primary-400 mr-2" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Interests</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {pair.interests.map((interest, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-primary-600 dark:text-primary-400">{pair.compatibilityScore}%</span> compatibility match
                      </div>
                      
                      {connectionMessages[pair.id] === 'success' ? (
                        <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                          <Check className="h-4 w-4 mr-1" />
                          Request Sent
                        </div>
                      ) : connectionMessages[pair.id] === 'pending' ? (
                        <div className="flex items-center text-amber-600 dark:text-amber-400 text-sm font-medium">
                          <div className="h-4 w-4 mr-1 rounded-full border-2 border-amber-600 dark:border-amber-400 border-t-transparent animate-spin" />
                          Sending...
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex items-center"
                            onClick={() => handleSendRequest(pair.id)}
                          >
                            <span>Connect</span>
                            <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredPairs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <Users className="h-12 w-12 mb-4 stroke-1" />
                <p className="text-lg font-medium">No learning pairs found</p>
                <p className="text-sm mt-1">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium">{filteredPairs.length}</span> potential learning partners found
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LearningPairs; 