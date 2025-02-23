'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface SchoolCardProps {
  schoolName: string;
  completionPercentage: number;
  tasksCompleted: number;
  totalTasks: number;
}

const SchoolCard: React.FC<SchoolCardProps> = ({
  schoolName,
  completionPercentage,
  tasksCompleted,
  totalTasks,
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/schools/${encodeURIComponent(schoolName)}`);
  };

  const getStatusColor = () => {
    if (completionPercentage === 100) return 'bg-gradient-to-r from-green-400 to-green-500';
    if (completionPercentage > 60) return 'bg-gradient-to-r from-blue-400 to-blue-500';
    if (completionPercentage > 30) return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
    return 'bg-gradient-to-r from-gray-300 to-gray-400';
  };

  const getStatusText = () => {
    if (completionPercentage === 100) return 'Completed';
    if (completionPercentage > 60) return 'Almost Done';
    if (completionPercentage > 30) return 'In Progress';
    return 'Just Started';
  };

  const getStatusBadgeColor = () => {
    if (completionPercentage === 100) return 'bg-green-100 text-green-800';
    if (completionPercentage > 60) return 'bg-blue-100 text-blue-800';
    if (completionPercentage > 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div
      onClick={handleClick}
      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-200 hover:border-blue-200"
    >
      {/* Header with gradient background */}
      <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100 group-hover:from-blue-50 group-hover:to-white transition-colors duration-300">
        <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-800 transition-colors duration-300">{schoolName}</h2>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Tasks Progress */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-medium text-gray-600">Tasks Completed</span>
          <span className="text-sm font-bold text-gray-800 bg-gray-50 px-3 py-1 rounded-full">{tasksCompleted}/{totalTasks}</span>
        </div>

        {/* Status Badge */}
        <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium mb-6 ${getStatusBadgeColor()}`}>
          <div className="w-1.5 h-1.5 rounded-full mr-2 bg-current opacity-75"></div>
          {getStatusText()}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div
              className={`absolute top-0 left-0 h-full transition-all duration-300 ${getStatusColor()}`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="mt-3 text-right">
            <span className="text-sm font-semibold text-gray-700">
              {completionPercentage}% Complete
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolCard;
