import React from 'react';
import { format, isToday, isTomorrow, parseISO, addDays } from 'date-fns';

/**
 * TaskDragPreview Component
 * Custom drag preview component that shows a ghost image of the task being dragged
 */
const TaskDragPreview = ({ title, completed, revisitDate }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = addDays(parseISO(dateString), 1);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MM/dd');
  };

  return (
    <div className="task-preview">
      <div className="task-content">
        <span className={`task-title ${completed ? 'completed' : ''}`}>
          {title}
        </span>
        {revisitDate && (
          <span className="task-date-label">
            {formatDate(revisitDate)}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskDragPreview;
