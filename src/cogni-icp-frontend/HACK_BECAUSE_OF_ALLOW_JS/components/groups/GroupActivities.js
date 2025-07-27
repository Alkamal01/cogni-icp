import React, { useState } from 'react';
import PollDisplay from './PollDisplay';
import SessionDisplay from './SessionDisplay';
import { Button } from '../shared';
import { Plus } from 'lucide-react';
// Custom icon components for missing icons
const Calendar = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>);
const BarChart2 = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>);
const GroupActivities = ({ groupId, polls, sessions, onCreatePoll, onVotePoll, onClosePoll, onDeletePoll, onCreateSession, onJoinSession, onLeaveSession, onDeleteSession, isAdmin, isModerator = false, creatorId, userId }) => {
    const [activeTab, setActiveTab] = useState('polls');
    const [showPollForm, setShowPollForm] = useState(false);
    const [showSessionForm, setShowSessionForm] = useState(false);
    // Check if user has permission to create content (admin or moderator)
    const canCreateContent = isAdmin || isModerator;
    // Check if user has permission to manage a specific item
    const canManageItem = (creatorUserId) => {
        return isAdmin || (isModerator && creatorUserId !== creatorId) || creatorUserId === userId;
    };
    // Sort polls by creation date (newest first)
    const sortedPolls = [...polls].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    // Sort sessions by date (upcoming first)
    const sortedSessions = [...sessions].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
    });
    // Get active and past sessions
    const upcomingSessions = sortedSessions.filter(session => {
        const sessionDate = new Date(`${session.date}T${session.time}`);
        return sessionDate > new Date();
    });
    const pastSessions = sortedSessions.filter(session => {
        const sessionDate = new Date(`${session.date}T${session.time}`);
        return sessionDate <= new Date();
    });
    return (<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Group Activities</h2>
        
        <div className="flex space-x-2">
          <Button variant={activeTab === 'polls' ? 'primary' : 'outline'} size="sm" onClick={() => setActiveTab('polls')}>
            <BarChart2 className="w-4 h-4 mr-2"/>
            Polls
          </Button>
          <Button variant={activeTab === 'sessions' ? 'primary' : 'outline'} size="sm" onClick={() => setActiveTab('sessions')}>
            <Calendar className="w-4 h-4 mr-2"/>
            Study Sessions
          </Button>
        </div>
      </div>

      {activeTab === 'polls' && (<div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Polls
            </h3>
            
            {canCreateContent && (<Button variant="outline" size="sm" onClick={() => setShowPollForm(true)}>
                <Plus className="w-4 h-4 mr-1"/>
                New Poll
              </Button>)}
          </div>

          {polls.length === 0 ? (<div className="text-center py-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">No polls have been created yet.</p>
              {canCreateContent && (<Button variant="ghost" size="sm" onClick={() => setShowPollForm(true)} className="mt-2">
                  <Plus className="w-4 h-4 mr-1"/>
                  Create the first poll
                </Button>)}
            </div>) : (<div className="space-y-4">
              {sortedPolls.map(poll => {
                    // Determine if user can close/delete this poll
                    const canManage = canManageItem(poll.creator_id);
                    return (<PollDisplay key={poll.id} poll={poll} onVote={onVotePoll} onClose={canManage ? onClosePoll : undefined} onDelete={canManage ? onDeletePoll : undefined} isAdmin={isAdmin} isCreator={userId === poll.creator_id}/>);
                })}
            </div>)}
        </div>)}

      {activeTab === 'sessions' && (<div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Upcoming Study Sessions
            </h3>
            
            {canCreateContent && (<Button variant="outline" size="sm" onClick={() => setShowSessionForm(true)}>
                <Plus className="w-4 h-4 mr-1"/>
                Schedule Session
              </Button>)}
          </div>

          {upcomingSessions.length === 0 ? (<div className="text-center py-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-6">
              <p className="text-gray-500 dark:text-gray-400">No upcoming sessions scheduled.</p>
              {canCreateContent && (<Button variant="ghost" size="sm" onClick={() => setShowSessionForm(true)} className="mt-2">
                  <Plus className="w-4 h-4 mr-1"/>
                  Schedule your first session
                </Button>)}
            </div>) : (<div className="space-y-4 mb-6">
              {upcomingSessions.map(session => {
                    // Determine if user can manage this session
                    const canManage = canManageItem(session.creator_id);
                    return (<SessionDisplay key={session.id} session={session} onJoin={onJoinSession} onLeave={onLeaveSession} onDelete={canManage ? onDeleteSession : undefined} isAdmin={isAdmin} isCreator={userId === session.creator_id}/>);
                })}
            </div>)}

          {pastSessions.length > 0 && (<>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                Past Sessions
              </h3>
              <div className="space-y-4">
                {pastSessions.map(session => {
                    // Determine if user can manage this session
                    const canManage = canManageItem(session.creator_id);
                    return (<SessionDisplay key={session.id} session={session} onJoin={onJoinSession} onLeave={onLeaveSession} onDelete={canManage ? onDeleteSession : undefined} isAdmin={isAdmin} isCreator={userId === session.creator_id}/>);
                })}
              </div>
            </>)}
        </div>)}

      {/* We'd need to implement the form components for creating polls and sessions */}
      {/* This is just a placeholder for where they would be rendered */}
      {showPollForm && (<div>
          {/* <PollForm onSubmit={onCreatePoll} onCancel={() => setShowPollForm(false)} /> */}
        </div>)}
      
      {showSessionForm && (<div>
          {/* <SessionForm onSubmit={onCreateSession} onCancel={() => setShowSessionForm(false)} /> */}
        </div>)}
    </div>);
};
export default GroupActivities;
