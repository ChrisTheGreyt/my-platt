export const getTaskProgress = (status: string): number => {
  switch (status) {
    case 'To Do': return 0;
    case 'In Progress': return 0.33;
    case 'Under Review': return 0.67;
    case 'Completed': return 1;
    default: return 0;
  }
};

export const calculateCompletionPercentage = (tasks: { status: string }[]): number => {
  if (!tasks.length) return 0;
  
  const totalProgress = tasks.reduce((total, task) => {
    return total + getTaskProgress(task.status);
  }, 0);
  
  return Math.round((totalProgress / tasks.length) * 100);
};