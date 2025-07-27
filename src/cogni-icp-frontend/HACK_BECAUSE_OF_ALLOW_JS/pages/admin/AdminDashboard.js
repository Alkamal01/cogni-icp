import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { IoShield, IoLogOut, IoPeople, IoCheckmarkCircle, IoCalendar, IoWarning, IoAdd, IoPencil, IoTrash } from 'react-icons/io5';
import { Button, Card } from '../../components/shared';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { adminApi } from '../../utils/adminApi';
const AdminDashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [newSubscription, setNewSubscription] = useState('');
    const [generatedPassword, setGeneratedPassword] = useState(null);
    const [generatedPasswordUser, setGeneratedPasswordUser] = useState(null);
    const [activeTab, setActiveTab] = useState('users');
    const [tasks, setTasks] = useState([]);
    const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
    const [isCreatingTask, setIsCreatingTask] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        category: 'General',
        difficulty: 'medium',
        token_reward: 10,
        points_reward: 100,
        requirements: '',
        is_repeatable: false,
        max_completions: 1,
        expires_at: '',
        metadata: ''
    });
    // User editing state
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isUpdatingUser, setIsUpdatingUser] = useState(false);
    // Task editing state
    const [showEditTaskModal, setShowEditTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [isUpdatingTask, setIsUpdatingTask] = useState(false);
    const { logout } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    useEffect(() => {
        const loadAdminData = async () => {
            setIsLoading(true);
            try {
                await adminApi.verifyAccess();
                const [statsData, usersData] = await Promise.all([
                    adminApi.getStats(),
                    adminApi.getUsers({ per_page: 50 })
                ]);
                setStats(statsData.stats);
                const userData = usersData.users || [];
                setUsers(userData);
                setFilteredUsers(userData);
            }
            catch (error) {
                toast({ title: 'Loading Failed', description: 'Failed to load admin data.', variant: 'error' });
                navigate('/admin/login');
            }
            finally {
                setIsLoading(false);
            }
        };
        loadAdminData();
    }, []);
    useEffect(() => {
        if (activeTab === 'rewards') {
            loadRewardTasks();
        }
    }, [activeTab]);
    const loadRewardTasks = async () => {
        try {
            const response = await adminApi.getTasks();
            setTasks(response.tasks || []);
        }
        catch (error) {
            toast({ title: 'Failed to Load Tasks', description: 'Could not load reward tasks.', variant: 'error' });
        }
    };
    useEffect(() => {
        let filtered = users;
        if (searchQuery) {
            filtered = filtered.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter(user => user.status === statusFilter);
        }
        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }
        setFilteredUsers(filtered);
    }, [users, searchQuery, statusFilter, roleFilter]);
    const handleCreateTask = async () => {
        setIsCreatingTask(true);
        try {
            // Format data to match smart contract structure
            const dataToSend = {
                title: newTask.title,
                description: newTask.description,
                category: newTask.category,
                difficulty: newTask.difficulty,
                token_reward: newTask.token_reward,
                points_reward: newTask.points_reward,
                requirements: newTask.requirements,
                is_repeatable: newTask.is_repeatable,
                max_completions: newTask.max_completions,
                expires_at: newTask.expires_at ? parseInt(newTask.expires_at) : 0,
                metadata: newTask.metadata || '',
                public_id: `task_${Date.now()}` // For backend compatibility
            };
            const response = await adminApi.createTask(dataToSend);
            setTasks([...tasks, response.task]);
            setShowCreateTaskModal(false);
            setNewTask({
                title: '', description: '', category: 'General', difficulty: 'medium',
                token_reward: 10, points_reward: 100, requirements: '',
                is_repeatable: false, max_completions: 1, expires_at: '', metadata: ''
            });
            toast({ title: 'Task Created', description: 'Reward task created successfully.', variant: 'success' });
        }
        catch (error) {
            toast({ title: 'Failed to Create Task', description: error.message, variant: 'error' });
        }
        finally {
            setIsCreatingTask(false);
        }
    };
    const handleDeleteTask = async (taskId) => {
        try {
            await adminApi.deleteTask(taskId);
            setTasks(tasks.filter(task => task.id !== taskId));
            toast({ title: 'Task Deleted', description: 'The task has been successfully deleted.', variant: 'success' });
        }
        catch (error) {
            toast({ title: 'Failed to Delete Task', description: error.message, variant: 'error' });
        }
    };
    const handleToggleTaskStatus = async (taskId, currentStatus) => {
        try {
            await adminApi.updateTask(taskId, { is_active: !currentStatus });
            loadRewardTasks();
            toast({ title: 'Task Updated', description: `Task status changed to ${!currentStatus ? 'Active' : 'Inactive'}.`, variant: 'success' });
        }
        catch (error) {
            toast({ title: 'Failed to Update Task', description: error.message, variant: 'error' });
        }
    };
    const handleEditTask = (task) => {
        setEditingTask(task);
        setShowEditTaskModal(true);
    };
    const handleUpdateTask = async () => {
        if (!editingTask)
            return;
        setIsUpdatingTask(true);
        try {
            const response = await adminApi.updateTask(editingTask.public_id, {
                title: editingTask.title,
                description: editingTask.description,
                category: editingTask.category,
                difficulty: editingTask.difficulty,
                token_reward: editingTask.token_reward,
                points_reward: editingTask.points_reward,
                requirements: editingTask.requirements,
                is_repeatable: editingTask.is_repeatable,
                max_completions: editingTask.max_completions,
                expires_at: editingTask.expires_at,
                metadata: editingTask.metadata || {}
            });
            // Reload tasks to get updated data
            loadRewardTasks();
            setShowEditTaskModal(false);
            setEditingTask(null);
            toast({ title: 'Task Updated', description: 'Task information updated successfully.', variant: 'success' });
        }
        catch (error) {
            toast({ title: 'Failed to Update Task', description: error.message, variant: 'error' });
        }
        finally {
            setIsUpdatingTask(false);
        }
    };
    // User editing functions
    const handleEditUser = (user) => {
        setEditingUser(user);
        setShowEditUserModal(true);
    };
    const handleUpdateUser = async () => {
        if (!editingUser)
            return;
        setIsUpdatingUser(true);
        try {
            // Update user status if changed
            if (editingUser.status !== users.find(u => u.id === editingUser.id)?.status) {
                await adminApi.updateUserStatus(editingUser.id, editingUser.status);
            }
            // Update user role if changed
            if (editingUser.role !== users.find(u => u.id === editingUser.id)?.role) {
                await adminApi.updateUserRole(editingUser.id, editingUser.role);
            }
            // Update user subscription if changed
            if (editingUser.subscription !== users.find(u => u.id === editingUser.id)?.subscription) {
                await adminApi.updateUserSubscription(editingUser.id, editingUser.subscription);
            }
            // Reload users to get updated data
            const usersData = await adminApi.getUsers({ per_page: 50 });
            const userData = usersData.users || [];
            setUsers(userData);
            setFilteredUsers(userData);
            setShowEditUserModal(false);
            setEditingUser(null);
            toast({ title: 'User Updated', description: 'User information updated successfully.', variant: 'success' });
        }
        catch (error) {
            toast({ title: 'Failed to Update User', description: error.message, variant: 'error' });
        }
        finally {
            setIsUpdatingUser(false);
        }
    };
    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        logout();
        navigate('/admin/login');
    };
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString();
    if (isLoading) {
        return (<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>);
    }
    return (<>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-md">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <IoShield className="h-8 w-8 text-blue-600"/>
              <h1 className="ml-3 text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            </div>
            <Button variant="secondary" onClick={handleLogout}><IoLogOut className="mr-2"/>Logout</Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {stats && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <IoPeople className="h-6 w-6 text-blue-600"/>
                <p>Total Users</p><p>{stats.totalUsers}</p>
              </Card>
              <Card className="p-6">
                <IoCheckmarkCircle className="h-6 w-6 text-green-600"/>
                <p>Active Users</p><p>{stats.activeUsers}</p>
              </Card>
              <Card className="p-6">
                <IoCalendar className="h-6 w-6 text-yellow-600"/>
                <p>New Today</p><p>{stats.newUsersToday}</p>
              </Card>
              <Card className="p-6">
                <IoWarning className="h-6 w-6 text-red-600"/>
                <p>Suspended</p><p>{stats.suspendedUsers}</p>
              </Card>
            </motion.div>)}

          <div className="mb-6">
            <div className="flex space-x-4">
              <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'font-bold' : ''}>User Management</button>
              <button onClick={() => setActiveTab('rewards')} className={activeTab === 'rewards' ? 'font-bold' : ''}>Reward Tasks</button>
            </div>
          </div>

          {activeTab === 'users' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">User Management</h2>
                <div className="flex space-x-2">
                  <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="tutor">Tutor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                {isLoading ? (<div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading users...</p>
                  </div>) : filteredUsers.length > 0 ? (<div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subscription</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joined</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredUsers.map((user) => (<tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                    {user.avatar ? (<img className="h-10 w-10 rounded-full object-cover" src={user.avatar} alt=""/>) : (<span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                      </span>)}
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'}`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {user.role}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {user.subscription}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(user.joinDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3">
                                Edit
                              </button>
                              <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                Suspend
                              </button>
                            </td>
                          </tr>))}
                      </tbody>
                    </table>
                  </div>) : (<div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <p>No users found matching your criteria.</p>
                  </div>)}
              </div>
            </motion.div>)}

          {activeTab === 'rewards' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Reward Tasks</h2>
                <Button onClick={() => setShowCreateTaskModal(true)}><IoAdd className="mr-2"/>Create Task</Button>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                {tasks.length > 0 ? (<div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {tasks.map(task => (<div key={task.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {task.token_reward} tokens
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${task.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                {task.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{task.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>Category: {task.category}</span>
                              <span>Difficulty: {task.difficulty}</span>
                              <span>Points: {task.points_reward}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button onClick={() => handleToggleTaskStatus(task.public_id, task.is_active)} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title={task.is_active ? 'Deactivate Task' : 'Activate Task'}>
                              <IoCheckmarkCircle className="h-4 w-4"/>
                            </button>
                            <button onClick={() => handleEditTask(task)} className="p-2 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors" title="Edit Task">
                              <IoPencil className="h-4 w-4"/>
                            </button>
                            <button onClick={() => handleDeleteTask(task.public_id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete Task">
                              <IoTrash className="h-4 w-4"/>
                            </button>
                          </div>
                        </div>
                      </div>))}
                  </div>) : (<div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <p>No tasks created yet. Create your first task!</p>
                  </div>)}
              </div>
            </motion.div>)}
        </main>
      </div>

      <AnimatePresence>
        {showCreateTaskModal && (<motion.div key="create-task-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-bold mb-4">Create New Reward Task</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleCreateTask(); }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                    <input type="text" placeholder="Task title" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required/>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea placeholder="Task description" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows={3} required/>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                      <select value={newTask.category} onChange={e => setNewTask({ ...newTask, category: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="General">General</option>
                        <option value="Learning">Learning</option>
                        <option value="Social">Social</option>
                        <option value="Achievement">Achievement</option>
                        <option value="Challenge">Challenge</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
                      <select value={newTask.difficulty} onChange={e => setNewTask({ ...newTask, difficulty: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Token Reward</label>
                      <input type="number" placeholder="Tokens to award" value={newTask.token_reward || ''} onChange={e => setNewTask({ ...newTask, token_reward: parseInt(e.target.value) || 0 })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" min="1" required/>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Points Reward</label>
                      <input type="number" placeholder="Points to award" value={newTask.points_reward || ''} onChange={e => setNewTask({ ...newTask, points_reward: parseInt(e.target.value) || 0 })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" min="0" required/>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Requirements</label>
                    <textarea placeholder="Task requirements or instructions" value={newTask.requirements} onChange={e => setNewTask({ ...newTask, requirements: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows={2} required/>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Completions</label>
                      <input type="number" placeholder="Maximum completions allowed" value={newTask.max_completions || ''} onChange={e => setNewTask({ ...newTask, max_completions: parseInt(e.target.value) || 1 })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" min="1" required/>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expires At (Epoch)</label>
                      <input type="number" placeholder="0 for no expiration" value={newTask.expires_at || ''} onChange={e => setNewTask({ ...newTask, expires_at: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" min="0"/>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Metadata (Optional)</label>
                    <textarea placeholder="Additional metadata in JSON format" value={newTask.metadata || ''} onChange={e => setNewTask({ ...newTask, metadata: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows={2}/>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="is_repeatable" checked={newTask.is_repeatable} onChange={e => setNewTask({ ...newTask, is_repeatable: e.target.checked })} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                    <label htmlFor="is_repeatable" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Task is repeatable
                    </label>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowCreateTaskModal(false)}>Cancel</Button>
                    <Button type="submit" disabled={isCreatingTask}>
                      {isCreatingTask ? 'Creating...' : 'Create Task'}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>)}

        {/* Edit User Modal */}
        {showEditUserModal && editingUser && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-bold mb-4">Edit User: {editingUser.name}</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateUser(); }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name
                    </label>
                    <input type="text" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required/>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input type="email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required/>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select value={editingUser.status} onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <select value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="user">User</option>
                      <option value="tutor">Tutor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subscription
                    </label>
                    <select value={editingUser.subscription} onChange={(e) => setEditingUser({ ...editingUser, subscription: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => {
                setShowEditUserModal(false);
                setEditingUser(null);
            }}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUpdatingUser}>
                      {isUpdatingUser ? 'Updating...' : 'Update User'}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>)}

        {/* Edit Task Modal */}
        {showEditTaskModal && editingTask && (<motion.div key="edit-task-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Edit Task: {editingTask.title}</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateTask(); }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                    <input type="text" placeholder="Task title" value={editingTask.title} onChange={e => setEditingTask({ ...editingTask, title: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" required/>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea placeholder="Task description" value={editingTask.description} onChange={e => setEditingTask({ ...editingTask, description: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows={3} required/>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                      <select value={editingTask.category} onChange={e => setEditingTask({ ...editingTask, category: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="General">General</option>
                        <option value="Learning">Learning</option>
                        <option value="Social">Social</option>
                        <option value="Achievement">Achievement</option>
                        <option value="Challenge">Challenge</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
                      <select value={editingTask.difficulty} onChange={e => setEditingTask({ ...editingTask, difficulty: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Token Reward</label>
                      <input type="number" placeholder="Tokens to award" value={editingTask.token_reward || ''} onChange={e => setEditingTask({ ...editingTask, token_reward: parseInt(e.target.value) || 0 })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" min="1" required/>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Points Reward</label>
                      <input type="number" placeholder="Points to award" value={editingTask.points_reward || ''} onChange={e => setEditingTask({ ...editingTask, points_reward: parseInt(e.target.value) || 0 })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" min="0" required/>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Requirements</label>
                    <textarea placeholder="Task requirements or instructions" value={editingTask.requirements} onChange={e => setEditingTask({ ...editingTask, requirements: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows={2} required/>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Completions</label>
                      <input type="number" placeholder="Maximum completions allowed" value={editingTask.max_completions} onChange={e => setEditingTask({ ...editingTask, max_completions: parseInt(e.target.value) || 1 })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" min="1" required/>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expires At (Epoch)</label>
                      <input type="number" placeholder="0 for no expiration" value={editingTask.expires_at || ''} onChange={e => setEditingTask({ ...editingTask, expires_at: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" min="0"/>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Metadata (Optional)</label>
                    <textarea placeholder="Additional metadata in JSON format" value={typeof editingTask.metadata === 'string' ? editingTask.metadata : JSON.stringify(editingTask.metadata || {}, null, 2)} onChange={e => setEditingTask({ ...editingTask, metadata: e.target.value })} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows={2}/>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="edit_is_repeatable" checked={editingTask.is_repeatable} onChange={e => setEditingTask({ ...editingTask, is_repeatable: e.target.checked })} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                    <label htmlFor="edit_is_repeatable" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Task is repeatable
                    </label>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => {
                setShowEditTaskModal(false);
                setEditingTask(null);
            }}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUpdatingTask}>
                      {isUpdatingTask ? 'Updating...' : 'Update Task'}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>)}


      </AnimatePresence>
    </>);
};
export default AdminDashboard;
