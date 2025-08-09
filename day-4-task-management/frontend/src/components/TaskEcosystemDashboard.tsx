// Multi-user dashboard with advanced integration patterns - from the blog
'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useOptimisticTaskManager } from '@/hooks/useOptimisticTaskManager';
import { useUserProfiles } from '@/hooks/useUserProfiles';
import TaskGrid from './TaskGrid';
import CreateTaskForm from './CreateTaskForm';
import UserProfileCard from './UserProfileCard';
import ActivityFeed from './ActivityFeed';
import TransactionMonitor from './TransactionMonitor';
import { WalletInfo } from './WalletConnection';
import { Briefcase, Plus, User, Activity, Search, Filter } from 'lucide-react';

type TabType = 'my-tasks' | 'community' | 'create' | 'profile';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-colors
        ${active 
          ? 'bg-stacks-purple text-white shadow-md' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
        }
      `}
    >
      {children}
    </button>
  );
}

export default function TaskEcosystemDashboard() {
  const { wallet, connectWallet } = useWallet();
  const { allTasks, createTaskOptimistically, applyForTaskOptimistically, completeTaskOptimistically, isSubmitting, error, clearError } = useOptimisticTaskManager();
  const { currentUserProfile } = useUserProfiles();
  const [selectedView, setSelectedView] = useState<TabType>('my-tasks');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  if (!wallet.isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 stacks-gradient rounded-full flex items-center justify-center">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to Task Ecosystem
          </h1>
          
          <p className="text-gray-600 mb-8">
            Join the multi-user task management community. Create tasks, collaborate with others, and earn STX rewards.
          </p>
          
          <button
            onClick={connectWallet}
            className="w-full stacks-gradient text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity focus-ring"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  // Smart filtering based on user's relationship to tasks (from blog)
  const myActiveTasks = allTasks.filter(task => 
    (task.creator === wallet.address || task.assignee === wallet.address) && !task.isOptimistic
  );
  
  const myCompletedTasks = allTasks.filter(task =>
    (task.creator === wallet.address || task.assignee === wallet.address) && 
    task.status === 'completed'
  );

  const availableToMe = allTasks.filter(task =>
    task.creator !== wallet.address && 
    !task.assignee && 
    task.status === 'open' &&
    !task.isOptimistic
  );

  // Filter tasks based on search and category
  const filteredTasks = (taskList: typeof allTasks) => {
    return taskList.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const handleTaskAction = async (taskId: string, action: string) => {
    clearError();
    try {
      switch (action) {
        case 'apply':
          await applyForTaskOptimistically(taskId, 'I am interested in this task');
          break;
        case 'complete':
          await completeTaskOptimistically(taskId);
          break;
        default:
          console.log(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error('Task action failed:', error);
    }
  };

  const categories = ['all', 'development', 'design', 'writing', 'marketing', 'research', 'other'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 stacks-gradient rounded-lg flex items-center justify-center mr-3">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Task Ecosystem</h1>
            </div>
            <WalletInfo />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-4 mb-8">
          <TabButton 
            active={selectedView === 'my-tasks'}
            onClick={() => setSelectedView('my-tasks')}
          >
            <Briefcase className="h-4 w-4 mr-2" />
            My Tasks ({myActiveTasks.length})
          </TabButton>
          <TabButton 
            active={selectedView === 'community'}
            onClick={() => setSelectedView('community')}
          >
            <Activity className="h-4 w-4 mr-2" />
            Community ({availableToMe.length} available)
          </TabButton>
          <TabButton 
            active={selectedView === 'create'}
            onClick={() => setSelectedView('create')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </TabButton>
          <TabButton 
            active={selectedView === 'profile'}
            onClick={() => setSelectedView('profile')}
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabButton>
        </div>

        {/* Search and filters */}
        {(selectedView === 'my-tasks' || selectedView === 'community') && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 mb-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stacks-purple focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-stacks-purple focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-start">
              <p className="text-red-800 text-sm">{error}</p>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Dynamic content based on view */}
        <div className="animate-fade-in">
          {selectedView === 'my-tasks' && (
            <TaskGrid 
              title="My Active Tasks"
              tasks={filteredTasks(myActiveTasks)}
              emptyMessage="No active tasks. Create one or browse available tasks!"
              onTaskAction={handleTaskAction}
            />
          )}

          {selectedView === 'community' && (
            <TaskGrid 
              title="Available Community Tasks"
              tasks={filteredTasks(availableToMe)}
              emptyMessage="No available tasks right now. Check back later!"
              onTaskAction={handleTaskAction}
            />
          )}

          {selectedView === 'create' && (
            <CreateTaskForm 
              onSubmit={createTaskOptimistically}
              isSubmitting={isSubmitting}
            />
          )}

          {selectedView === 'profile' && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <UserProfileCard profile={currentUserProfile} />
              </div>
              <div>
                <ActivityFeed />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Monitor */}
      <TransactionMonitor />
    </div>
  );
}