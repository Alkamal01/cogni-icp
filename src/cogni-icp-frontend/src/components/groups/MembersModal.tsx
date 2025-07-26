import React, { useState, useEffect } from 'react';
import { X, User, Users, Check, X as XIcon, MessageSquare, Shield, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../shared';
import Portal from '../shared/Portal';
import { Link } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import studyGroupService from '../../services/studyGroupService';

// Custom icon components for missing icons
const UserPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <line x1="19" y1="8" x2="19" y2="14"></line>
    <line x1="16" y1="11" x2="22" y2="11"></line>
  </svg>
);

const UserMinus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <line x1="16" y1="11" x2="22" y2="11"></line>
  </svg>
);

interface GroupMember {
  id: string;
  name: string;
  role: 'admin' | 'moderator' | 'member';
  avatar?: string;
  lastActive: string;
  skills?: string[];
  learningStyle?: string;
  user_id?: number; // Add user_id for API calls
}

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  members: GroupMember[];
  currentUserId: number;
  isAdmin: boolean;
  creatorId?: number;
  onMemberUpdate?: () => void;
}

const MembersModal: React.FC<MembersModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName,
  members,
  currentUserId,
  isAdmin,
  creatorId,
  onMemberUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showRoleSelector, setShowRoleSelector] = useState<number | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<number | null>(null);
  const { toast } = useToast();

  // Debug logging when modal opens or members change
  useEffect(() => {
    if (isOpen) {
      console.log("MembersModal opened with members:", members);
      console.log("Current user ID:", currentUserId);
      console.log("Is admin:", isAdmin);
    }
  }, [isOpen, members, currentUserId, isAdmin]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleInviteMember = async () => {
    if (!inviteUsername.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a username',
        variant: 'error'
      });
      return;
    }

    try {
      setInviteLoading(true);
      await studyGroupService.inviteToGroup(groupId, inviteUsername);
      
      toast({
        title: 'Success',
        description: `User ${inviteUsername} has been invited to the group`,
        variant: 'success'
      });
      
      setInviteUsername('');
      setShowInviteForm(false);
      
      if (onMemberUpdate) {
        onMemberUpdate();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to invite user',
        variant: 'error'
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleConnectWithMember = (memberId: string) => {
    // This would typically send a connection request to the member
    const memberName = members.find(m => m.id === memberId)?.name;
    toast({
      title: 'Connection Request',
      description: `Connection request sent to ${memberName}`,
      variant: 'info'
    });
  };

  const handleUpdateRole = async (memberId: string, newRole: 'admin' | 'moderator' | 'member') => {
    const member = members.find(m => m.id === memberId);
    console.log("Updating role for member:", member, "with ID:", memberId, "to role:", newRole);
    if (!member || !member.user_id) {
      toast({
        title: 'Error',
        description: 'Cannot update role: Member ID not found',
        variant: 'error'
      });
      return;
    }

    try {
      setActionLoading(member.user_id);
      await studyGroupService.updateMemberRole(groupId, member.user_id, newRole);
      
      toast({
        title: 'Success',
        description: `${member.name}'s role has been updated to ${newRole}`,
        variant: 'success'
      });
      
      setShowRoleSelector(null);
      
      if (onMemberUpdate) {
        onMemberUpdate();
      }
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update role',
        variant: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    console.log("Removing member:", member, "with ID:", memberId);
    if (!member || !member.user_id) {
      toast({
        title: 'Error',
        description: 'Cannot remove member: Member ID not found',
        variant: 'error'
      });
      return;
    }

    try {
      setActionLoading(member.user_id);
      await studyGroupService.removeMember(groupId, member.user_id);
      
      toast({
        title: 'Success',
        description: `${member.name} has been removed from the group`,
        variant: 'success'
      });
      
      setShowRemoveConfirm(null);
      
      if (onMemberUpdate) {
        onMemberUpdate();
      }
    } catch (error: any) {
      console.error("Error removing member:", error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove member',
        variant: 'error'
      });
    } finally {
      setActionLoading(null);
    }
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
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Group Members</h2>
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
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Search members by name..."
                />
              </div>
              <div className="min-w-[180px]">
                <select
                  value={selectedRole}
                  onChange={handleRoleFilterChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="member">Member</option>
                </select>
              </div>
              {(isAdmin) && (
              <Button
                variant="primary"
                  onClick={() => setShowInviteForm(true)}
                className="whitespace-nowrap"
              >
                  <UserPlus />
                  <span className="ml-2">Invite Member</span>
              </Button>
              )}
            </div>
            
            {/* Invite form */}
            {showInviteForm && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Invite User</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inviteUsername}
                    onChange={(e) => setInviteUsername(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter username..."
                  />
                  <Button
                    variant="primary"
                    onClick={handleInviteMember}
                    isLoading={inviteLoading}
                    disabled={inviteLoading}
                  >
                    Invite
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowInviteForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 flex items-center justify-center text-white font-medium shadow-sm">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        member.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-900 dark:text-white">{member.name}</h3>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          member.role === 'admin' 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' 
                            : member.role === 'moderator'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {member.role}
                        </span>
                        
                        {member.user_id === creatorId && (
                          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                            Creator
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Last active: {member.lastActive}
                      </p>
                      {member.skills && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {member.skills.slice(0, 2).map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300"
                            >
                              {skill}
                            </span>
                          ))}
                          {member.skills.length > 2 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                              +{member.skills.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Regular user actions */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnectWithMember(member.id)}
                    >
                      Connect
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    
                    {/* Admin actions */}
                    {isAdmin && member.user_id !== currentUserId && (
                      <div className="relative">
                        {/* Role management dropdown */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("Role button clicked for member:", member);
                            setShowRoleSelector(showRoleSelector === member.user_id ? null : (member.user_id || null));
                          }}
                          disabled={actionLoading !== null || member.user_id === creatorId}
                          className={`${member.user_id === creatorId ? "opacity-50 cursor-not-allowed" : "border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"}`}
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Role <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                        
                        {showRoleSelector === member.user_id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border border-gray-200 dark:border-gray-700">
                            <div className="py-1">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleUpdateRole(member.id, 'admin');
                                }}
                                disabled={member.role === 'admin' || actionLoading !== null}
                                className={`w-full text-left px-4 py-2 text-sm ${member.role === 'admin' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 font-medium' : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                              >
                                {member.role === 'admin' ? '✓ ' : ''}Admin
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleUpdateRole(member.id, 'moderator');
                                }}
                                disabled={member.role === 'moderator' || actionLoading !== null}
                                className={`w-full text-left px-4 py-2 text-sm ${member.role === 'moderator' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-medium' : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                              >
                                {member.role === 'moderator' ? '✓ ' : ''}Moderator
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleUpdateRole(member.id, 'member');
                                }}
                                disabled={member.role === 'member' || actionLoading !== null}
                                className={`w-full text-left px-4 py-2 text-sm ${member.role === 'member' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 font-medium' : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                              >
                                {member.role === 'member' ? '✓ ' : ''}Member
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Remove member button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowRemoveConfirm(member.user_id || null);
                          }}
                          disabled={actionLoading !== null || member.user_id === creatorId}
                          className={`ml-1 ${member.user_id === creatorId ? "opacity-50 cursor-not-allowed" : "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700"}`}
                        >
                          <UserMinus />
                        </Button>
                        
                        {/* Remove confirmation dialog */}
                        {showRemoveConfirm === member.user_id && (
                          <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex flex-col space-y-3">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                Are you sure you want to remove <span className="font-medium">{member.name}</span> from the group?
                              </p>
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowRemoveConfirm(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRemoveMember(member.id);
                                  }}
                                  isLoading={actionLoading === member.user_id}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredMembers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                  <Users className="h-12 w-12 mb-4 stroke-1" />
                  <p className="text-lg font-medium">No members found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium">{filteredMembers.length}</span> of {members.length} members
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

export default MembersModal; 