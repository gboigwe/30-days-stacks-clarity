// Task creation form with advanced features
'use client';

import { useState } from 'react';
import { CreateTaskData } from '@/types/tasks';
import { DollarSign, FileText, Tag, TrendingUp, CheckCircle } from 'lucide-react';

interface CreateTaskFormProps {
  onSubmit: (taskData: CreateTaskData) => Promise<void>;
  isSubmitting: boolean;
}

const categories = [
  'development',
  'design',
  'writing',
  'marketing',
  'research',
  'testing',
  'other'
];

const difficulties = [
  { value: 1, label: 'Beginner', description: 'Simple tasks, great for newcomers' },
  { value: 2, label: 'Easy', description: 'Basic skills required' },
  { value: 3, label: 'Medium', description: 'Moderate experience needed' },
  { value: 4, label: 'Hard', description: 'Advanced skills required' },
  { value: 5, label: 'Expert', description: 'Professional expertise needed' }
];

export default function CreateTaskForm({ onSubmit, isSubmitting }: CreateTaskFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'development',
    difficulty: 3,
    reward: '1.0'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    const reward = parseFloat(formData.reward);
    if (isNaN(reward) || reward <= 0) {
      newErrors.reward = 'Invalid reward amount';
    } else if (reward < 0.1) {
      newErrors.reward = 'Minimum reward is 0.1 STX';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const taskData: CreateTaskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        difficulty: formData.difficulty,
        reward: parseFloat(formData.reward)
      };

      await onSubmit(taskData);

      // Reset form on success
      setFormData({
        title: '',
        description: '',
        category: 'development',
        difficulty: 3,
        reward: '1.0'
      });
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'difficulty' ? parseInt(value) : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Task</h2>
          <p className="text-gray-600">
            Create a task for the community to complete. Your STX will be held in escrow until the task is completed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 mr-1" />
              Task Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Build a React component library"
              className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-stacks-purple focus:border-transparent ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              maxLength={100}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            <p className="mt-1 text-sm text-gray-500">{formData.title.length}/100 characters</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 mr-1" />
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed requirements, deliverables, and any specific instructions..."
              rows={5}
              className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-stacks-purple focus:border-transparent resize-none ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              maxLength={500}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            <p className="mt-1 text-sm text-gray-500">{formData.description.length}/500 characters</p>
          </div>

          {/* Category and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Tag className="h-4 w-4 mr-1" />
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-stacks-purple focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="difficulty" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <TrendingUp className="h-4 w-4 mr-1" />
                Difficulty
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-stacks-purple focus:border-transparent"
              >
                {difficulties.map(diff => (
                  <option key={diff.value} value={diff.value}>
                    {diff.label} - {diff.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* STX Reward */}
          <div>
            <label htmlFor="reward" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 mr-1" />
              STX Reward *
            </label>
            <div className="relative">
              <input
                type="number"
                id="reward"
                name="reward"
                value={formData.reward}
                onChange={handleChange}
                placeholder="1.0"
                step="0.1"
                min="0.1"
                className={`w-full p-3 pr-12 border rounded-md focus:ring-2 focus:ring-stacks-purple focus:border-transparent ${
                  errors.reward ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                STX
              </span>
            </div>
            {errors.reward && <p className="mt-1 text-sm text-red-600">{errors.reward}</p>}
            <p className="mt-1 text-sm text-gray-500">
              Minimum: 0.1 STX. Your STX will be held in escrow until task completion.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-stacks-purple hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-md focus-ring disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Task...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Create Task & Lock {formData.reward} STX
                </>
              )}
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>How it works:</strong> Your STX reward will be locked in escrow when you create the task. 
              Community members can apply, you assign the task, and payment is released upon completion.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}