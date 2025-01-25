import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
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

  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    drop: (draggedItem) => {
      const targetIndex = tasks.length;
      if (draggedItem.section !== id) {
        const additionalData = draggedItem.revisitDate ? { revisitDate: draggedItem.revisitDate } : {};
        onMoveTask(draggedItem, id, targetIndex, additionalData);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  return (
    <div 
      ref={drop}
      className={`task-section ${isOver ? 'drop-target' : ''}`}
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
          {tasks.map((task, index) => (
            <Task
              key={task.id}
              {...task}
              index={index}
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