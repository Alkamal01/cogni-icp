import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoSearch, IoFilter, IoClose, IoStar, IoSparkles, IoPeople, IoBookmark, IoLocationOutline, IoTimeOutline } from 'react-icons/io5';
import { Button } from '../components/shared';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import connectionService from '../services/connectionService';
import { Link } from 'react-router-dom';
const DiscoverLearners = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    // State management
    const [learners, setLearners] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState('recommended');
    const [selectedLearner, setSelectedLearner] = useState(null);
    const [connectionMessage, setConnectionMessage] = useState('');
    const [sendingRequest, setSendingRequest] = useState(null);
    // Filter state
    const [filters, setFilters] = useState({
        skills: [],
        experienceLevel: [],
        studyPreference: [],
        availability: [],
        location: ''
    });
    useEffect(() => {
        console.log('DiscoverLearners: Loading learners from API');
        loadLearners();
    }, [searchQuery, filters]);
    const loadLearners = async () => {
        setIsLoading(true);
        try {
            console.log('DiscoverLearners: Making API call to /api/connections/discover');
            // Make API call to backend with search parameters
            const response = await connectionService.discoverLearners({
                search: searchQuery,
                skills: filters.skills,
                experienceLevel: filters.experienceLevel[0], // Take first one if multiple
                studyPreference: filters.studyPreference[0], // Take first one if multiple
                limit: 50
            });
            const { learners: apiLearners, recommendations: apiRecommendations } = response;
            console.log('DiscoverLearners: API call successful');
            console.log('DiscoverLearners: API response:', response);
            console.log('DiscoverLearners: API data IDs:', apiLearners.map(l => ({ name: l.name, id: l.id })));
            // Set the data from API
            setRecommendations(apiRecommendations || []);
            setLearners(apiLearners || []);
        }
        catch (error) {
            console.error('Error loading learners:', error);
            showToast('error', 'Failed to load learners');
            // Don't fall back to mock data - show empty state instead
            setRecommendations([]);
            setLearners([]);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleSendConnectionRequest = async (learnerId) => {
        setSendingRequest(learnerId);
        try {
            await connectionService.sendConnectionRequest(learnerId, connectionMessage);
            // Update learner status locally
            setLearners(prev => prev.map(learner => learner.id === learnerId
                ? { ...learner, connectionStatus: 'pending' }
                : learner));
            setRecommendations(prev => prev.map(learner => learner.id === learnerId
                ? { ...learner, connectionStatus: 'pending' }
                : learner));
            setConnectionMessage('');
            setSelectedLearner(null);
            showToast('success', 'Connection request sent!');
        }
        catch (error) {
            console.error('Error sending connection request:', error);
            showToast('error', 'Failed to send connection request');
        }
        finally {
            setSendingRequest(null);
        }
    };
    const filteredLearners = learners.filter(learner => {
        const matchesSearch = learner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            learner.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
            learner.interests.some(interest => interest.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesSkills = filters.skills.length === 0 ||
            filters.skills.some(skill => learner.skills.includes(skill));
        const matchesExperience = filters.experienceLevel.length === 0 ||
            filters.experienceLevel.includes(learner.experienceLevel);
        const matchesStudyPref = filters.studyPreference.length === 0 ||
            filters.studyPreference.includes(learner.studyPreference);
        return matchesSearch && matchesSkills && matchesExperience && matchesStudyPref;
    });
    const getCurrentLearners = () => {
        switch (activeTab) {
            case 'recommended':
                return recommendations.filter(learner => learner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    learner.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())));
            case 'recent':
                return filteredLearners.filter(learner => learner.lastActive.includes('Just now') || learner.lastActive.includes('m ago'));
            default:
                return filteredLearners;
        }
    };
    const LearnerCard = ({ learner }) => (<motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="relative">
          <Link to={`/profile/${learner.id}`}>
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-white text-xl font-medium shadow-lg cursor-pointer hover:scale-105 transition-transform">
              {learner.avatar ? (<img src={learner.avatar} alt={learner.name} className="h-16 w-16 rounded-full object-cover"/>) : (learner.name.charAt(0))}
            </div>
          </Link>
          {learner.isOnline && (<div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>)}
          {learner.isRecommended && (<div className="absolute -top-2 -right-2 h-6 w-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <IoSparkles className="h-3 w-3 text-white"/>
            </div>)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Link to={`/profile/${learner.id}`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {learner.name}
                </h3>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{learner.username}</p>
            </div>
            <div className="flex items-center space-x-2">
              {learner.compatibilityScore && (<div className="flex items-center bg-primary-100 dark:bg-primary-900/30 px-2 py-1 rounded-full">
                  <IoStar className="h-3 w-3 text-primary-600 dark:text-primary-400 mr-1"/>
                  <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
                    {learner.compatibilityScore}% match
                  </span>
                </div>)}
            </div>
          </div>

          {/* Bio */}
          {learner.bio && (<p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
              {learner.bio}
            </p>)}

          {/* Skills */}
          <div className="flex flex-wrap gap-1 mb-3">
            {learner.skills.slice(0, 4).map((skill, index) => (<span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                {skill}
              </span>))}
            {learner.skills.length > 4 && (<span className="text-xs text-gray-500 dark:text-gray-400">
                +{learner.skills.length - 4} more
              </span>)}
          </div>

          {/* Recommendation reasons */}
          {learner.isRecommended && learner.recommendationReason && (<div className="mb-3">
              <div className="flex items-center mb-1">
                <IoSparkles className="h-3 w-3 text-yellow-500 mr-1"/>
                <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                  AI Recommended
                </span>
              </div>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {learner.recommendationReason.slice(0, 2).map((reason, index) => (<li key={index} className="flex items-center">
                    <div className="h-1 w-1 bg-gray-400 rounded-full mr-2"></div>
                    {reason}
                  </li>))}
              </ul>
            </div>)}

          {/* Meta info */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <IoTimeOutline className="h-3 w-3 mr-1"/>
                {learner.lastActive}
              </div>
              {learner.location && (<div className="flex items-center">
                  <IoLocationOutline className="h-3 w-3 mr-1"/>
                  {learner.location}
                </div>)}
            </div>
            <div className="capitalize">
              {learner.studyPreference} • {learner.experienceLevel}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 mt-4">
            {learner.connectionStatus === 'none' && (<Button size="sm" onClick={() => setSelectedLearner(learner)} className="flex-1">
                <IoPeople className="h-4 w-4 mr-1"/>
                Connect
              </Button>)}
            {learner.connectionStatus === 'pending' && (<Button size="sm" variant="outline" disabled className="flex-1">
                Request Sent
              </Button>)}
            {learner.connectionStatus === 'connected' && (<Button size="sm" variant="outline" className="flex-1">
                Connected ✓
              </Button>)}
            <Button size="sm" variant="ghost">
              <IoBookmark className="h-4 w-4"/>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>);
    return (<div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Discover Learners
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect with fellow learners, find study partners, and build your learning network
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
            <input type="text" placeholder="Search by name, skills, or interests..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"/>
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <IoFilter className="h-4 w-4 mr-2"/>
            Filters
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {[
            { key: 'recommended', label: '🤖 AI Recommended', count: recommendations.length },
            { key: 'recent', label: '🟢 Recently Active', count: filteredLearners.filter(l => l.lastActive.includes('Just now') || l.lastActive.includes('m ago')).length },
            { key: 'all', label: '👥 All Learners', count: filteredLearners.length }
        ].map((tab) => (<button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
              {tab.label} ({tab.count})
            </button>))}
        </div>
      </div>

      {/* Learners Grid */}
      {isLoading ? (<div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>) : (<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {getCurrentLearners().map((learner) => (<LearnerCard key={learner.id} learner={learner}/>))}
          </AnimatePresence>
        </div>)}

      {getCurrentLearners().length === 0 && !isLoading && (<div className="text-center py-12">
          <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <IoPeople className="h-8 w-8 text-gray-400"/>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No learners found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filters to find more learners.
          </p>
        </div>)}

      {/* Connection Request Modal */}
      <AnimatePresence>
        {selectedLearner && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedLearner(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Connect with {selectedLearner.name}
                </h3>
                <button onClick={() => setSelectedLearner(null)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <IoClose className="h-5 w-5 text-gray-500"/>
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message (optional)
                </label>
                <textarea value={connectionMessage} onChange={(e) => setConnectionMessage(e.target.value)} placeholder="Hi! I'd love to connect and maybe study together..." rows={4} className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"/>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setSelectedLearner(null)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => handleSendConnectionRequest(selectedLearner.id)} disabled={sendingRequest === selectedLearner.id} className="flex-1">
                  {sendingRequest === selectedLearner.id ? 'Sending...' : 'Send Request'}
                </Button>
              </div>
            </motion.div>
          </motion.div>)}
      </AnimatePresence>
    </div>);
};
export default DiscoverLearners;
