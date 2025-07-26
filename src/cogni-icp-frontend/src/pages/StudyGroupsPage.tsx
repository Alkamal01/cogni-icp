import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, FeatureGate, UsageLimitIndicator, PlanBadge } from '../components/shared';
import StudyGroupCard from '../components/study-groups/StudyGroupCard';
import StudyGroupFormModal from '../components/study-groups/StudyGroupFormModal';
import studyGroupService, { StudyGroup, Topic, CreateStudyGroupParams } from '../services/studyGroupService';
import { useToast } from '../hooks/useToast';
import { useSubscription } from '../contexts/SubscriptionContext';

// Search icon SVG
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

// Sliders icon SVG
const SlidersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400">
    <line x1="4" y1="21" x2="4" y2="14"></line>
    <line x1="4" y1="10" x2="4" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12" y2="3"></line>
    <line x1="20" y1="21" x2="20" y2="16"></line>
    <line x1="20" y1="12" x2="20" y2="3"></line>
    <line x1="1" y1="14" x2="7" y2="14"></line>
    <line x1="9" y1="8" x2="15" y2="8"></line>
    <line x1="17" y1="16" x2="23" y2="16"></line>
  </svg>
);

const StudyGroupsPage: React.FC = () => {
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const { toast } = useToast();
  const { checkUsageLimit, getFeatureLimit, hasFeatureAccess, showUpgradePrompt } = useSubscription();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
         setIsLoading(true);
      setError(null);
      
      // Fetch topics and groups in parallel
      const [topicsData, groupsData] = await Promise.all([
        studyGroupService.getAllTopics(),
        studyGroupService.getAllGroups()
         ]);
      
         setTopics(topicsData);
      setStudyGroups(groupsData);
    } catch (err) {
         console.error('Error fetching data:', err);
      setError('Failed to load study groups. Please try again later.');
     } finally {
         setIsLoading(false);
     }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Enhanced modal open function with subscription checks
  const openGroupModal = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    // Check if user can create more study groups
    const currentGroupCount = studyGroups.filter(group => group.is_member).length;
    const usageCheck = checkUsageLimit('study_groups', currentGroupCount);
    
    if (!usageCheck.canPerform) {
      showUpgradePrompt('study_groups');
      toast({
        title: 'Study Group Limit Reached',
        description: usageCheck.message || 'You have reached your study group limit.',
        variant: 'warning'
      });
      return;
    }
    
    // Hide any errors when opening modal
    setError(null);
    setIsModalOpen(true);
  }, [studyGroups, checkUsageLimit, showUpgradePrompt, toast]);

  const handleCreateGroup = async (data: CreateStudyGroupParams) => {
    try {
      setIsSubmitting(true);
      console.log('Creating study group with data:', data);
      const newGroup = await studyGroupService.createStudyGroup(data);
      setStudyGroups(prevGroups => [...prevGroups, newGroup]);
      setIsModalOpen(false);
      toast({
        title: 'Success',
        description: 'Study group created successfully',
        variant: 'success'
      });
    } catch (err: any) {
      console.error('Error creating group:', err);
      
      // Extract error message from the response if available
      let errorMessage = 'Failed to create study group. Please try again.';
      if (err.response && err.response.data && err.response.data.error) {
        errorMessage = err.response.data.error;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'error'
      });
      
      // Keep the modal open if there's an error
      // so the user can correct any issues
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinGroup = async (groupPublicId: string) => {
    try {
      await studyGroupService.joinGroup(groupPublicId);

      // Optimistically update the UI
      setStudyGroups(prevGroups =>
        prevGroups.map(group =>
          group.public_id === groupPublicId
            ? { ...group, is_member: true, member_count: group.member_count + 1 }
            : group
        )
      );

      toast({
        title: 'Success',
        description: 'You have joined the study group',
        variant: 'success'
      });
    } catch (err) {
      console.error('Error joining group:', err);
      toast({
        title: 'Error',
        description: 'Failed to join study group. Please try again.',
        variant: 'error'
      });
    }
  };

  const handleViewDetails = (groupId: number) => {
    // ... existing code ...
  };

  const filteredGroups = studyGroups.filter(group => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        group.name.toLowerCase().includes(query) || 
        (group.description || '').toLowerCase().includes(query) ||
        (group.topic_name || '').toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }
    
    // Apply category filter
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'my-groups') return group.is_member;
    if (selectedFilter === 'private') return group.is_private;
    if (selectedFilter === 'public') return !group.is_private;
    return group.learning_level === selectedFilter;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };

     return (
    <>
      {/* Modal rendered outside the main container to avoid z-index conflicts */}
      <StudyGroupFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateGroup}
        topics={topics}
        initialData={undefined}
      />
      
      <div className="container mx-auto px-4 py-8">
         <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                 <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Groups</h1>
                  <PlanBadge />
                 </div>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Join or create study groups to learn collaboratively</p>
              </div>
              <div className="relative" style={{ zIndex: 20 }}>
                <Button 
                  variant="primary" 
                  onClick={openGroupModal}
                  className="mt-4 md:mt-0 relative"
                  style={{ zIndex: 20 }}
                >
                  <span className="flex items-center justify-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Group
                  </span>
                </Button>
              </div>
             </div>
 
            {/* Usage Limit Indicator */}
            <UsageLimitIndicator 
              feature="study_groups" 
              currentUsage={studyGroups.filter(group => group.is_member).length} 
              showDetails={true} 
            />
 
            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                     type="text"
                  placeholder="Search by name, description, or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                 />
                     </div>
              
              <div className="relative sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SlidersIcon />
                </div>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Groups</option>
                  <option value="my-groups">My Groups</option>
                  <option value="public">Public</option>
                  {hasFeatureAccess('private_groups') && (
                    <option value="private">Private Groups</option>
                  )}
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  {hasFeatureAccess('advanced_analytics') && (
                    <option value="advanced">Advanced</option>
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                     </div>
                 </div>
             </div>
          </motion.div>
 
          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="w-16 h-16 border-t-4 border-b-4 border-primary-500 rounded-full animate-spin"></div>
            </div>
          )}
 
          {/* Error state - Only show if modal is NOT open */}
          {!isLoading && error && !isModalOpen && (
            <motion.div variants={itemVariants} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <div className="text-red-600 dark:text-red-400 mb-2">⚠️ {error}</div>
              <Button 
                variant="secondary" 
                onClick={fetchData}
              >
                Try Again
              </Button>
            </motion.div>
          )}
 
          {/* Empty state */}
          {!isLoading && !error && filteredGroups.length === 0 && (
            <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No study groups found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery || selectedFilter !== 'all' 
                  ? "We couldn't find any study groups matching your criteria. Try adjusting your filters." 
                  : "There are no study groups yet. Be the first to create one!"}
              </p>
              <div className="relative">
                <Button 
                  variant="primary" 
                  onClick={openGroupModal}
                  className="mx-auto"
                >
                  <span className="flex items-center justify-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Group
                  </span>
                </Button>
              </div>
            </motion.div>
          )}
 
          {/* Study group cards */}
          {!isLoading && !error && filteredGroups.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map(group => (
                <motion.div key={group.id} variants={itemVariants}>
                  <StudyGroupCard
                    group={group}
                    onJoin={() => {
                      if (group.public_id) {
                        handleJoinGroup(group.public_id);
                      }
                    }}
                    onViewDetails={() => navigate(`/groups/${group.public_id}`)}
                  />
                </motion.div>
              ))}
            </div>
          )}
         </motion.div>
      </div>
    </>
     );
 };

export default StudyGroupsPage; 