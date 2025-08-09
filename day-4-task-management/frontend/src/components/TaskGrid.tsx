// Task display grid with filtering - implementing blog patterns
'use client';

import { Task } from '@/types/tasks';
import TaskCard from './TaskCard';
import { Briefcase } from 'lucide-react';

interface TaskGridProps {
  title: string;
  tasks: Task[];
  emptyMessage: string;
  onTaskAction?: (taskId: string, action: string) => void;
}

export default function TaskGrid({ title, tasks, emptyMessage, onTaskAction }: TaskGridProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="text-sm text-gray-600">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onAction={onTaskAction}
          />
        ))}
      </div>
    </div>
  );
}