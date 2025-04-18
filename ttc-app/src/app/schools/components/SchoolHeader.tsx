'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { School } from '@/state/api';
import { getTaskProgress, calculateCompletionPercentage } from '@/utils/progressCalculation';

interface SchoolHeaderProps {
  schoolDetails: School;
  onRemove?: () => void;
  showRemoveButton?: boolean;
}

const SchoolHeader: React.FC<SchoolHeaderProps> = ({ 
  schoolDetails, 
  onRemove,
  showRemoveButton = true
}) => {
  const totalTasks = schoolDetails.schoolTasks.length;
  
  // Get tasks with their current status
  const tasks = schoolDetails.schoolTasks.map(schoolTask => ({
    id: schoolTask.id.toString(),
    taskType: schoolTask.taskType,
    isRequired: schoolTask.isRequired,
    status: (schoolTask.userSchoolTasks?.[0]?.status || 'todo').toLowerCase().replace(/\s+/g, '_')
  }));

  // Calculate completed tasks
  const completedTasks = tasks.filter(task => 
    task.status === 'completed'
  ).length;

  const inProgressTasks = tasks.filter(task => 
    task.status === 'in_progress'
  ).length;

  const underReviewTasks = tasks.filter(task => 
    task.status === 'review'
  ).length;

  // Calculate completion percentage
  const completionPercentage = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  console.log('Task Statistics:', {
    total: totalTasks,
    completed: completedTasks,
    inProgress: inProgressTasks,
    underReview: underReviewTasks,
    percentage: completionPercentage,
    tasks: tasks.map(t => ({ id: t.id, status: t.status }))
  });

  console.log('SchoolHeader props:', {
    schoolName: schoolDetails.school,
    showRemoveButton,
    hasOnRemove: !!onRemove,
    onRemoveType: typeof onRemove
  });

  // Initialize minimized state from localStorage
  const [isMinimized, setIsMinimized] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`school-${schoolDetails.school}-minimized`);
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });

  // Update localStorage when minimized state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `school-${schoolDetails.school}-minimized`,
        JSON.stringify(isMinimized)
      );
    }
  }, [isMinimized, schoolDetails.school]);

  const handleRemoveClick = () => {
    console.log('Delete button clicked for school:', schoolDetails.school);
    console.log('School ID:', schoolDetails.id);
    console.log('onRemove prop exists:', !!onRemove);
    console.log('onRemove type:', typeof onRemove);
    if (typeof onRemove === 'function') {
      onRemove();
    } else {
      console.warn('onRemove is not a function:', onRemove);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 shadow rounded-lg relative`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {schoolDetails.school}
          </h2>
          <div className="flex items-center gap-2">
            {showRemoveButton && onRemove && (
              <button
                onClick={handleRemoveClick}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                title="Remove school"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
            )}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              {isMinimized ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
          </div>
        </div>
        
        {/* Content section - animated height and opacity */}
        <div 
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isMinimized ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
          }`}
        >
          <div className="p-4 space-y-4">
            {schoolDetails.personal_statement && (
              <div>
                <h2 className={`font-semibold text-xl dark:text-white`}>Personal Statement</h2>
                <p className={`mt-1 text-gray-600 dark:text-gray-200`}>{schoolDetails.personal_statement}</p>
              </div>
            )}
            {schoolDetails.diversity_statement && (
              <div>
                <h2 className={`font-semibold text-xl dark:text-gray-200`}>Diversity Statement</h2>
                <p className={`mt-1 text-gray-600 dark:text-gray-200`}>{schoolDetails.diversity_statement}</p>
              </div>
            )}
            {schoolDetails.optional_statement_prompt && (
              <div>
                <h2 className={`font-semibold text-xl dark:text-gray-200`}>Optional Statement</h2>
                <p className={`mt-1 text-gray-600 dark:text-gray-200`}>{schoolDetails.optional_statement_prompt}</p>
              </div>
            )}
            {schoolDetails.letters_of_recommendation && (
              <div>
                <h2 className={`font-semibold  text-xl dark:text-gray-200`}>Letters of Recommendation</h2>
                <p className={`mt-1 text-gray-600 dark:text-gray-200`}>{schoolDetails.letters_of_recommendation}</p>
              </div>
            )}
            {schoolDetails.resume && (
              <div>
                <h2 className={`font-semibold text-xl dark:text-gray-200`}>Resume Requirements</h2>
                <p className={`mt-1 text-gray-600 dark:text-gray-200`}>{schoolDetails.resume}</p>
              </div>
            )}
            {schoolDetails.application_fee && (
              <div>
                <h2 className={`font-semibold text-xl dark:text-gray-200`}>Application Fee</h2>
                <p className={`mt-1 text-gray-600 dark:text-gray-200`}>{schoolDetails.application_fee}</p>
              </div>
            )}
            {schoolDetails.interviews && (
              <div>
                <h2 className={`font-semibold text-xl dark:text-gray-200`}>Interview Information</h2>
                <p className={`mt-1 text-gray-600 dark:text-gray-200`}>{schoolDetails.interviews}</p>
              </div>
            )}
            {schoolDetails.note && (
              <div>
                <h2 className={`font-semibold text-xl dark:text-gray-200`}>Additional Notes</h2>
                <p className={`mt-1 text-gray-600 dark:text-gray-200`}>{schoolDetails.note}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Progress Bar - always visible */}
        <div className="w-full border-t">
          <div className="relative h-12 bg-gray-100 dark:bg-gray-700">
            {/* Progress Fill */}
            <div
              className={`absolute top-0 left-0 h-full transition-all duration-300 ${
                completionPercentage === 100
                  ? 'bg-gradient-to-r from-green-400 to-green-500'
                  : completionPercentage > 60
                    ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                    : completionPercentage > 30
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                      : 'bg-gradient-to-r from-gray-300 to-gray-400'
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
            {/* Progress Stats */}
            <div className="absolute inset-0 flex items-center  justify-between px-4">
              <div className="flex items-center gap-4">
                  <span className={`text-sm font-semibold text-gray-700 dark:text-gray-500 drop-shadow-sm`}>
                  {completionPercentage}% Complete
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className={`text-gray-600 dark:text-gray-500`}>Completed: {completedTasks}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className={`text-gray-600 dark:text-gray-500`}>Review: {underReviewTasks}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    <span className={`text-gray-600 dark:text-gray-500`}>In Progress: {inProgressTasks}</span>
                  </span>
                </div>
              </div>
                <span className={`text-sm text-gray-500 dark:text-gray-200`}>
                Total Tasks: {totalTasks}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SchoolHeader };
