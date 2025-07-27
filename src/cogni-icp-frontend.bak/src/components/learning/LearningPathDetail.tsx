import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  ChevronDown as ArrowLeftIcon,
  MessageSquare as PlayIcon,
  BookOpen as FileTextIcon,
  Zap,
  Award,
  Lock,
  User,
  Users,
  MessageSquare,
  AlertCircle,
  Brain,
  CreditCard
} from 'lucide-react';
import { Button, Card } from '../shared';
import api from '../../utils/apiClient';
import { useToast } from '../../contexts/ToastContext';

// Define interfaces for the learning path data structure
interface Module {
  id: number;
  title: string;
  description: string;
  duration: string;
  type: 'video' | 'reading' | 'quiz' | 'practice' | 'project';
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  progress?: number;
  resources?: Resource[];
}

interface Resource {
  id: number;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'code';
  url: string;
}

interface LearningPath {
  id: number;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  thumbnail: string;
  instructor: {
    name: string;
    title: string;
    avatar: string;
  };
  modules: Module[];
  tags: string[];
  progress: number;
  enrolledCount: number;
  rating: number;
  completionRate: number;
  isAdaptive: boolean;
}

const LearningPathDetail: React.FC = () => {
  const { pathId } = useParams<{ pathId: string }>();
  const navigate = useNavigate();
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Mock fetch learning path data
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchData = async () => {
      setIsLoading(true);
      
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data for this example
      const mockLearningPath: LearningPath = {
        id: parseInt(pathId || '1'),
        title: "Introduction to Machine Learning",
        description: "Learn the fundamentals of machine learning algorithms and applications through an interactive, project-based approach. This path is designed to take you from the basic concepts to implementing your own models.",
        level: "Beginner",
        duration: "6 weeks",
        thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bWFjaGluZSUyMGxlYXJuaW5nfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
        instructor: {
          name: "Dr. Sarah Johnson",
          title: "AI Research Lead",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80"
        },
        modules: [
          {
            id: 1,
            title: "Introduction to Machine Learning Concepts",
            description: "Learn the fundamental concepts and terminology of machine learning.",
            duration: "45 minutes",
            type: "video",
            status: "completed",
            progress: 100,
            resources: [
              {
                id: 101,
                title: "ML Glossary",
                type: "pdf",
                url: "/resources/ml-glossary.pdf"
              },
              {
                id: 102,
                title: "History of ML",
                type: "link",
                url: "https://example.com/history-of-ml"
              }
            ]
          },
          {
            id: 2,
            title: "Supervised Learning: Classification",
            description: "Understand how classification algorithms work and when to use them.",
            duration: "1.5 hours",
            type: "video",
            status: "completed",
            progress: 100
          },
          {
            id: 3,
            title: "Supervised Learning: Regression",
            description: "Learn about regression techniques and their applications.",
            duration: "1 hour",
            type: "video",
            status: "in-progress",
            progress: 60,
            resources: [
              {
                id: 103,
                title: "Regression Dataset",
                type: "code",
                url: "/resources/regression-dataset.zip"
              }
            ]
          },
          {
            id: 4,
            title: "Evaluating Machine Learning Models",
            description: "Learn methods to evaluate and improve model performance.",
            duration: "1.5 hours",
            type: "reading",
            status: "available",
            progress: 0
          },
          {
            id: 5,
            title: "Feature Engineering",
            description: "Learn how to select and transform features for better model performance.",
            duration: "2 hours",
            type: "practice",
            status: "available",
            progress: 0
          },
          {
            id: 6,
            title: "Mid-path Assessment",
            description: "Test your knowledge of the concepts covered so far.",
            duration: "1 hour",
            type: "quiz",
            status: "locked",
            progress: 0
          },
          {
            id: 7,
            title: "Unsupervised Learning",
            description: "Explore clustering and dimensionality reduction techniques.",
            duration: "2 hours",
            type: "video",
            status: "locked",
            progress: 0
          },
          {
            id: 8,
            title: "Final Project: Building a Prediction Model",
            description: "Apply everything you've learned to build a comprehensive ML model.",
            duration: "4 hours",
            type: "project",
            status: "locked",
            progress: 0
          }
        ],
        tags: ["AI", "Python", "Data Science"],
        progress: 35,
        enrolledCount: 2453,
        rating: 4.8,
        completionRate: 87,
        isAdaptive: true
      };
      
      setLearningPath(mockLearningPath);
      
      // Find the first in-progress module or the first available module
      const firstInProgressModule = mockLearningPath.modules.find(module => module.status === 'in-progress');
      const firstAvailableModule = mockLearningPath.modules.find(module => module.status === 'available');
      
      if (firstInProgressModule) {
        setSelectedModule(firstInProgressModule.id);
      } else if (firstAvailableModule) {
        setSelectedModule(firstAvailableModule.id);
      } else {
        setSelectedModule(mockLearningPath.modules[0].id);
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, [pathId]);

  const getModuleTypeIcon = (type: Module['type']) => {
    switch(type) {
      case 'video':
        return <PlayIcon className="h-4 w-4" />;
      case 'reading':
        return <FileTextIcon className="h-4 w-4" />;
      case 'quiz':
        return <AlertCircle className="h-4 w-4" />;
      case 'practice':
        return <Zap className="h-4 w-4" />;
      case 'project':
        return <Brain className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };
  
  const getModuleStatusColor = (status: Module['status']) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400';
      case 'available':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      case 'locked':
        return 'bg-gray-100 text-gray-500 dark:bg-gray-800/50 dark:text-gray-500';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };
  
  const getModuleStatusIcon = (status: Module['status']) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <PlayIcon className="h-4 w-4" />;
      case 'available':
        return <ArrowRight className="h-4 w-4" />;
      case 'locked':
        return <Lock className="h-4 w-4" />;
      default:
        return <ArrowRight className="h-4 w-4" />;
    }
  };
  
  const getResourceTypeIcon = (type: Resource['type']) => {
    switch(type) {
      case 'pdf':
        return <FileTextIcon className="h-4 w-4 text-red-500" />;
      case 'video':
        return <PlayIcon className="h-4 w-4 text-blue-500" />;
      case 'link':
        return <ArrowRight className="h-4 w-4 text-purple-500" />;
      case 'code':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      default:
        return <FileTextIcon className="h-4 w-4" />;
    }
  };
  
  const startOrContinueModule = (moduleId: number) => {
    // In a real app, this would navigate to the module page or update the backend
    console.log(`Starting or continuing module ${moduleId}`);
    // For this example, we'll just select the module
    setSelectedModule(moduleId);
  };
  
  // Calculate if the path is complete (all modules completed)
  const isPathComplete = learningPath ? 
    learningPath.modules.every(module => module.status === 'completed') : 
    false;
  
  if (isLoading || !learningPath) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Find the selected module
  const moduleDetail = learningPath.modules.find(module => module.id === selectedModule) || learningPath.modules[0];
  
  // Calculate overall progress
  const overallProgress = Math.round(
    (learningPath.modules.reduce((acc, module) => acc + (module.progress || 0), 0)) / 
    (learningPath.modules.length * 100) * 100
  );
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-primary-500/10 to-purple-500/10 dark:from-primary-900/30 dark:to-purple-900/30 p-8 rounded-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 bg-grid-pattern"></div>
        <div className="relative z-10">
          <Button 
            variant="outline" 
            size="sm" 
            icon={<ArrowLeftIcon className="h-4 w-4" />}
            onClick={() => navigate('/learning-paths')}
            className="mb-4"
          >
            Back to Learning Paths
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {learningPath.title}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-blue-200 max-w-3xl">
                {learningPath.description}
              </p>
              
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400`}>
                  {learningPath.level}
                </span>
                
                <span className="inline-flex items-center text-gray-500 dark:text-gray-400 text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  {learningPath.duration}
                </span>
                
                <span className="inline-flex items-center text-gray-500 dark:text-gray-400 text-sm">
                  <Users className="h-4 w-4 mr-1" />
                  {learningPath.enrolledCount.toLocaleString()} enrolled
                </span>
                
                <span className="inline-flex items-center text-amber-500 text-sm">
                  {Array(5).fill(0).map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(learningPath.rating) ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600'}`}
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-1">{learningPath.rating.toFixed(1)}</span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <img 
                  src={learningPath.instructor.avatar} 
                  alt={learningPath.instructor.name}
                  className="h-12 w-12 rounded-full object-cover border-2 border-white dark:border-gray-800" 
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {learningPath.instructor.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {learningPath.instructor.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Progress</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {overallProgress}% complete · {learningPath.modules.filter(m => m.status === 'completed').length} of {learningPath.modules.length} modules completed
            </p>
          </div>
          
          {moduleDetail.status === 'in-progress' ? (
            <Button
              variant="primary"
              size="sm"
              icon={<PlayIcon className="h-4 w-4" />}
              onClick={() => startOrContinueModule(moduleDetail.id)}
              className="mt-2 sm:mt-0"
            >
              Continue Learning
            </Button>
          ) : moduleDetail.status === 'available' ? (
            <Button
              variant="gradient"
              size="sm"
              icon={<PlayIcon className="h-4 w-4" />}
              onClick={() => startOrContinueModule(moduleDetail.id)}
              className="mt-2 sm:mt-0"
            >
              Start Next Module
            </Button>
          ) : null}
        </div>
        
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-600 dark:bg-primary-500 rounded-full" 
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module List */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Course Content
          </h2>
          <div className="space-y-3">
            {learningPath.modules.map((module) => (
              <Card 
                key={module.id}
                className={`p-4 cursor-pointer border-l-4 transition-all ${
                  selectedModule === module.id 
                    ? 'border-l-primary-600 dark:border-l-primary-500' 
                    : module.status === 'locked' 
                      ? 'border-l-gray-300 dark:border-l-gray-700 opacity-70' 
                      : 'border-l-transparent hover:border-l-gray-300 dark:hover:border-l-gray-700'
                }`}
                onClick={() => module.status !== 'locked' && setSelectedModule(module.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getModuleStatusColor(module.status)}`}>
                      {getModuleTypeIcon(module.type)}
                    </div>
                    <div>
                      <h3 className={`font-medium ${
                        module.status === 'locked' 
                          ? 'text-gray-500 dark:text-gray-500' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {module.title}
                      </h3>
                      <div className="flex items-center mt-1 text-sm">
                        <Clock className="h-3.5 w-3.5 mr-1 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-500 dark:text-gray-400">
                          {module.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-1.5 rounded-full ${getModuleStatusColor(module.status)}`}>
                    {getModuleStatusIcon(module.status)}
                  </div>
                </div>
                
                {/* Progress bar for in-progress modules */}
                {module.status === 'in-progress' && module.progress !== undefined && (
                  <div className="mt-3 w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-600 dark:bg-primary-500" 
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
        
        {/* Module Detail */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getModuleStatusColor(moduleDetail.status)}`}>
                  {getModuleTypeIcon(moduleDetail.type)}
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {moduleDetail.title}
                </h2>
              </div>
              
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getModuleStatusColor(moduleDetail.status)}`}>
                {moduleDetail.status === 'completed' ? 'Completed' : 
                 moduleDetail.status === 'in-progress' ? 'In Progress' : 
                 moduleDetail.status === 'available' ? 'Available' : 'Locked'}
              </span>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {moduleDetail.description}
            </p>
            
            {moduleDetail.resources && moduleDetail.resources.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Resources
                </h3>
                <div className="space-y-2">
                  {moduleDetail.resources.map(resource => (
                    <a 
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {getResourceTypeIcon(resource.type)}
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {resource.title}
                      </span>
                      <ArrowRight className="h-4 w-4 ml-auto text-gray-500 dark:text-gray-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              {moduleDetail.status === 'completed' ? (
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <div className="flex items-center text-green-600 dark:text-green-400 mb-4 sm:mb-0">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Module Completed</span>
                  </div>
                  <Button
                    variant="outline"
                    icon={<ArrowRight className="h-4 w-4" />}
                    onClick={() => {
                      const nextModule = learningPath.modules.find(m => 
                        m.status === 'in-progress' || 
                        (m.status === 'available' && m.id > moduleDetail.id)
                      );
                      if (nextModule) {
                        setSelectedModule(nextModule.id);
                      }
                    }}
                  >
                    Next Module
                  </Button>
                </div>
              ) : moduleDetail.status === 'in-progress' ? (
                <Button
                  variant="primary"
                  fullWidth
                  icon={<PlayIcon className="h-4 w-4" />}
                  onClick={() => startOrContinueModule(moduleDetail.id)}
                >
                  Continue Learning
                </Button>
              ) : moduleDetail.status === 'available' ? (
                <Button
                  variant="gradient"
                  fullWidth
                  icon={<PlayIcon className="h-4 w-4" />}
                  onClick={() => startOrContinueModule(moduleDetail.id)}
                >
                  Start Module
                </Button>
              ) : (
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Lock className="h-6 w-6 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                  <p className="text-gray-600 dark:text-gray-400">
                    This module is locked. Complete the previous modules to unlock.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Learning Community */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
              Learning Community
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white flex items-center mb-2">
                  <MessageSquare className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                  Discussion Forums
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Join the conversation with other learners to discuss concepts, share insights, and collaborate on projects.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  View Discussions
                </Button>
              </div>
              
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white flex items-center mb-2">
                  <User className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                  Find Study Partners
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Connect with other learners who are at the same stage as you for collaborative learning.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  Find Partners
                </Button>
              </div>
            </div>
            
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex items-center mb-3">
                <User className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                <span className="font-medium text-gray-900 dark:text-white">Study Group Sessions</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Join upcoming study group sessions for this module. Collaborative learning improves retention by up to 70%.
              </p>
              <div className="flex flex-col xs:flex-row gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                >
                  View Sessions
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                >
                  Create Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPathDetail; 