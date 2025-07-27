import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Loading } from '../components/shared';
import tutorService from '../services/tutorService';
import { useDebounce } from '../hooks/useDebounce';
import { aiSocketService } from '../services/aiSocketService';
import { useStreamingTutor } from '../hooks/useStreamingTutor';
// Import new components
import DeleteConfirmationModal from '../components/tutors/DeleteConfirmationModal';
import CourseSidebar from '../components/tutors/CourseSidebar';
import ChatArea from '../components/tutors/ChatArea';
import TopicListView from '../components/tutors/TopicListView';
const TutorSession = () => {
    const { id: tutorId, sessionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    // State management
    const [tutor, setTutor] = useState(null);
    const [session, setSession] = useState(null);
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [progress, setProgress] = useState(null);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCourseSidebarOpen, setIsCourseSidebarOpen] = useState(true);
    const [expandedModule, setExpandedModule] = useState(null);
    // Voice chat state
    const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false);
    // Topic list state (for when no session is active)
    const [tutorSessions, setTutorSessions] = useState([]);
    const [topicListLoading, setTopicListLoading] = useState(false);
    const [topicListError, setTopicListError] = useState(null);
    const [topicSuggestions, setTopicSuggestions] = useState([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [topic, setTopic] = useState('');
    const [isStartingSession, setIsStartingSession] = useState(false);
    const [topicValidation, setTopicValidation] = useState(null);
    const [showValidationMessage, setShowValidationMessage] = useState(false);
    const [isValidatingTopic, setIsValidatingTopic] = useState(false);
    // Delete modal state
    const [deletingSessionId, setDeletingSessionId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const [debouncedTopic] = useDebounce(topic, 500);
    // Use the streaming tutor hook for message management
    const { messages, status: tutorStatus, sendMessage, isConnected, isError, loadInitialMessages } = useStreamingTutor(sessionId);
    // Initialize session
    const initializeSession = async () => {
        if (!tutorId)
            return;
        try {
            setIsLoading(true);
            setError(null);
            // Fetch tutor data
            const tutorData = await tutorService.getTutor(tutorId);
            setTutor(tutorData);
            if (sessionId && sessionId !== 'undefined') {
                // Fetch session data
                const sessionData = await tutorService.getSession(sessionId);
                setSession(sessionData.session);
                setCourse(sessionData.course);
                setModules(sessionData.modules || []);
                setProgress(sessionData.progress);
                // Load initial messages using the hook
                loadInitialMessages(sessionData.messages || []);
            }
            else {
                // No active session, show topic list
                await fetchTutorSessions();
                // Load topic suggestions asynchronously after main content is displayed
                fetchTopicSuggestions(tutorId);
            }
        }
        catch (err) {
            console.error('Error initializing session:', err);
            setError(err instanceof Error ? err.message : 'Failed to load session');
        }
        finally {
            setIsLoading(false);
        }
    };
    // Fetch tutor sessions for topic list
    const fetchTutorSessions = async () => {
        if (!tutorId)
            return;
        try {
            setTopicListLoading(true);
            const sessions = await tutorService.getTutorSessions(tutorId);
            setTutorSessions(sessions);
        }
        catch (err) {
            console.error('Error fetching tutor sessions:', err);
            setTopicListError('Failed to load previous sessions');
        }
        finally {
            setTopicListLoading(false);
        }
    };
    // Fetch topic suggestions
    const fetchTopicSuggestions = async (tutorId) => {
        try {
            setIsLoadingSuggestions(true);
            const suggestions = await tutorService.getSuggestedTopics(tutorId);
            setTopicSuggestions(suggestions);
        }
        catch (err) {
            console.error('Error fetching topic suggestions:', err);
        }
        finally {
            setIsLoadingSuggestions(false);
        }
    };
    // Validate topic
    const validateTopic = async () => {
        if (!tutorId || !debouncedTopic || !debouncedTopic.trim())
            return;
        try {
            setIsValidatingTopic(true);
            const validation = await tutorService.validateTopic(tutorId, debouncedTopic);
            setTopicValidation(validation);
            setShowValidationMessage(true);
        }
        catch (err) {
            console.error('Error validating topic:', err);
        }
        finally {
            setIsValidatingTopic(false);
        }
    };
    // Start new session
    const handleStartSession = async (e) => {
        e.preventDefault();
        if (!tutorId || !topic.trim())
            return;
        try {
            setIsStartingSession(true);
            const newSession = await tutorService.startSession(tutorId, topic);
            navigate(`/tutors/${tutorId}/${newSession.public_id}`);
        }
        catch (err) {
            console.error('Error starting session:', err);
            showToast('error', 'Failed to start session');
        }
        finally {
            setIsStartingSession(false);
        }
    };
    // Handle topic suggestion click
    const handleTopicSuggestionClick = (suggestion) => {
        setTopic(suggestion.topic);
    };
    // Send message
    const handleSendMessage = () => {
        if (!input.trim() || !session || isSending)
            return;
        sendMessage(input.trim());
        setInput('');
        setIsSending(true);
    };
    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    // Toggle course sidebar
    const toggleCourseSidebar = () => setIsCourseSidebarOpen(!isCourseSidebarOpen);
    // Toggle voice chat
    const toggleVoiceChat = () => setIsVoiceChatOpen(true);
    const closeVoiceChat = () => setIsVoiceChatOpen(false);
    // Module functions
    const toggleModule = (moduleId) => {
        setExpandedModule(expandedModule === moduleId ? null : moduleId);
    };
    const getModuleStatusIcon = (moduleStatus, isCurrent) => {
        // Implementation for module status icons
        return <div className="w-4 h-4 rounded-full bg-gray-300"></div>;
    };
    const completeModule = async (moduleId) => {
        // Implementation for completing modules
        console.log('Complete module:', moduleId);
    };
    const completeSession = async () => {
        // Implementation for completing sessions
        console.log('Complete session');
    };
    // Delete session functions
    const openDeleteModal = (sessionId) => {
        setDeletingSessionId(sessionId);
    };
    const handleDeleteSession = async (sessionId) => {
        try {
            setIsDeleting(true);
            setDeleteError(null);
            await tutorService.deleteSession(sessionId);
            setDeletingSessionId(null);
            await fetchTutorSessions();
            showToast('success', 'Session deleted successfully');
        }
        catch (err) {
            console.error('Error deleting session:', err);
            setDeleteError('Failed to delete session');
        }
        finally {
            setIsDeleting(false);
        }
    };
    // Format time utility
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        if (diffInHours < 1) {
            return 'Just now';
        }
        else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        }
        else {
            return date.toLocaleDateString();
        }
    };
    // Effects
    useEffect(() => {
        initializeSession();
    }, [tutorId, sessionId]);
    useEffect(() => {
        if (debouncedTopic && debouncedTopic.length > 3) {
            validateTopic();
        }
    }, [debouncedTopic, tutorId]);
    useEffect(() => {
        // WebSocket event listeners for progress updates only
        const handleProgress = (update) => {
            setProgress(prev => prev ? { ...prev, progress_percentage: update.progress.progress_percentage } : null);
        };
        if (session) {
            aiSocketService.onProgressUpdate(handleProgress);
        }
        return () => {
            aiSocketService.offProgressUpdate(handleProgress);
        };
    }, [session]);
    // Update isSending based on tutor status
    useEffect(() => {
        if (tutorStatus === 'idle') {
            setIsSending(false);
        }
    }, [tutorStatus]);
    // Loading state
    if (isLoading) {
        return (<div className="flex items-center justify-center h-screen">
        <Loading />
      </div>);
    }
    // Error state
    if (error) {
        return (<div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
            Retry
          </button>
        </div>
      </div>);
    }
    // No session - show topic list
    if (!session && tutor) {
        return (<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TopicListView tutor={tutor} tutorSessions={tutorSessions} topicListLoading={topicListLoading} topicListError={topicListError} topicSuggestions={topicSuggestions} isLoadingSuggestions={isLoadingSuggestions} onStartSession={handleStartSession} onTopicSuggestionClick={handleTopicSuggestionClick} topic={topic} setTopic={setTopic} isStartingSession={isStartingSession} topicValidation={topicValidation} showValidationMessage={showValidationMessage} isValidatingTopic={isValidatingTopic} navigate={navigate} openDeleteModal={openDeleteModal} deletingSessionId={deletingSessionId} isDeleting={isDeleting} deleteError={deleteError} handleDeleteSession={handleDeleteSession} setDeletingSessionId={setDeletingSessionId}/>
      </div>);
    }
    // Active session - show chat interface
    if (!tutor || !session || !course || !progress) {
        return (<div className="flex items-center justify-center h-screen">
          <Loading />
      </div>);
    }
    return (<div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal isOpen={!!deletingSessionId} onClose={() => setDeletingSessionId(null)} onConfirm={handleDeleteSession} isDeleting={isDeleting} error={deleteError} sessionToDeleteId={deletingSessionId}/>

          {/* Course Sidebar */}
      <CourseSidebar tutor={tutor} tutorId={tutorId || ''} session={session} course={course} modules={modules} progress={progress} expandedModule={expandedModule} isCourseSidebarOpen={isCourseSidebarOpen} onToggleSidebar={toggleCourseSidebar} onToggleModule={toggleModule} onCompleteModule={completeModule} onCompleteSession={completeSession} onDeleteSession={openDeleteModal} formatTime={formatTime} getModuleStatusIcon={getModuleStatusIcon}/>

      {/* Chat Area */}
      <ChatArea tutor={tutor} messages={messages} input={input} isSending={isSending} tutorStatus={tutorStatus} isConnected={isConnected} isError={!!error} isCourseSidebarOpen={isCourseSidebarOpen} sessionStatus={session.status} sessionId={sessionId} isVoiceChatOpen={isVoiceChatOpen} onToggleSidebar={toggleCourseSidebar} onInputChange={setInput} onSendMessage={handleSendMessage} onKeyPress={handleKeyPress} onToggleVoiceChat={toggleVoiceChat} onCloseVoiceChat={closeVoiceChat} user={user}/>
    </div>);
};
export default TutorSession;
