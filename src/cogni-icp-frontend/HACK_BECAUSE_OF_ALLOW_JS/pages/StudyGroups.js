import React, { useState } from 'react';
import { Plus, Users, Book, Star, Lock } from 'lucide-react';
import { Card, Button } from '../components/shared';
import { motion } from 'framer-motion';
import StudyGroupForm from '../components/groups/StudyGroupForm';
import JoinGroupModal from '../components/groups/JoinGroupModal';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
const StudyGroups = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const { showToast } = useToast();
    const navigate = useNavigate();
    // Mock data
    const [studyGroups, setStudyGroups] = useState([
        {
            id: 1,
            name: "Machine Learning Enthusiasts",
            description: "A group dedicated to exploring and understanding machine learning algorithms and applications.",
            topic: "Machine Learning",
            skill_level: "intermediate",
            members: ["John Doe", "Jane Smith", "Alex Johnson", "Sam Wilson"],
            max_members: 8,
            created_by: "John Doe",
            tags: ["AI", "Python", "Data Science"],
            isPopular: true,
            last_active: "2023-06-15T14:30:00Z",
            privacy: "public"
        },
        {
            id: 2,
            name: "Web Development Mentors",
            description: "Experienced developers helping beginners learn modern web development techniques.",
            topic: "Web Development",
            skill_level: "beginner",
            members: ["Alice Brown", "Bob Green", "Charlie Davis"],
            max_members: 6,
            created_by: "Alice Brown",
            tags: ["HTML", "CSS", "JavaScript", "React"],
            last_active: "2023-06-14T10:15:00Z",
            privacy: "public"
        },
        {
            id: 3,
            name: "Advanced Algorithm Study",
            description: "Focusing on complex algorithmic problems and competition preparation.",
            topic: "Algorithms",
            skill_level: "advanced",
            members: ["Eva Martinez", "Frank Thomas", "Grace Lee", "Henry Clark", "Ivy Wong"],
            max_members: 5,
            created_by: "Eva Martinez",
            tags: ["Algorithms", "Data Structures", "Problem Solving"],
            isPopular: true,
            last_active: "2023-06-16T09:45:00Z",
            privacy: "private",
            access_key: "algo123"
        },
        {
            id: 4,
            name: "Database Architecture",
            description: "Discussing database design, optimization, and management across different systems.",
            topic: "Databases",
            skill_level: "intermediate",
            members: ["Kevin Moore", "Laura Hill"],
            max_members: 10,
            created_by: "Kevin Moore",
            tags: ["SQL", "NoSQL", "Database Design"],
            last_active: "2023-06-13T16:20:00Z",
            privacy: "public"
        },
    ]);
    const filters = [
        { id: 'all', label: 'All Groups' },
        { id: 'popular', label: 'Popular' },
        { id: 'beginner', label: 'Beginner' },
        { id: 'intermediate', label: 'Intermediate' },
        { id: 'advanced', label: 'Advanced' },
        { id: 'public', label: 'Public' },
        { id: 'private', label: 'Private' }
    ];
    const filteredGroups = studyGroups.filter(group => {
        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesSearch = group.name.toLowerCase().includes(query) ||
                group.description.toLowerCase().includes(query) ||
                group.topic.toLowerCase().includes(query) ||
                group.tags.some(tag => tag.toLowerCase().includes(query));
            if (!matchesSearch)
                return false;
        }
        // Apply category filter
        if (selectedFilter === 'all')
            return true;
        if (selectedFilter === 'popular')
            return group.isPopular;
        if (selectedFilter === 'public')
            return group.privacy === 'public';
        if (selectedFilter === 'private')
            return group.privacy === 'private';
        return group.skill_level === selectedFilter;
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
    const skillLevelColors = {
        beginner: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
        intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
        advanced: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400',
    };
    const handleCreateGroup = (data) => {
        // In a real app, you would call an API to create the study group
        const newGroup = {
            id: studyGroups.length + 1,
            name: data.name,
            description: data.description,
            topic: data.topic,
            skill_level: data.skill_level,
            max_members: data.max_members,
            members: ["You"], // Current user is automatically a member
            created_by: "You", // Current user is the creator
            tags: data.tags,
            privacy: data.privacy,
            access_key: data.privacy === 'private' ? data.access_key : undefined,
            last_active: new Date().toISOString(),
        };
        setStudyGroups([...studyGroups, newGroup]);
        setIsCreateModalOpen(false);
        showToast('success', "Your study group has been created.");
    };
    const handleJoinGroup = (group) => {
        if (group.privacy === 'private') {
            setSelectedGroup(group);
            setIsJoinModalOpen(true);
        }
        else {
            joinGroup(group);
        }
    };
    const handleJoinPrivateGroup = (accessKey) => {
        if (!selectedGroup)
            return;
        // In a real app, you would verify the access key on the server
        if (selectedGroup.access_key === accessKey) {
            joinGroup(selectedGroup);
            setIsJoinModalOpen(false);
            setSelectedGroup(null);
        }
        else {
            showToast('error', "The access key you entered is incorrect.");
        }
    };
    const joinGroup = (group) => {
        const isAlreadyJoined = studyGroups.some(g => g.id === group.id);
        if (isAlreadyJoined) {
            // If already joined, navigate to group details
            navigate(`/groups/${group.id}`);
            return;
        }
        // Otherwise join the group (existing code)
        const updatedGroups = studyGroups.map(g => {
            if (g.id === group.id && !g.members.includes("You")) {
                // Check if the group is full
                if (g.members.length >= g.max_members) {
                    showToast('warning', "This group has reached its maximum member capacity.");
                    return g;
                }
                // Add the current user to the group
                return {
                    ...g,
                    members: [...g.members, "You"],
                };
            }
            return g;
        });
        setStudyGroups(updatedGroups);
        // If successfully joined (members length changed)
        const joinedGroup = updatedGroups.find(g => g.id === group.id);
        if (joinedGroup && joinedGroup.members.includes("You") && joinedGroup.members.length > group.members.length) {
            showToast('success', `You have joined "${group.name}"`);
        }
        else if (group.members.includes("You")) {
            showToast('info', "You are already a member of this group.");
        }
    };
    return (<div className="space-y-8">
      {/* Modals */}
      <StudyGroupForm isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateGroup}/>
      
      {selectedGroup && (<JoinGroupModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} onSubmit={handleJoinPrivateGroup} groupName={selectedGroup.name}/>)}

      {/* Header Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-gradient-to-r from-primary-500/10 to-purple-500/10 dark:from-primary-900/30 dark:to-purple-900/30 p-8 rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Users className="mr-3 h-8 w-8 text-primary-600 dark:text-primary-400"/>
          Study Groups
        </h1>
          <p className="mt-2 text-gray-600 dark:text-blue-200 max-w-3xl">
            Collaborate with peers in focused study groups to enhance your learning experience.
            Join existing groups or create your own to explore specific topics.
          </p>
        </div>
      </motion.div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Book className="h-4 w-4 text-gray-400 dark:text-gray-500"/>
          </div>
          <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-sm" placeholder="Search by name, topic, or tag..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map(filter => (<Button key={filter.id} variant={selectedFilter === filter.id ? 'primary' : 'outline'} size="sm" onClick={() => setSelectedFilter(filter.id)} className="rounded-full">
              {filter.label}
            </Button>))}
        </div>
      </div>

      {/* Create Group Button */}
      <div className="flex justify-end">
        <Button variant="gradient" icon={<Plus className="w-5 h-5"/>} className="shadow-lg" onClick={() => setIsCreateModalOpen(true)}>
          Create Group
        </Button>
      </div>

      {/* Group Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.length > 0 ? (filteredGroups.map((group) => (<motion.div key={group.id} variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
          <Card className="p-6 h-full flex flex-col hover:shadow-xl transition-all duration-300 border-0 shadow-lg dark:bg-blue-950/70 overflow-hidden">
                <div className="relative pb-3 mb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-start justify-between">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                {group.name}
                      {group.privacy === 'private' && (<Lock className="h-4 w-4 ml-2 text-gray-500 dark:text-gray-400"/>)}
              </h3>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${skillLevelColors[group.skill_level]}`}>
                      {group.skill_level.charAt(0).toUpperCase() + group.skill_level.slice(1)}
              </span>
            </div>
                  {group.isPopular && (<span className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                      <Star className="h-3 w-3 mr-1 fill-current"/>
                      Popular
                    </span>)}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    {group.description}
                  </p>
            </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <Book className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400"/>
                    <span className="font-medium">Topic:</span>
                    <span className="ml-1">{group.topic}</span>
            </div>

                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <Users className="w-4 h-4 mr-2 text-primary-600 dark:text-primary-400"/>
                    <span className="font-medium">Members:</span>
                    <span className="ml-1">{group.members.length}/{group.max_members}</span>
              </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {group.tags.map((tag, index) => (<span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                        {tag}
                      </span>))}
              </div>
            </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {group.members.slice(0, 3).map((member, i) => (<div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br from-primary-${(i + 3) * 100} to-purple-${(i + 3) * 100} flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-800`} style={{ marginLeft: i > 0 ? '-8px' : '0' }}>
                          {member.charAt(0)}
                        </div>))}
                      {group.members.length > 3 && (<div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 text-xs font-bold border-2 border-white dark:border-gray-800" style={{ marginLeft: '-8px' }}>
                          +{group.members.length - 3}
                        </div>)}
                    </div>
      </div>

                  <Button size="sm" variant={group.members.includes("You") ? "primary" : (group.privacy === "private" ? "secondary" : "outline")} onClick={() => handleJoinGroup(group)} disabled={group.members.includes("You") && group.members.length >= group.max_members} icon={group.privacy === "private" && !group.members.includes("You") ? <Lock className="w-4 h-4 mr-1"/> : undefined}>
                    {group.members.includes("You") ? "Joined" : "Join"}
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => navigate(`/groups/${group.id}`)}>
                    View Details
                  </Button>
                </div>
              </Card>
            </motion.div>))) : (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No study groups found matching your criteria.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => {
                setSearchQuery('');
                setSelectedFilter('all');
            }}>
              Clear Filters
            </Button>
          </motion.div>)}
      </motion.div>
    </div>);
};
export default StudyGroups;
