import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Task from './Task';

const TaskSection = ({ 
  id, 
  title, 
  tasks = [], 
  onMoveTask,
  onToggleCompletion,
  onDeleteTask,
  onSelectTask,
  selectedTaskId
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div 
      className="task-section"
      data-section-id={id}
    >
      <div 
        className="section-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <ChevronRight 
          className={`section-caret ${isExpanded ? 'rotate-90' : ''}`} 
          size={16} 
        />
        <span>{title}</span>
      </div>
      {isExpanded && (
        <div className="section-content">
          {tasks.map((task) => (
            <Task
              key={task.id}
              {...task}
              onMoveTask={onMoveTask}
              onToggleCompletion={onToggleCompletion}
              onDeleteTask={onDeleteTask}
              onSelectTask={onSelectTask}
              selected={task.id === selectedTaskId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskSection;