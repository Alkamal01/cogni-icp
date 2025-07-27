import React, { useState, useEffect } from 'react';
import { Card, FeatureGate, PlanBadge } from '../components/shared';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '../contexts/ToastContext';
import { BookOpen, Users, Clock, Award, MessageSquare, Brain } from 'lucide-react';
import userService, { UserAnalytics } from '../services/userService';
import { useSubscription } from '../contexts/SubscriptionContext';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#FF8042', '#0088FE'];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<UserAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const { hasFeatureAccess } = useSubscription();

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const data = await userService.getUserAnalytics();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        showToast('error', 'Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [showToast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No Analytics Data</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Start learning to see your progress.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Your Learning Analytics
          </h1>
          <PlanBadge />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <FeatureGate feature="analytics" showUpgradePrompt={true}>
        <div className="space-y-8">

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center space-x-4">
            <Clock className="h-8 w-8" />
            <div>
              <h3 className="text-sm font-medium text-blue-100">Total Study Time</h3>
              <p className="text-3xl font-bold">
                {analyticsData.studyTime.total}h
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500 to-teal-600 text-white transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center space-x-4">
            <Award className="h-8 w-8" />
            <div>
              <h3 className="text-sm font-medium text-green-100">Achievements Unlocked</h3>
              <p className="text-3xl font-bold">
                {analyticsData.achievements.total}
          </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-500 to-pink-600 text-white transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center space-x-4">
            <Users className="h-8 w-8" />
            <div>
              <h3 className="text-sm font-medium text-purple-100">Active Study Groups</h3>
              <p className="text-3xl font-bold">
                {analyticsData.social.activeGroups}
          </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-500 to-orange-600 text-white transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center space-x-4">
            <Brain className="h-8 w-8" />
            <div>
              <h3 className="text-sm font-medium text-yellow-100">Average Score</h3>
              <p className="text-3xl font-bold">
                {analyticsData.learning.averageScore}%
          </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Weekly Study Trend (minutes)
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.studyTime.byDay}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} className="text-sm text-gray-600 dark:text-gray-400" />
                <YAxis className="text-sm text-gray-600 dark:text-gray-400" />
              <Tooltip
                contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '0.5rem',
                    color: '#333'
                  }}
                  labelStyle={{ fontWeight: 'bold' }}
              />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Study Time by Subject
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.studyTime.bySubject}
                  dataKey="minutes"
                  nameKey="subject"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {analyticsData.studyTime.bySubject.map((entry: { subject: string, minutes: number }, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              <Tooltip
                contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '0.5rem',
                    color: '#333'
                }}
              />
                <Legend />
              </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
      </div>

       {/* Recent Activity and Progress */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Recent Achievements</h3>
            <ul className="space-y-4">
                {analyticsData.achievements.recent.map((ach: { name: string, date: string, type: string }, index: number) => (
                    <li key={index} className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                           <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{ach.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(ach.date).toLocaleDateString()}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
        <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Learning Progress by Subject</h3>
            <div className="space-y-4">
            {analyticsData.learning.progressBySubject.map((sub: { subject: string, progress: number }, index: number) => (
                <div key={index}>
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{sub.subject}</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{sub.progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div className="bg-gradient-to-r from-blue-500 to-teal-400 h-2.5 rounded-full" style={{ width: `${sub.progress}%` }}></div>
                    </div>
                </div>
            ))}
            </div>
        </Card>
      </div>
        </div>
      </FeatureGate>
    </div>
  );
};

export default Analytics; 